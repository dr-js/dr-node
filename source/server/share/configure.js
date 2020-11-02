import { once } from '@dr-js/core/module/common/function'
import { createExotGroup } from '@dr-js/core/module/common/module/Exot'

import { responderEnd, responderEndWithStatusCode, responderEndWithRedirect, createResponderLog, createResponderLogEnd } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderRouter, createRouteMap, createResponderRouteListHTML } from '@dr-js/core/module/node/server/Responder/Router'
import { createResponderFavicon } from '@dr-js/core/module/node/server/Responder/Send'
import { createRequestListener, describeServerOption } from '@dr-js/core/module/node/server/Server'
import { enableWebSocketServer } from '@dr-js/core/module/node/server/WebSocket/WebSocketServer'
import { createUpdateRequestListener } from '@dr-js/core/module/node/server/WebSocket/WebSocketUpgradeRequest'
import { addExitListenerAsync, addExitListenerSync } from '@dr-js/core/module/node/system/ExitListener'

import { configureLog } from 'source/module/Log'
import { configurePid } from 'source/module/Pid'
import { configureServerExot } from 'source/module/ServerExot'

const configureFeature = ({
  serverExot, loggerExot,
  routePrefix = '', // NOTE: this is "global" routePrefix, and will apply on feature routePrefix, so normally just use one
  isRawServer = false, // set to skip route related configure
  isFavicon = true, isDebugRoute = false, rootRouteResponder,
  preResponderList = [],
  preRouteList = []
}, featureList = []) => {
  serverExot.featureMap = new Map() // fill serverExot.featureMap
  serverExot.webSocketSet = undefined // may fill serverExot.webSocketSet

  let featureUrl
  const featureRouteList = []
  const featureWebSocketRouteList = []
  featureList.forEach((feature) => {
    if (!feature) return
    if (!feature.name) throw new Error(`expect feature.name of ${feature}`)
    if (serverExot.featureMap.has(feature.name)) throw new Error(`duplicate feature.name: ${feature.name}`)
    serverExot.featureMap.set(feature.name, feature)
    if (!featureUrl) featureUrl = feature.URL_HTML // NOTE: use the first URL
    if (feature.routeList) featureRouteList.push(...feature.routeList)
    if (feature.webSocketRouteList) featureWebSocketRouteList.push(...feature.webSocketRouteList)
  })

  if (isRawServer) {
    if ( // prevent dropping routes
      routePrefix ||
      preRouteList.length ||
      featureRouteList.length ||
      featureWebSocketRouteList.length
    ) throw new Error('route setting conflict with isRawServer')
    return
  }

  const responderLogEnd = createResponderLogEnd({ loggerExot })

  const routeMap = createRouteMap([
    ...preRouteList,
    ...featureRouteList,
    !routePrefix && isFavicon && [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ],
    [ [ '/', '' ], 'GET', rootRouteResponder || (isDebugRoute ? createResponderRouteListHTML({ getRouteMap: () => routeMap })
      : featureUrl ? (store) => responderEndWithRedirect(store, { redirectUrl: `${routePrefix}${featureUrl}` })
        : (store) => responderEndWithStatusCode(store, { statusCode: 400 }))
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
  loggerExot && serverExotGroup.set(loggerExot) // first up, last down
  if (serverExot.featureMap) {
    for (const { exotList } of serverExot.featureMap.values()) { // NOTE: this order will up all featureExot before serverExot
      if (exotList && exotList.length) for (const exot of exotList) serverExotGroup.set(exot)
    }
  }
  serverExotGroup.set(serverExot) // last up, first down
  return serverExotGroup
}

const runServerExotGroup = async (pack) => {
  const {
    serverExot,
    serverExotGroup = serverExot // NOTE: also allow run serverExot
  } = pack
  const down = once(serverExotGroup.down) // trigger all exot down, the worst case those sync ones may still finish
  addExitListenerSync(down)
  addExitListenerAsync(down)
  await serverExotGroup.up()
  return pack // pass down pack
}

const runServer = async (
  configureServer,
  serverOption,
  featureOption,
  serverInfoTitle = !featureOption.packageName ? undefined : `${featureOption.packageName}@${featureOption.packageVersion}`
) => {
  await configurePid(serverOption)
  const { loggerExot } = await configureLog(serverOption)
  const serverExot = await configureServerExot(serverOption)
  const serverInfo = describeServerOption(serverExot.option, serverInfoTitle, featureOption)

  await configureServer({ serverExot, loggerExot, serverInfo, ...featureOption }) // do custom config here

  loggerExot.add(serverInfo)
  return runServerExotGroup({
    serverOption, featureOption, loggerExot, // just pass to outer code
    serverExot, serverExotGroup: setupServerExotGroup(serverExot, loggerExot)
  })
}

export {
  configureFeature,
  setupServerExotGroup, runServerExotGroup,
  runServer
}
