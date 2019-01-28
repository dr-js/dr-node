import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderSendBufferCompress, prepareBufferDataAsync } from 'dr-js/module/node/server/Responder/Send'

import { configureStatusCollector } from './configure/configureStatusCollector'
import { createResponderStatusState, createResponderStatusCollect } from './responder'
import { getHTML } from './HTML'

const DEFAULT_AUTH_KEY = 'auth-check-code'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  statusCollectPath,
  statusCollectUrl,
  statusCollectInterval,

  // TODO: maybe less specific, or optional?
  urlAuthCheck = '',
  authKey = DEFAULT_AUTH_KEY,
  createResponderCheckAuth = ({ responderNext }) => responderNext,
  generateAuth = () => ''
}) => {
  const URL_HTML = `${routePrefix}/status-visualize`
  const URL_STATUS_STATE = `${routePrefix}/status-state`
  const URL_STATUS_COLLECT = `${routePrefix}/status-collect`

  const { factDatabase, timer, collectStatus } = await configureStatusCollector({
    collectPath: statusCollectPath,
    collectUrl: statusCollectUrl,
    collectInterval: statusCollectInterval,
    getExtraHeaders: async () => ({ [ authKey ]: await generateAuth() })
  })

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    URL_AUTH_CHECK: urlAuthCheck,
    URL_STATUS_STATE,
    CONFIG_RENDER_PRESET: __DEV__
      ? {
        StatusRaw: { positionScale: 8, horizontalDelta: 20, mergeGapMax: 0 },
        Merge0: { positionScale: 4, horizontalDelta: 60, mergeGapMax: 0 },
        Merge1: { positionScale: 2, horizontalDelta: 120, mergeGapMax: 0 },
        Merge2: { positionScale: 1, horizontalDelta: 360, mergeGapMax: 0 }
      }
      : {
        StatusRaw: { positionScale: 0.05, horizontalDelta: 60 * 60, mergeGapMax: (5 + 1) * 60 },
        Merge0: { positionScale: 0.01, horizontalDelta: 6 * 60 * 60, mergeGapMax: (20 + 1) * 60 },
        Merge1: { positionScale: 0.001, horizontalDelta: 24 * 60 * 60, mergeGapMax: (60 + 1) * 60 },
        Merge2: { positionScale: 0.0005, horizontalDelta: 14 * 24 * 60 * 60, mergeGapMax: (24 + 1) * 60 * 60 }
      }
  })), BASIC_EXTENSION_MAP.html)

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_STATUS_STATE, 'GET', createResponderCheckAuth({
      responderNext: createResponderStatusState({ getStatusState: factDatabase.getState })
    }) ],
    [ URL_STATUS_COLLECT, 'POST', createResponderCheckAuth({
      responderNext: createResponderStatusCollect({ addStatus: factDatabase.add })
    }) ]
  ]

  return {
    URL_HTML,
    URL_STATUS_STATE,
    URL_STATUS_COLLECT,
    routeList,
    factDatabase,
    timer,
    collectStatus
  }
}

export { configureFeaturePack }
