import { clock, getTimestamp, createTimer } from 'dr-js/module/common/time'
import { withRetryAsync, lossyAsync } from 'dr-js/module/common/function'
import { roundFloat } from 'dr-js/module/common/math/base'
import { createFactDatabase, tryDeleteExtraCache } from 'dr-js/module/node/module/FactDatabase'
import { addExitListenerAsync, addExitListenerSync } from 'dr-js/module/node/system/ExitListener'
import { applyStatusFact } from './applyStatusFact'

const STATUS_COLLECT_INTERVAL = __DEV__ ? 1000 : 5 * 60 * 1000
const FETCH_RETRY_COUNT = 3

const configureStatusCollector = async ({
  collectPath: pathFactDirectory,
  collectUrl,
  collectInterval = STATUS_COLLECT_INTERVAL,
  authFetch
}) => {
  const factDatabase = await createFactDatabase({
    pathFactDirectory,
    applyFact: applyStatusFact, // (state, fact) => ({ ...state, ...fact }),
    onError: (error) => console.error('[collectStatus][FactDatabase]', error)
  })
  addExitListenerSync(factDatabase.end)
  addExitListenerAsync(async () => {
    factDatabase.end()
    await factDatabase.getSaveFactCachePromise()
  })
  await tryDeleteExtraCache({ pathFactDirectory })

  const collectStatus = lossyAsync(async () => {
    __DEV__ && console.log('[fetch] try get status')
    await withRetryAsync(async (retryCount) => {
      __DEV__ && retryCount && console.log(`[fetch] retryCount: ${retryCount}`)
      const timeFetchStart = clock()
      const { ok, json } = await authFetch(collectUrl)
      if (!ok) throw new Error('[collectStatus] fetch not ok')
      const timeOk = roundFloat(clock() - timeFetchStart)
      const status = await json()
      const timeDownload = roundFloat(clock() - timeFetchStart - timeOk)
      __DEV__ && console.log('[fetch] pass, get status', status.timestamp, getTimestamp())
      factDatabase.add({ timestamp: getTimestamp(), retryCount, status, timeOk, timeDownload })
    }, FETCH_RETRY_COUNT, __DEV__ ? 50 : 500)
  }, (error) => {
    console.error('[collectStatus] fetch failed', collectUrl, error)
    factDatabase.add({ timestamp: getTimestamp(), error: error.toString() || 'fetch error' })
  }).trigger

  const timer = createTimer({ func: collectStatus, delay: collectInterval })

  return { factDatabase, timer, collectStatus }
}

export { configureStatusCollector }
