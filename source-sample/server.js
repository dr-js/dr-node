import { createRequestListener } from 'dr-js/module/node/server/Server'
import {
  responderEnd,
  responderEndWithStatusCode,
  responderEndWithRedirect,
  createResponderParseURL,
  createResponderLog,
  createResponderLogEnd
} from 'dr-js/module/node/server/Responder/Common'
import { createResponderFavicon } from 'dr-js/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap, createResponderRouteList } from 'dr-js/module/node/server/Responder/Router'

import { configureLogger } from 'dr-server/module/configure/logger'
import { configureFilePid } from 'dr-server/module/configure/filePid'
import { configureAuthTimedLookup } from 'dr-server/module/configure/auth'
import { configureServerBase } from 'dr-server/module/configure/serverBase'
import { configureFeaturePack as configureFeaturePackExplorer } from 'dr-server/module/feature/Explorer/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatusCollect } from 'dr-server/module/feature/StatusCollect/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackStatusReport } from 'dr-server/module/feature/StatusReport/configureFeaturePack'
import { configureFeaturePack as configureFeaturePackTaskRunner } from 'dr-server/module/feature/TaskRunner/configureFeaturePack'

const createServer = async ({
  // common
  filePid, shouldIgnoreExistPid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, logFilePrefix,

  // auth
  fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,

  // explorer
  explorerRootPath, explorerUploadMergePath,
  // status collect
  statusCollectPath, statusCollectUrl, statusCollectInterval,
  // status report
  statusReportProcessTag,
  // task-runner
  taskRunnerRootPath
}) => {
  await configureFilePid({ filePid, shouldIgnoreExistPid })
  const { server, start, stop, option } = await configureServerBase({
    protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
  })
  const logger = await configureLogger({ pathLogDirectory, logFilePrefix })
  const { generateAuthCheckCode, wrapResponderCheckAuthCheckCode } = await configureAuthTimedLookup({
    fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger
  })

  const responderLogEnd = createResponderLogEnd(logger.add)

  const urlAuthCheck = '/auth'

  const featureExplorer = explorerRootPath && await configureFeaturePackExplorer({
    option,
    logger,
    routePrefix: '',
    explorerRootPath,
    explorerUploadMergePath,
    urlAuthCheck,
    wrapResponderCheckAuthCheckCode
  })

  const featureStatusCollect = statusCollectPath && await configureFeaturePackStatusCollect({
    option,
    logger,
    routePrefix: '',
    statusCollectPath,
    statusCollectUrl,
    statusCollectInterval,
    urlAuthCheck,
    wrapResponderCheckAuthCheckCode,
    generateAuthCheckCode
  })

  const featureStatusReport = statusReportProcessTag && await configureFeaturePackStatusReport({
    option,
    logger,
    routePrefix: '',
    statusReportProcessTag,
    wrapResponderCheckAuthCheckCode,
    generateAuthCheckCode
  })

  const featureTaskRunner = taskRunnerRootPath && await configureFeaturePackTaskRunner({
    option,
    logger,
    routePrefix: '',
    taskRunnerRootPath,
    urlAuthCheck,
    wrapResponderCheckAuthCheckCode
  })

  const redirectUrl = featureExplorer ? featureExplorer.URL_HTML
    : featureStatusCollect ? featureStatusCollect.URL_HTML
      : featureStatusReport ? featureStatusReport.URL_HTML
        : featureTaskRunner ? featureTaskRunner.URL_HTML
          : ''

  const routeMap = createRouteMap([
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ],
    [ '/', 'GET', __DEV__ ? createResponderRouteList(() => routeMap) : (store) => responderEndWithRedirect(store, { redirectUrl }) ],
    [ urlAuthCheck, 'GET', wrapResponderCheckAuthCheckCode((store) => responderEndWithStatusCode(store, { statusCode: 200 })) ],
    ...(featureExplorer ? featureExplorer.routeList : []),
    ...(featureStatusCollect ? featureStatusCollect.routeList : []),
    ...(featureStatusReport ? featureStatusReport.routeList : []),
    ...(featureTaskRunner ? featureTaskRunner.routeList : [])
  ].filter(Boolean))

  server.on('request', createRequestListener({
    responderList: [
      createResponderLog(logger.add),
      createResponderParseURL(option),
      createResponderRouter(routeMap)
    ],
    responderEnd: (store) => {
      responderEnd(store)
      responderLogEnd(store)
    }
  }))

  return { server, start, stop, option, logger, featureExplorer }
}

export { createServer }
