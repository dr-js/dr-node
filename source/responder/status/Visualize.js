import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'

import { getHTML } from './visualizeHTML'

const createResponderStatusVisualize = (
  statusFetchUrl = '/status-state',
  authCheckUrl = '/auth'
) => {
  const HTML_TEMPLATE_WITH_SCRIPT = getHTML({
    STATUS_FETCH_URL: statusFetchUrl,
    AUTH_CHECK_URL: authCheckUrl
  })

  return (store) => responderSendBufferCompress(store, {
    buffer: Buffer.from(HTML_TEMPLATE_WITH_SCRIPT),
    type: BASIC_EXTENSION_MAP.html
  })
}

const createResponderStatusState = (getStatusState) => (store) => responderSendBufferCompress(store, {
  buffer: Buffer.from(JSON.stringify(getStatusState())),
  type: BASIC_EXTENSION_MAP.json
})

export {
  createResponderStatusVisualize,
  createResponderStatusState
}
