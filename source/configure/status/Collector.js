import { clock, getTimestamp, createTimer } from 'dr-js/module/common/time'
import { withRetryAsync, lossyAsync } from 'dr-js/module/common/function'
import { roundFloat } from 'dr-js/module/common/math/base'
import { fetch } from 'dr-js/module/node/net'
import { createFactDatabase, tryDeleteExtraCache } from 'dr-js/module/node/module/FactDatabase'
import { addExitListenerAsync, addExitListenerSync } from 'dr-js/module/node/system/ExitListener'
import { applyFact } from './applyStatusFact'

const FETCH_RETRY_COUNT = 3

const configureStatusCollector = async ({
  collectPath: pathFactDirectory,
  collectUrl,
  collectInterval = __DEV__ ? 1000 : 5 * 60 * 1000,
  getExtraHeaders
}) => {
  const factDB = await createFactDatabase({
    pathFactDirectory,
    applyFact: applyFact, // (state, fact) => ({ ...state, ...fact }),
    onError: (error) => console.error('[FactDatabase]', error)
  })
  addExitListenerSync(factDB.end)
  addExitListenerAsync(async () => {
    factDB.end()
    await factDB.getSaveFactCachePromise()
  })
  await tryDeleteExtraCache({ pathFactDirectory })

  const collectStatus = lossyAsync(async () => {
    __DEV__ && console.log('[fetch] try get status')
    await withRetryAsync(async (retryCount) => {
      __DEV__ && retryCount && console.log(`[fetch] retryCount: ${retryCount}`)
      const timeFetchStart = clock()
      const { ok, json } = await fetch(collectUrl, { headers: getExtraHeaders ? getExtraHeaders() : {} })
      if (!ok) throw new Error('fetch no ok')
      const timeOk = roundFloat(clock() - timeFetchStart)
      const status = await json()
      const timeEnd = roundFloat(clock() - timeFetchStart)
      __DEV__ && console.log('[fetch] pass, get status', status.timestamp, getTimestamp())
      factDB.add({ timestamp: getTimestamp(), retryCount, status, timeOk, timeEnd })
    }, FETCH_RETRY_COUNT, __DEV__ ? 50 : 500)
  }, (error) => {
    console.error('[fetch] failed', collectUrl, error)
    factDB.add({ timestamp: getTimestamp(), error: error.toString() || 'fetch error' })
  }).trigger

  const timer = createTimer({ func: collectStatus, delay: collectInterval })

  return { factDB, timer, collectStatus }
}

export { configureStatusCollector }
