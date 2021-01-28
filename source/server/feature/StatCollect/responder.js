import { clock, getTimestamp } from '@dr-js/core/module/common/time'
import { roundFloat } from '@dr-js/core/module/common/math/base'
import { transformCache } from '@dr-js/core/module/common/immutable/function'
import { BASIC_EXTENSION_MAP } from '@dr-js/core/module/common/module/MIME'
import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'
import { responderSendBufferCompress, prepareBufferData } from '@dr-js/core/module/node/server/Responder/Send'

import { getRequestJSON } from 'source/module/RequestCommon'

const createResponderStatState = ({ getStatState }) => {
  const getBufferDataAsync = transformCache((statState) => prepareBufferData(Buffer.from(JSON.stringify(statState))), BASIC_EXTENSION_MAP.json)
  return async (store) => responderSendBufferCompress(store, await getBufferDataAsync(getStatState()))
}

const createResponderStatCollect = ({ addStat }) => async (store) => {
  const stat = await getRequestJSON(store)
  __DEV__ && console.log('statBuffer', stat)
  addStat({
    timestamp: getTimestamp(),
    retryCount: 0, // TODO: strange value
    stat,
    timeOk: 0, // TODO: strange value
    timeDownload: roundFloat(clock() - store.getState().time)
  })
  return responderEndWithStatusCode(store, { statusCode: 200 })
}

export {
  createResponderStatState,
  createResponderStatCollect
}
