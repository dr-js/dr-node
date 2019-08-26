import { createRequestListener } from '@dr-js/core/module/node/server/Server'
import { responderEnd, responderEndWithStatusCode, responderEndWithRedirect, createResponderLog, createResponderLogEnd } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderFavicon } from '@dr-js/core/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap, createResponderRouteListHTML } from '@dr-js/core/module/node/server/Responder/Router'

import { configureLog } from '@dr-js/node/module/server/share/configure/log'
import { configurePid } from '@dr-js/node/module/server/share/configure/pid'
import { configureServer } from '@dr-js/node/module/server/share/configure/server'

import { responderCommonExtend } from '@dr-js/node/module/server/share/responder'

import { configureFeaturePack as configureFeaturePackAuth } from '@dr-js/node/module/server/feature/Auth/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackPermission } from '@dr-js/node/module/server/feature/Permission/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackExplorer } from '@dr-js/node/module/server/feature/Explorer/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatusCollect } from '@dr-js/node/module/server/feature/StatusCollect/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatusReport } from '@dr-js/node/module/server/feature/StatusReport/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackTaskRunner } from '@dr-js/node/module/server/feature/TaskRunner/configureFeaturePack'

const createServer = async ({
  // server
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,

  // log
  pathLogDirectory, logFilePrefix,
  // pid
  filePid, shouldIgnoreExistPid,

  // auth
  authSkip = false,
  authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,
  // permission
  permissionType, permissionFunc, permissionFile,

  // explorer
  explorerRootPath, explorerUploadMergePath,
  // status collect
  statusCollectPath, statusCollectUrl, statusCollectInterval,
  // status report
  statusReportProcessTag,
  // task-runner
  taskRunnerRootPath
}) => {
  await configurePid({ filePid, shouldIgnoreExistPid })

  const { server, start, stop, option } = await configureServer({ protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam })

  const logger = await configureLog({ pathLogDirectory, logFilePrefix })

  const responderLogEnd = createResponderLogEnd({ log: logger.add })

  const routePrefix = ''
  const URL_AUTH_CHECK = '/auth'

  const featureAuth = await configureFeaturePackAuth({
    option, logger, routePrefix,
    authSkip,
    authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap,
    authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,
    URL_AUTH_CHECK
  })

  const featurePermission = await configureFeaturePackPermission({
    option, logger, routePrefix,
    permissionType, permissionFunc, permissionFile
  })

  const featureExplorer = explorerRootPath && await configureFeaturePackExplorer({
    option, logger, routePrefix, featureAuth, featurePermission,
    explorerRootPath,
    explorerUploadMergePath
  })

  const featureStatusCollect = statusCollectPath && await configureFeaturePackStatusCollect({
    option, logger, routePrefix, featureAuth,
    statusCollectPath,
    statusCollectUrl,
    statusCollectInterval
  })

  const featureStatusReport = statusReportProcessTag && await configureFeaturePackStatusReport({
    option, logger, routePrefix, featureAuth,
    statusReportProcessTag
  })

  const featureTaskRunner = taskRunnerRootPath && await configureFeaturePackTaskRunner({
    option, logger, routePrefix, featureAuth, featurePermission,
    taskRunnerRootPath
  })

  const redirectUrl = featureExplorer ? featureExplorer.URL_HTML
    : featureStatusCollect ? featureStatusCollect.URL_HTML
      : featureStatusReport ? featureStatusReport.URL_HTML
        : featureTaskRunner ? featureTaskRunner.URL_HTML
          : ''

  const routeMap = createRouteMap([
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ],
    [ '/', 'GET', __DEV__ ? createResponderRouteListHTML({ getRouteMap: () => routeMap })
      : redirectUrl ? (store) => responderEndWithRedirect(store, { redirectUrl })
        : (store) => responderEndWithStatusCode(store, { statusCode: 400 })
    ],
    ...featureAuth.routeList,
    ...(featureExplorer ? featureExplorer.routeList : []),
    ...(featureStatusCollect ? featureStatusCollect.routeList : []),
    ...(featureStatusReport ? featureStatusReport.routeList : []),
    ...(featureTaskRunner ? featureTaskRunner.routeList : [])
  ].filter(Boolean))

  server.on('request', createRequestListener({
    responderList: [
      createResponderLog({ log: logger.add }),
      responderCommonExtend,
      createResponderRouter({ routeMap, baseUrl: option.baseUrl })
    ],
    responderEnd: (store) => {
      responderEnd(store)
      responderLogEnd(store)
    }
  }))

  return {
    server,
    start,
    stop,
    option,
    logger,
    featureAuth,
    featureExplorer,
    featureStatusCollect,
    featureStatusReport,
    featureTaskRunner
  }
}

export { createServer }
