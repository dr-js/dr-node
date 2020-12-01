import { objectPickKey } from '@dr-js/core/module/common/immutable/Object'

import { configureFeature } from 'source/server/share/configure'

import { setupActionMap as setupActionMapStatus, ACTION_CORE_MAP as ACTION_CORE_MAP_STATUS, ACTION_TYPE as ACTION_TYPE_STATUS } from 'source/module/ActionJSON/status'
import { setupActionMap as setupActionMapPath, ACTION_CORE_MAP as ACTION_CORE_MAP_PATH } from 'source/module/ActionJSON/path'
import { ACTION_CORE_MAP as ACTION_CORE_MAP_PATH_EXTRA_ARCHIVE } from 'source/module/ActionJSON/pathExtraArchive'

import { setup as setupAuth } from 'source/server/feature/Auth/setup'
import { setup as setupPermission } from 'source/server/feature/Permission/setup'
import { setup as setupActionJSON } from 'source/server/feature/ActionJSON/setup'
import { setup as setupFile } from 'source/server/feature/File/setup'
import { setup as setupExplorer } from 'source/server/feature/Explorer/setup'
import { setup as setupStatCollect } from 'source/server/feature/StatCollect/setup'
import { setup as setupStatReport } from 'source/server/feature/StatReport/setup'
import { setup as setupWebSocketTunnel } from 'source/server/feature/WebSocketTunnelDev/setup'

import { setupPackageSIGUSR2 } from './function'

const configureSampleServer = async ({
  serverExot, loggerExot, routePrefix = '',

  isFavicon = true, isDebugRoute,
  packageName, packageVersion,

  // auth
  authKey,
  authSkip = false,
  authFile,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,
  // permission
  permissionType, permissionFunc, permissionFile,
  // file
  fileRootPath, fileRootPathPublic, fileUploadMergePath,
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
    loggerExot, routePrefix,
    authKey,
    authSkip,
    authFile,
    authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix
  })
  const featurePermission = await setupPermission({
    loggerExot, routePrefix,
    permissionType, permissionFunc, permissionFile
  })
  const featureActionJSON = fileRootPath && await setupActionJSON({
    loggerExot, routePrefix, featureAuth, featurePermission,
    actionMap: {
      ...setupActionMapStatus({ rootPath: fileRootPath, loggerExot }),
      ...setupActionMapPath({ rootPath: fileRootPath, loggerExot, actionCoreMap: { ...ACTION_CORE_MAP_PATH, ...ACTION_CORE_MAP_PATH_EXTRA_ARCHIVE } })
    },
    actionMapPublic: {
      ...setupActionMapStatus({ rootPath: fileRootPath, loggerExot, actionCoreMap: objectPickKey(ACTION_CORE_MAP_STATUS, [ ACTION_TYPE_STATUS.STATUS_TIMESTAMP, ACTION_TYPE_STATUS.STATUS_TIME_ISO ]) })
    }
  })
  const featureFile = fileRootPath && await setupFile({
    loggerExot, routePrefix, featureAuth, featurePermission,
    fileRootPath, fileRootPathPublic, fileUploadMergePath
  })
  const featureExplorer = explorer && await setupExplorer({
    loggerExot, routePrefix, featureAuth, featureActionJSON, featureFile
  })
  const featureStatCollect = statCollectPath && await setupStatCollect({
    loggerExot, routePrefix, featureAuth,
    statCollectPath, statCollectUrl, statCollectInterval
  })
  const featureStatReport = statReportProcessTag && await setupStatReport({
    loggerExot, routePrefix, featureAuth,
    statReportProcessTag
  })
  const featureWebSocketTunnel = webSocketTunnelHost && await setupWebSocketTunnel({
    loggerExot, routePrefix, featureAuth,
    webSocketTunnelHost
  })

  configureFeature({
    serverExot, loggerExot, routePrefix,
    isFavicon, isDebugRoute
  }, [
    featureAuth,
    featurePermission,
    featureActionJSON,
    featureFile,
    featureExplorer,
    featureStatCollect,
    featureStatReport,
    featureWebSocketTunnel
  ])

  packageName && setupPackageSIGUSR2(packageName, packageVersion)
}

export { configureSampleServer }
