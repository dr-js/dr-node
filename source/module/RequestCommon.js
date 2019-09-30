import { receiveBufferAsync } from '@dr-js/core/module/node/data/Buffer'
import { parseCookieString } from '@dr-js/core/module/node/server/function'

const getRequestParam = (store, key) => {
  const { headers } = store.request
  return (
    headers[ key ] || // from HTTP header
    store.getState().url.searchParams.get(key) || // from Url query // NOTE: url should from ResponderRouter
    (headers[ 'cookie' ] && decodeURIComponent(parseCookieString(headers[ 'cookie' ])[ key ])) // from HTTP header cookie
  )
}

const getRequestBuffer = (store) => receiveBufferAsync(store.request)

const getRequestJSON = (store) => getRequestBuffer(store).then(JSON.parse)

export {
  getRequestParam,
  getRequestBuffer,
  getRequestJSON
}
