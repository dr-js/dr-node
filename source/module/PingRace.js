import { createInsideOutPromise } from '@dr-js/core/module/common/function'
import { requestHttp } from '@dr-js/core/module/node/net'

const pingRaceUrlList = async (urlList = [], {
  timeout = 5 * 1000, // in msec
  body = null,
  ...option
} = {}) => {
  const { promise, resolve } = createInsideOutPromise()
  const timeoutToken = setTimeout(() => resolve(urlList[ 0 ]), timeout) // default to first url
  const requestSet = new Set()
  const promiseList = []
  for (const url of urlList) {
    const { request, promise } = requestHttp(url, { timeout, ...option }, body)
    requestSet.add(request)
    promiseList.push(promise.then((response) => {
      requestSet.delete(request)
      response.destroy() // skip response data
      __DEV__ && console.log('[pingRace] hit', url)
      resolve(url)
    }, (error) => { // skip error & drop promise
      requestSet.delete(request)
      __DEV__ && console.log('[pingRace] miss', url, error)
    }))
  }
  const resultUrl = await promise
  __DEV__ && console.log('[pingRace] requestSet size:', requestSet.size)
  clearTimeout(timeoutToken)
  for (const request of requestSet) request.abort()
  await Promise.all(promiseList)
  __DEV__ && console.log('[pingRace] requestSet size:', requestSet.size)
  return resultUrl
}

export { pingRaceUrlList }
