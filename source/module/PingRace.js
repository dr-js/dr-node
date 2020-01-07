import { createInsideOutPromise, withTimeoutPromise } from '@dr-js/core/module/common/function'
import { clock } from '@dr-js/core/module/common/time'
import { requestHttp } from '@dr-js/core/module/node/net'

// TODO: currently `ping` is actually `tcp-ping`

const DEFAULT_PING_TIMEOUT = 5 * 1000

const batchRequestUrlList = (onResponse, urlList, option, body) => {
  const requestSet = new Set()
  const promise = Promise.all(urlList.map((url) => {
    const { request, promise } = requestHttp(url, option, body)
    requestSet.add(request)
    return promise.then((response) => {
      requestSet.delete(request)
      response.destroy() // skip response data
      __DEV__ && console.log('[batchRequestUrlList] hit', url)
      onResponse(url)
    }, (error) => { // skip error
      requestSet.delete(request)
      __DEV__ && console.log('[batchRequestUrlList] miss', url, error)
    })
  }))
  const clear = () => {
    for (const request of requestSet) request.abort()
    return promise
  }
  return { requestSet, promise, clear }
}

const pingRaceUrlList = async (urlList = [], {
  timeout = DEFAULT_PING_TIMEOUT, // in msec
  body = null,
  ...option
} = {}) => {
  if (urlList.length < 2) return urlList[ 0 ] // faster exit
  const { promise, resolve } = createInsideOutPromise()
  const batchRequest = batchRequestUrlList(resolve, urlList, { timeout, ...option }, body)
  const resultUrl = await withTimeoutPromise(promise, timeout).catch((error) => {
    __DEV__ && console.log('[pingStatUrlList] timeout:', error)
    return urlList[ 0 ] // default to first url
  })
  __DEV__ && console.log('[pingRaceUrlList] requestSet size:', batchRequest.requestSet.size)
  await batchRequest.clear()
  __DEV__ && console.log('[pingRaceUrlList] requestSet size:', batchRequest.requestSet.size)
  return resultUrl
}

// result in url-stat map
const PING_STAT_ERROR = null
const pingStatUrlList = async (urlList = [], {
  timeout = DEFAULT_PING_TIMEOUT, // in msec
  body = null,
  ...option
} = {}) => {
  const statMap = urlList.reduce((o, url) => {
    o[ url ] = PING_STAT_ERROR // first set all url stat to PING_STAT_ERROR
    return o
  }, {}) // { url: msec/null }
  const timeStart = clock()
  const batchRequest = batchRequestUrlList((url) => {
    statMap[ url ] = clock() - timeStart
  }, urlList, { timeout, ...option }, body)
  await withTimeoutPromise(batchRequest.promise, timeout).catch((error) => { __DEV__ && console.log('[pingStatUrlList] timeout:', error) })
  __DEV__ && console.log('[pingStatUrlList] requestSet size:', batchRequest.requestSet.size)
  await batchRequest.clear()
  __DEV__ && console.log('[pingStatUrlList] requestSet size:', batchRequest.requestSet.size)
  return statMap
}

export {
  pingRaceUrlList,
  pingStatUrlList, PING_STAT_ERROR
}
