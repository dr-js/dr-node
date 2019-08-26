import { receiveBufferAsync } from '@dr-js/core/module/node/data/Buffer'

const responderCommonExtend = (store) => { // TODO: this add functions to every request, so balance handiness & weight
  const requestBuffer = () => receiveBufferAsync(store.request)
  const requestJSON = async () => JSON.parse(await requestBuffer())

  store.requestBuffer = requestBuffer
  store.requestJSON = requestJSON
}

export { responderCommonExtend }
