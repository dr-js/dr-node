import { createRequestListener } from '@dr-js/core/module/node/server/Server'
import { responderEnd, responderEndWithStatusCode, responderEndWithRedirect, createResponderLog, createResponderLogEnd } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderFavicon } from '@dr-js/core/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap, createResponderRouteListHTML } from '@dr-js/core/module/node/server/Responder/Router'
import { enableWebSocketServer } from '@dr-js/core/module/node/server/WebSocket/WebSocketServer'
import { createUpdateRequestListener } from '@dr-js/core/module/node/server/WebSocket/WebSocketUpgradeRequest'

import { configureFeaturePack as configureFeaturePackAuth } from '@dr-js/node/module/server/feature/Auth/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackPermission } from '@dr-js/node/module/server/feature/Permission/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackExplorer } from '@dr-js/node/module/server/feature/Explorer/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatCollect } from '@dr-js/node/module/server/feature/StatCollect/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatReport } from '@dr-js/node/module/server/feature/StatReport/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackWebSocketTunnel } from '@dr-js/node/module/server/feature/WebSocketTunnel/configureFeaturePack'

const FRAME_LENGTH_LIMIT = 64 * 1024 * 1024 // 64 MiB

const configureSampleServer = async ({
  serverPack: { server, option }, logger, routePrefix = '',

  isDebugRoute,

  // auth
  authKey,
  authSkip = false,
  authFile,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,
  // permission
  permissionType, permissionFunc, permissionFile,

  // explorer
  explorerRootPath, explorerUploadMergePath, explorerStatusCommandList,
  // stat collect
  statCollectPath, statCollectUrl, statCollectInterval,
  // stat report
  statReportProcessTag,

  // websocket tunnel
  webSocketTunnelHost
}) => {
  const URL_AUTH_CHECK = '/auth'

  const featureAuth = await configureFeaturePackAuth({
    logger, routePrefix,
    authKey,
    authSkip,
    authFile,
    authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,
    URL_AUTH_CHECK
  })

  const featurePermission = await configureFeaturePackPermission({
    logger, routePrefix,
    permissionType, permissionFunc, permissionFile
  })

  const featureExplorer = explorerRootPath && await configureFeaturePackExplorer({
    logger, routePrefix, featureAuth, featurePermission,
    explorerRootPath, explorerUploadMergePath, explorerStatusCommandList
  })

  const featureStatCollect = statCollectPath && await configureFeaturePackStatCollect({
    logger, routePrefix, featureAuth,
    statCollectPath, statCollectUrl, statCollectInterval
  })

  const featureStatReport = statReportProcessTag && await configureFeaturePackStatReport({
    logger, routePrefix, featureAuth,
    statReportProcessTag
  })

  const featureWebSocketTunnel = webSocketTunnelHost && await configureFeaturePackWebSocketTunnel({
    logger, routePrefix, featureAuth,
    webSocketTunnelHost
  })

  const redirectUrl = featureExplorer ? featureExplorer.URL_HTML
    : featureStatCollect ? featureStatCollect.URL_HTML
      : featureStatReport ? featureStatReport.URL_HTML
        : ''

  const responderLogEnd = createResponderLogEnd({ log: logger.add })

  const routeMap = createRouteMap([
    ...featureAuth.routeList,
    ...(featureExplorer ? featureExplorer.routeList : []),
    ...(featureStatCollect ? featureStatCollect.routeList : []),
    ...(featureStatReport ? featureStatReport.routeList : []),
    [ '/', 'GET', isDebugRoute ? createResponderRouteListHTML({ getRouteMap: () => routeMap })
      : redirectUrl ? (store) => responderEndWithRedirect(store, { redirectUrl })
        : (store) => responderEndWithStatusCode(store, { statusCode: 400 })
    ],
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ]
  ].filter(Boolean))

  server.on('request', createRequestListener({
    responderList: [
      createResponderLog({ log: logger.add }),
      createResponderRouter({ routeMap, baseUrl: option.baseUrl })
    ],
    responderEnd: (store) => {
      responderEnd(store)
      responderLogEnd(store)
    }
  }))

  let webSocketSet
  if (featureWebSocketTunnel) { // setup WebSocket
    const routeMap = createRouteMap([
      ...(featureWebSocketTunnel ? featureWebSocketTunnel.webSocketRouteList : [])
    ])
    webSocketSet = enableWebSocketServer({
      server,
      frameLengthLimit: FRAME_LENGTH_LIMIT,
      onUpgradeRequest: createUpdateRequestListener({
        responderList: [
          createResponderLog({ log: logger.add }),
          createResponderRouter({ routeMap, baseUrl: option.baseUrl })
        ]
      })
    })
  }

  return {
    featureAuth,
    featureExplorer,
    featureStatCollect,
    featureStatReport,
    featureWebSocketTunnel,

    webSocketSet
  }
}

export { configureSampleServer }
