import { once } from '@dr-js/core/module/common/function'
import { createExotGroup } from '@dr-js/core/module/common/module/Exot'

import { responderEnd, responderEndWithStatusCode, responderEndWithRedirect, createResponderLog, createResponderLogEnd } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderRouter, createRouteMap, createResponderRouteListHTML } from '@dr-js/core/module/node/server/Responder/Router'
import { createResponderFavicon } from '@dr-js/core/module/node/server/Responder/Send'
import { createRequestListener } from '@dr-js/core/module/node/server/Server'
import { enableWebSocketServer } from '@dr-js/core/module/node/server/WebSocket/WebSocketServer'
import { createUpdateRequestListener } from '@dr-js/core/module/node/server/WebSocket/WebSocketUpgradeRequest'
import { addExitListenerAsync, addExitListenerSync } from '@dr-js/core/module/node/system/ExitListener'

const configureFeature = ({
  serverExot, loggerExot, routePrefix = '',
  isFavicon = true, isDebugRoute = false,
  preResponderList = []
}, featureList = []) => {
  serverExot.describeString = ''
  serverExot.featureMap = new Map() // fill serverExot.featureMap
  serverExot.webSocketSet = undefined // may fill serverExot.webSocketSet

  let featureUrl
  const featureRouteList = []
  const featureWebSocketRouteList = []
  featureList.forEach((feature) => {
    if (!feature) return
    serverExot.featureMap.set(feature.name, feature)
    if (!featureUrl) featureUrl = feature.URL_HTML // NOTE: use the first URL
    if (feature.routeList) featureRouteList.push(...feature.routeList)
    if (feature.webSocketRouteList) featureWebSocketRouteList.push(...feature.webSocketRouteList)
  })

  const responderLogEnd = createResponderLogEnd({ loggerExot })

  const routeMap = createRouteMap([
    ...featureRouteList,
    !routePrefix && isFavicon && [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ],
    [ [ '/', '' ], 'GET', isDebugRoute ? createResponderRouteListHTML({ getRouteMap: () => routeMap })
      : featureUrl ? (store) => responderEndWithRedirect(store, { redirectUrl: `${routePrefix}${featureUrl}` })
        : (store) => responderEndWithStatusCode(store, { statusCode: 400 })
    ]
  ].filter(Boolean), routePrefix)

  serverExot.server.on('request', createRequestListener({
    responderList: [
      ...preResponderList,
      createResponderLog({ loggerExot }),
      createResponderRouter({ routeMap, serverExot })
    ].filter(Boolean),
    responderEnd: (store) => {
      responderEnd(store)
      responderLogEnd(store)
    }
  }))

  if (featureWebSocketRouteList.length !== 0) { // setup WebSocket
    const routeMap = createRouteMap([
      ...featureWebSocketRouteList
    ].filter(Boolean), routePrefix)

    serverExot.webSocketSet = enableWebSocketServer({
      server: serverExot.server,
      onUpgradeRequest: createUpdateRequestListener({
        responderList: [
          createResponderLog({ loggerExot }),
          createResponderRouter({ routeMap, serverExot })
        ]
      })
    })
  }
}

const setupServerExotGroup = ( // NOTE: this allow put 2 serverExot with shared loggerExot in same serverExotGroup
  serverExot,
  loggerExot,
  serverExotGroup = createExotGroup({
    id: 'exot:group-server',
    getOnExotError: (serverExotGroup) => (error) => {
      console.log('[exot-group-error]', error)
      return serverExotGroup.down()
    }
  })
) => {
  loggerExot && serverExotGroup.set(loggerExot)
  if (serverExot.featureMap) {
    for (const { exotList } of serverExot.featureMap.values()) { // NOTE: this order will up all featureExot before serverExot
      if (exotList && exotList.length) for (const exot of exotList) serverExotGroup.set(exot)
    }
  }
  serverExotGroup.set(serverExot)
  return serverExotGroup
}

const runServerExotGroup = async (pack) => {
  const {
    serverExot, loggerExot,
    serverExotGroup = serverExot // NOTE: also allow run serverExot
  } = pack
  const down = once(serverExotGroup.down) // trigger all exot down, the worst case those sync ones may still finish
  addExitListenerSync(down)
  addExitListenerAsync(down)
  await serverExotGroup.up()
  serverExot.describeString && loggerExot && loggerExot.add(serverExot.describeString)
  return pack // pass down pack
}

export {
  configureFeature,
  setupServerExotGroup, runServerExotGroup
}
