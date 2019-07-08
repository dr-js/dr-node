import { createRequestListener } from 'dr-js/module/node/server/Server'
import { responderEnd, responderEndWithStatusCode, responderEndWithRedirect, createResponderLog, createResponderLogEnd } from 'dr-js/module/node/server/Responder/Common'
import { createResponderFavicon } from 'dr-js/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap, createResponderRouteListHTML } from 'dr-js/module/node/server/Responder/Router'

import { configureLog } from 'dr-server/module/configure/log'
import { configurePid } from 'dr-server/module/configure/pid'
import { configurePermission } from 'dr-server/module/configure/permission'
import { configureServer } from 'dr-server/module/configure/server'

import { responderCommonExtend } from 'dr-server/module/responder/Common'

import { configureFeaturePack as configureFeaturePackAuth } from 'dr-server/module/feature/Auth/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackExplorer } from 'dr-server/module/feature/Explorer/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatusCollect } from 'dr-server/module/feature/StatusCollect/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatusReport } from 'dr-server/module/feature/StatusReport/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackTaskRunner } from 'dr-server/module/feature/TaskRunner/configureFeaturePack'

const createServer = async ({
  // server
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,

  // log
  pathLogDirectory, logFilePrefix,
  // pid
  filePid, shouldIgnoreExistPid,
  // permission
  permissionType, permissionFunc, permissionFile,

  // auth
  authSkip = false,
  authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,

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

  const { checkPermission } = await configurePermission({ permissionType, permissionFunc, permissionFile, logger })

  const responderLogEnd = createResponderLogEnd({ log: logger.add })

  const routePrefix = ''
  const URL_AUTH_CHECK = '/auth'

  const featureAuth = await configureFeaturePackAuth({
    ...{ option, logger, routePrefix },
    ...{ authSkip },
    ...{ authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap },
    ...{ authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix },
    URL_AUTH_CHECK
  })

  const featureExplorer = explorerRootPath && await configureFeaturePackExplorer({
    ...{ option, logger, routePrefix, featureAuth },
    explorerRootPath,
    explorerUploadMergePath,
    checkPermission
  })

  const featureStatusCollect = statusCollectPath && await configureFeaturePackStatusCollect({
    ...{ option, logger, routePrefix, featureAuth },
    statusCollectPath,
    statusCollectUrl,
    statusCollectInterval
  })

  const featureStatusReport = statusReportProcessTag && await configureFeaturePackStatusReport({
    ...{ option, logger, routePrefix, featureAuth },
    statusReportProcessTag
  })

  const featureTaskRunner = taskRunnerRootPath && await configureFeaturePackTaskRunner({
    ...{ option, logger, routePrefix, featureAuth },
    taskRunnerRootPath,
    checkPermission
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
