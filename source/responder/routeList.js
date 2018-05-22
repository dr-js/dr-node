import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'
import { describeRouteMap } from 'dr-js/module/node/server/Responder/Router'

import { COMMON_LAYOUT, COMMON_STYLE } from 'source/resource/commonHTML'
import { prepareBufferDataHTML } from './function'

const getHTML = (routeMap) => COMMON_LAYOUT([
  COMMON_STYLE()
], [
  '<div style="overflow: auto; padding: 0 8px;">',
  '<h2>Route List</h2>',
  '<table>',
  ...describeRouteMap(routeMap)
    .map(({ method, route }) => `<tr><td><b>${method}</b></td><td>${method === '/GET' ? `<a href="${route}">${route}</a>` : route}</td></tr>`),
  '</table>',
  '</div>'
])

const createResponderRouteList = (getRouterMap) => {
  let bufferData
  return async (store) => {
    if (bufferData === undefined) bufferData = await prepareBufferDataHTML(Buffer.from(getHTML(getRouterMap())))
    return responderSendBufferCompress(store, bufferData)
  }
}

export { createResponderRouteList }
