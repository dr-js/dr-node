import { readFileSync } from 'fs'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'

const createResponderStatusVisualize = (statusFetchUrl = '/status-state') => {
  const HTML_TEMPLATE_WITH_SCRIPT = readFileSync(require.resolve('./visualize-template.html'), 'utf8')
    .replace(`"{SCRIPT_DR_BROWSER_JS}"`, readFileSync(require.resolve('dr-js/library/Dr.browser'), 'utf8'))
    .replace(`"{STATUS_FETCH_URL}"`, JSON.stringify(statusFetchUrl))

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
