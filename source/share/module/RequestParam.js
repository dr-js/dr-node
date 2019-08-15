import { parseCookieString } from 'dr-js/module/node/server/function'

const getRequestParam = (store, key) => {
  const { headers } = store.request
  return (
    headers[ key ] ||
    store.getState().url.searchParams.get(key) || // NOTE: url should from ResponderRouter
    (headers[ 'cookie' ] && decodeURIComponent(parseCookieString(headers[ 'cookie' ])[ key ]))
  )
}

export { getRequestParam }
