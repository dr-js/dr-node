import { transformCache } from 'dr-js/module/common/immutable/function'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'

import { prepareBufferDataHTML, prepareBufferDataJSON } from 'source/responder/function'
import { getHTML } from './visualizeHTML'

const createResponderStatusVisualize = async (
  urlStatusFetch = '/status-state',
  urlAuthCheck = '/auth'
) => {
  const bufferData = await prepareBufferDataHTML(Buffer.from(getHTML({
    URL_STATUS_FETCH: urlStatusFetch,
    URL_AUTH_CHECK: urlAuthCheck,
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
  })))
  return (store) => responderSendBufferCompress(store, bufferData)
}

const createResponderStatusState = (getStatusState) => {
  const getBufferDataAsync = transformCache((statusState) => prepareBufferDataJSON(Buffer.from(JSON.stringify(statusState))))
  return async (store) => responderSendBufferCompress(store, await getBufferDataAsync(getStatusState()))
}

export {
  createResponderStatusVisualize,
  createResponderStatusState
}
