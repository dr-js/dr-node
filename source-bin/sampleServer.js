import { objectPickKey } from '@dr-js/core/module/common/immutable/Object'
import { createRequestListener } from '@dr-js/core/module/node/server/Server'
import { responderEnd, responderEndWithStatusCode, responderEndWithRedirect, createResponderLog, createResponderLogEnd } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderFavicon } from '@dr-js/core/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap, createResponderRouteListHTML } from '@dr-js/core/module/node/server/Responder/Router'
import { enableWebSocketServer } from '@dr-js/core/module/node/server/WebSocket/WebSocketServer'
import { createUpdateRequestListener } from '@dr-js/core/module/node/server/WebSocket/WebSocketUpgradeRequest'

import { setupActionMap as setupActionMapStatus, ACTION_CORE_MAP as ACTION_CORE_MAP_STATUS, ACTION_TYPE as ACTION_TYPE_STATUS } from '@dr-js/node/module/module/ActionJSON/status'
import { setupActionMap as setupActionMapPath, ACTION_CORE_MAP as ACTION_CORE_MAP_PATH } from '@dr-js/node/module/module/ActionJSON/path'
import { ACTION_CORE_MAP as ACTION_CORE_MAP_PATH_EXTRA_ARCHIVE } from '@dr-js/node/module/module/ActionJSON/pathExtraArchive'

import { setup as setupAuth } from '@dr-js/node/module/server/feature/Auth/setup'
import { setup as setupPermission } from '@dr-js/node/module/server/feature/Permission/setup'
import { setup as setupActionJSON } from '@dr-js/node/module/server/feature/ActionJSON/setup'
import { setup as setupFile } from '@dr-js/node/module/server/feature/File/setup'
import { setup as setupExplorer } from '@dr-js/node/module/server/feature/Explorer/setup'
import { setup as setupStatCollect } from '@dr-js/node/module/server/feature/StatCollect/setup'
import { setup as setupStatReport } from '@dr-js/node/module/server/feature/StatReport/setup'
import { setup as setupWebSocketTunnel } from '@dr-js/node/module/server/feature/WebSocketTunnelDev/setup'

const configureSampleServer = async ({
  serverExot, logger, routePrefix = '',

  isDebugRoute,

  // auth
  authKey,
  authSkip = false,
  authFile,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,
  // permission
  permissionType, permissionFunc, permissionFile,
  // file
  fileRootPath: rootPath, fileUploadMergePath,
  // explorer
  explorer,
  // stat collect
  statCollectPath, statCollectUrl, statCollectInterval,
  // stat report
  statReportProcessTag,

  // websocket tunnel
  webSocketTunnelHost
}) => {
  const featureAuth = await setupAuth({
    logger, routePrefix,
    authKey,
    authSkip,
    authFile,
    authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix
  })
  const featurePermission = await setupPermission({
    logger, routePrefix,
    permissionType, permissionFunc, permissionFile
  })
  const featureActionJSON = rootPath && await setupActionJSON({
    logger, routePrefix, featureAuth, featurePermission,
    actionMap: {
      ...setupActionMapStatus({ rootPath, logger }),
      ...setupActionMapPath({ rootPath, logger, actionCoreMap: { ...ACTION_CORE_MAP_PATH, ...ACTION_CORE_MAP_PATH_EXTRA_ARCHIVE } })
    },
    actionMapPublic: {
      ...setupActionMapStatus({ rootPath, logger, actionCoreMap: objectPickKey(ACTION_CORE_MAP_STATUS, [ ACTION_TYPE_STATUS.STATUS_TIMESTAMP, ACTION_TYPE_STATUS.STATUS_TIME_ISO ]) })
    }
  })
  const featureFile = rootPath && await setupFile({
    logger, routePrefix, featureAuth, featurePermission,
    fileRootPath: rootPath, fileUploadMergePath
  })
  const featureExplorer = explorer && await setupExplorer({
    logger, routePrefix, featureAuth, featurePermission, featureActionJSON, featureFile
  })
  const featureStatCollect = statCollectPath && await setupStatCollect({
    logger, routePrefix, featureAuth,
    statCollectPath, statCollectUrl, statCollectInterval
  })
  const featureStatReport = statReportProcessTag && await setupStatReport({
    logger, routePrefix, featureAuth,
    statReportProcessTag
  })
  const featureWebSocketTunnel = webSocketTunnelHost && await setupWebSocketTunnel({
    logger, routePrefix, featureAuth,
    webSocketTunnelHost
  })

  serverExot.featureMap = new Map() // fill serverExot.featureMap
  let featureUrl
  const featureRouteList = []
  const featureWebSocketRouteList = []
  const appendFeature = (feature) => {
    if (!feature) return
    serverExot.featureMap.set(feature.name, feature)
    if (!featureUrl) featureUrl = feature.URL_HTML
    if (feature.routeList) featureRouteList.push(...feature.routeList)
    if (feature.webSocketRouteList) featureWebSocketRouteList.push(...feature.webSocketRouteList)
  }
  appendFeature(featureAuth)
  appendFeature(featurePermission)
  appendFeature(featureActionJSON)
  appendFeature(featureFile)
  appendFeature(featureExplorer)
  appendFeature(featureStatCollect)
  appendFeature(featureStatReport)
  appendFeature(featureWebSocketTunnel)

  const responderLogEnd = createResponderLogEnd({ log: logger.add })

  const routeMap = createRouteMap([
    ...featureRouteList,
    [ '/', 'GET', isDebugRoute ? createResponderRouteListHTML({ getRouteMap: () => routeMap })
      : featureUrl ? (store) => responderEndWithRedirect(store, { redirectUrl: featureUrl })
        : (store) => responderEndWithStatusCode(store, { statusCode: 400 })
    ],
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ]
  ].filter(Boolean))

  serverExot.server.on('request', createRequestListener({
    responderList: [
      createResponderLog({ log: logger.add }),
      createResponderRouter({ routeMap, baseUrl: serverExot.option.baseUrl })
    ],
    responderEnd: (store) => {
      responderEnd(store)
      responderLogEnd(store)
    }
  }))

  if (featureWebSocketTunnel) { // setup WebSocket
    const routeMap = createRouteMap([
      ...featureWebSocketRouteList
    ])
    serverExot.webSocketSet = enableWebSocketServer({ // fill `serverExot.webSocketSet`
      server: serverExot.server,
      onUpgradeRequest: createUpdateRequestListener({
        responderList: [
          createResponderLog({ log: logger.add }),
          createResponderRouter({ routeMap, baseUrl: serverExot.option.baseUrl })
        ]
      })
    })
  }
}

export { configureSampleServer }
