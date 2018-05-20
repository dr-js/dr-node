import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'
import { describeRouteMap } from 'dr-js/module/node/server/Responder/Router'
import { prepareBufferDataHTML } from './function'

const renderRouteMapInfo = (routeMap) => [
  '<pre>',
  '<h2>Route List</h2>',
  '<table>',
  ...describeRouteMap(routeMap)
    .map(({ method, route }) => `<tr><td><b>${method}</b></td><td>${method === '/GET' ? `<a href="${route}">${route}</a>` : route}</td></tr>`),
  '</table>',
  '</pre>'
].join('\n')

const createResponderRouteList = (getRouterMap) => {
  let bufferData
  return async (store) => {
    if (bufferData === undefined) bufferData = await prepareBufferDataHTML(Buffer.from(renderRouteMapInfo(getRouterMap())))
    return responderSendBufferCompress(store, bufferData)
  }
}

export { createResponderRouteList }
