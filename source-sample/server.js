import { createRequestListener } from 'dr-js/module/node/server/Server'
import { responderEnd, responderEndWithStatusCode, responderEndWithRedirect, createResponderLog, createResponderLogEnd } from 'dr-js/module/node/server/Responder/Common'
import { createResponderFavicon } from 'dr-js/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap, createResponderRouteList } from 'dr-js/module/node/server/Responder/Router'

import { configureLog } from 'dr-server/module/configure/log'
import { configurePid } from 'dr-server/module/configure/pid'
import { configureAuthTimedLookup, configureAuthTimedLookupGroup } from 'dr-server/module/configure/auth'
import { configurePermission } from 'dr-server/module/configure/permission'
import { configureServer } from 'dr-server/module/configure/server'
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
  // auth
  fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // auth-group
  pathAuthGroup, authGroupDefaultTag, authGroupKeySuffix, authGroupVerifyRequestTag,
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

  const { createResponderCheckAuth, authFetch } = fileAuth
    ? await configureAuthTimedLookup({ fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger })
    : await configureAuthTimedLookupGroup({
      pathAuthDirectory: pathAuthGroup,
      getFileNameForTag: authGroupKeySuffix ? (tag) => `${tag}${authGroupKeySuffix}` : undefined,
      verifyRequestTag: authGroupVerifyRequestTag || undefined,
      logger
    }).then(({ createResponderCheckAuth, authFetchForTag }) => ({
      createResponderCheckAuth,
      authFetch: (url, option) => authFetchForTag(url, option, authGroupDefaultTag)
    }))

  const { checkPermission } = await configurePermission({ permissionType, permissionFunc, permissionFile, logger })

  const responderLogEnd = createResponderLogEnd({ log: logger.add })

  const routePrefix = ''
  const urlAuthCheck = '/auth'

  const featureExplorer = explorerRootPath && await configureFeaturePackExplorer({
    option,
    logger,
    routePrefix,
    explorerRootPath,
    explorerUploadMergePath,
    urlAuthCheck,
    createResponderCheckAuth,
    checkPermission
  })

  const featureStatusCollect = statusCollectPath && await configureFeaturePackStatusCollect({
    option,
    logger,
    routePrefix,
    statusCollectPath,
    statusCollectUrl,
    statusCollectInterval,
    urlAuthCheck,
    createResponderCheckAuth,
    authFetch
  })

  const featureStatusReport = statusReportProcessTag && await configureFeaturePackStatusReport({
    option,
    logger,
    routePrefix,
    statusReportProcessTag,
    createResponderCheckAuth,
    authFetch
  })

  const featureTaskRunner = taskRunnerRootPath && await configureFeaturePackTaskRunner({
    option,
    logger,
    routePrefix,
    taskRunnerRootPath,
    urlAuthCheck,
    createResponderCheckAuth,
    checkPermission
  })

  const redirectUrl = featureExplorer ? featureExplorer.URL_HTML
    : featureStatusCollect ? featureStatusCollect.URL_HTML
      : featureStatusReport ? featureStatusReport.URL_HTML
        : featureTaskRunner ? featureTaskRunner.URL_HTML
          : ''
  const routeMap = createRouteMap([
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ],
    [ '/', 'GET', __DEV__ ? createResponderRouteList({ getRouteMap: () => routeMap })
      : redirectUrl ? (store) => responderEndWithRedirect(store, { redirectUrl })
        : (store) => responderEndWithStatusCode(store, { statusCode: 400 })
    ],
    [ urlAuthCheck, 'GET', createResponderCheckAuth({ responderNext: (store) => responderEndWithStatusCode(store, { statusCode: 200 }) }) ],
    ...(featureExplorer ? featureExplorer.routeList : []),
    ...(featureStatusCollect ? featureStatusCollect.routeList : []),
    ...(featureStatusReport ? featureStatusReport.routeList : []),
    ...(featureTaskRunner ? featureTaskRunner.routeList : [])
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

  return {
    server,
    start,
    stop,
    option,
    logger,
    featureExplorer,
    featureStatusCollect,
    featureStatusReport,
    featureTaskRunner
  }
}

export { createServer }
