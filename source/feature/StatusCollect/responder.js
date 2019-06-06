import { clock, getTimestamp } from 'dr-js/module/common/time'
import { roundFloat } from 'dr-js/module/common/math/base'
import { transformCache } from 'dr-js/module/common/immutable/function'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendBufferCompress, prepareBufferDataAsync } from 'dr-js/module/node/server/Responder/Send'

const createResponderStatusState = ({ getStatusState }) => {
  const getBufferDataAsync = transformCache((statusState) => prepareBufferDataAsync(Buffer.from(JSON.stringify(statusState))), BASIC_EXTENSION_MAP.json)
  return async (store) => responderSendBufferCompress(store, await getBufferDataAsync(getStatusState()))
}

const createResponderStatusCollect = ({ addStatus }) => async (store) => {
  const status = await store.requestJSON()
  __DEV__ && console.log(`statusBuffer`, status)
  addStatus({
    timestamp: getTimestamp(),
    retryCount: 0, // TODO: strange value
    status,
    timeOk: 0, // TODO: strange value
    timeDownload: roundFloat(clock() - store.getState().time)
  })
  return responderEndWithStatusCode(store, { statusCode: 200 })
}

export {
  createResponderStatusState,
  createResponderStatusCollect
}
