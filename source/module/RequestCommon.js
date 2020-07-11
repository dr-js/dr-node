import { readableStreamToBufferAsync } from '@dr-js/core/module/node/data/Stream'
import { parseCookieString } from '@dr-js/core/module/node/server/function'

const getRequestParam = (store, key) => {
  const { headers } = store.request
  return (
    headers[ key ] || // from HTTP header
    store.getState().url.searchParams.get(key) || // from Url query // NOTE: url should from ResponderRouter
    (headers[ 'cookie' ] && decodeURIComponent(parseCookieString(headers[ 'cookie' ])[ key ])) || // from HTTP header cookie
    (store.webSocket && getWebSocketProtocolListParam(store.webSocket.protocolList, key)) // for WebSocket UpgradeRequestResponder
  )
}

const getRequestBuffer = (store) => readableStreamToBufferAsync(store.request)

const getRequestJSON = (store) => getRequestBuffer(store).then((buffer) => buffer.length === 0 ? undefined : JSON.parse(String(buffer))) // NOTE: support no body with out error

const getWebSocketProtocolListParam = (protocolList = [], key) => { // to get value from format: `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  const header = `${encodeURIComponent(key)}=`
  const protocol = protocolList.find((protocol) => protocol.startsWith(header))
  return protocol && decodeURIComponent(protocol.slice(header.length))
}
const packWebSocketProtocolListParam = (key, value) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

export {
  getRequestParam,
  getRequestBuffer,
  getRequestJSON,
  getWebSocketProtocolListParam, packWebSocketProtocolListParam
}
