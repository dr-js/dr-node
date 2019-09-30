import { clock, getTimestamp, createTimer } from '@dr-js/core/module/common/time'
import { withRetryAsync, lossyAsync } from '@dr-js/core/module/common/function'
import { roundFloat } from '@dr-js/core/module/common/math/base'

import { addExitListenerAsync, addExitListenerSync } from '@dr-js/core/module/node/system/ExitListener'

import { createFactDatabase, tryDeleteExtraCache } from 'source/module/FactDatabase'

import { applyStatFact } from './module/applyStatFact'

const STAT_COLLECT_INTERVAL = __DEV__ ? 1000 : 5 * 60 * 1000
const FETCH_RETRY_COUNT = 3

const configureStatCollect = async ({
  collectPath: pathFactDirectory,
  collectUrl,
  collectInterval = STAT_COLLECT_INTERVAL,
  authFetch
}) => {
  const factDatabase = await createFactDatabase({
    pathFactDirectory,
    applyFact: applyStatFact, // (state, fact) => ({ ...state, ...fact }),
    onError: (error) => console.error('[collectStat][FactDatabase]', error)
  })
  addExitListenerSync(factDatabase.end)
  addExitListenerAsync(async () => {
    factDatabase.end()
    await factDatabase.getSaveFactCachePromise()
  })
  await tryDeleteExtraCache({ pathFactDirectory })

  const collectStat = lossyAsync(async () => {
    __DEV__ && console.log('[fetch] try get stat')
    await withRetryAsync(async (retryCount) => {
      __DEV__ && retryCount && console.log(`[fetch] retryCount: ${retryCount}`)
      const timeFetchStart = clock()
      const { json } = await authFetch(collectUrl)
      const timeOk = roundFloat(clock() - timeFetchStart)
      const stat = await json()
      const timeDownload = roundFloat(clock() - timeFetchStart - timeOk)
      __DEV__ && console.log('[fetch] pass, get stat', stat.timestamp, getTimestamp())
      factDatabase.add({ timestamp: getTimestamp(), retryCount, stat, timeOk, timeDownload })
    }, FETCH_RETRY_COUNT, __DEV__ ? 50 : 500)
  }, (error) => {
    console.error('[collectStat] fetch failed', collectUrl, error)
    factDatabase.add({ timestamp: getTimestamp(), error: String(error) || 'fetch error' })
  }).trigger

  const timer = createTimer({ func: collectStat, delay: collectInterval })

  return { factDatabase, timer, collectStat }
}

export { configureStatCollect }
