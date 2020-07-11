import { clock, getTimestamp, createTimer } from '@dr-js/core/module/common/time'
import { withRetryAsync, lossyAsync } from '@dr-js/core/module/common/function'
import { roundFloat } from '@dr-js/core/module/common/math/base'

import { createFactDatabaseExot, tryDeleteExtraCache } from 'source/module/FactDatabase'

import { applyStatFact } from './module/applyStatFact'

const STAT_COLLECT_INTERVAL = __DEV__ ? 1000 : 5 * 60 * 1000
const FETCH_RETRY_COUNT = 3

const createStatCollectExot = ({
  id = 'exot:stat-collect',
  collectPath: pathFactDirectory,
  collectUrl,
  collectInterval = STAT_COLLECT_INTERVAL,
  authFetch
}) => {
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
  const factDatabase = createFactDatabaseExot({
    id, // use same id
    pathFactDirectory,
    applyFact: applyStatFact // (state, fact) => ({ ...state, ...fact }),
  })

  const up = async (onExotError) => {
    await factDatabase.up(onExotError)
    await tryDeleteExtraCache({ pathFactDirectory })
  }
  const down = () => {
    timer.stop()
    return factDatabase.down()
  }

  return {
    ...factDatabase, up, down, // the factDatabase Exot is merge, so do not need separate management
    timer,
    collectStat
  }
}

export { createStatCollectExot }
