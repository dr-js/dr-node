import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'

import { createGetStatusReport } from 'source/task/getStatusReport'

const createResponderStatusReport = (getStatusReport = createGetStatusReport()) => (store) => responderSendBufferCompress(store, {
  buffer: Buffer.from(JSON.stringify(getStatusReport())),
  type: BASIC_EXTENSION_MAP.json
})

export { createResponderStatusReport }
