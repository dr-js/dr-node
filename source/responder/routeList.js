import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderSendBuffer } from 'dr-js/module/node/server/Responder/Send'
import { describeRouteMap } from 'dr-js/module/node/server/Responder/Router'

const getRouteMapInfo = (routeMap) => Buffer.from([
  '<pre>',
  '<h2>Route List</h2>',
  '<table>',
  ...describeRouteMap(routeMap).map(({ method, route }) => `<tr><td><b>${method}</b></td><td>${method === '/GET' ? `<a href="${route}">${route}</a>` : route}</td></tr>`),
  '</table>',
  '</pre>'
].join('\n'))

const getRouteGetRouteList = (getRouterMap, route = '/') => [ route, 'GET', (store) => responderSendBuffer(store, { buffer: getRouteMapInfo(getRouterMap()), type: BASIC_EXTENSION_MAP.html }) ]

export {
  getRouteMapInfo,
  getRouteGetRouteList
}
