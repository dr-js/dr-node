import { BASIC_EXTENSION_MAP } from '@dr-js/core/module/common/module/MIME'
import { responderSendBufferCompress, prepareBufferDataAsync } from '@dr-js/core/module/node/server/Responder/Send'

import { createStatCollectExot } from 'source/module/Stat/StatCollect'

import { createResponderStatState, createResponderStatCollect } from './responder' // TODO: move to ActionJSON?
import { getHTML } from './HTML'

const setup = async ({
  name = 'feature:stat-collect',
  logger, routePrefix = '',
  featureAuth: { authPack: { authFetch }, createResponderCheckAuth, URL_AUTH_CHECK_ABBR },

  statCollectPath,
  statCollectUrl,
  statCollectInterval,

  URL_HTML = `${routePrefix}/stat-visualize`,
  URL_STAT_STATE = `${routePrefix}/stat-state`,
  URL_STAT_COLLECT = `${routePrefix}/stat-collect`
}) => {
  const statCollectExot = createStatCollectExot({ // TODO: move to exotList
    collectPath: statCollectPath,
    collectUrl: statCollectUrl,
    collectInterval: statCollectInterval,
    authFetch
  })

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    URL_AUTH_CHECK_ABBR,
    URL_STAT_STATE,
    CONFIG_RENDER_PRESET: __DEV__
      ? {
        StatRaw: { positionScale: 8, horizontalDelta: 20, mergeGapMax: 0 },
        Merge0: { positionScale: 4, horizontalDelta: 60, mergeGapMax: 0 },
        Merge1: { positionScale: 2, horizontalDelta: 120, mergeGapMax: 0 },
        Merge2: { positionScale: 1, horizontalDelta: 360, mergeGapMax: 0 }
      }
      : {
        StatRaw: { positionScale: 0.05, horizontalDelta: 60 * 60, mergeGapMax: (5 + 1) * 60 },
        Merge0: { positionScale: 0.01, horizontalDelta: 6 * 60 * 60, mergeGapMax: (20 + 1) * 60 },
        Merge1: { positionScale: 0.001, horizontalDelta: 24 * 60 * 60, mergeGapMax: (60 + 1) * 60 },
        Merge2: { positionScale: 0.0005, horizontalDelta: 14 * 24 * 60 * 60, mergeGapMax: (24 + 1) * 60 * 60 }
      }
  })), BASIC_EXTENSION_MAP.html)

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_STAT_STATE, 'GET', createResponderCheckAuth({
      responderNext: createResponderStatState({ getStatState: statCollectExot.getState })
    }) ],
    [ URL_STAT_COLLECT, 'POST', createResponderCheckAuth({
      responderNext: createResponderStatCollect({ addStat: statCollectExot.add })
    }) ]
  ]

  return {
    URL_HTML,
    URL_STAT_STATE,
    URL_STAT_COLLECT,
    routeList,
    exotList: [ statCollectExot ],
    name
  }
}

export { setup }
