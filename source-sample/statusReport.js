import { createRequestListener } from 'dr-js/module/node/server/Server'
import {
  responderEnd,
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
import { configureFeaturePack } from 'dr-server/module/feature/StatusReport/configureFeaturePack'

const createServer = async ({
  // common
  filePid, shouldIgnoreExistPid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, logFilePrefix,
  // auth
  fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // status report
  statusReportProcessTag
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

  const featureStatusReport = await configureFeaturePack({
    option,
    logger,
    routePrefix: '',
    statusReportProcessTag,
    wrapResponderCheckAuthCheckCode,
    generateAuthCheckCode
  })

  const routerMap = createRouteMap([
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ],
    [ '/', 'GET', __DEV__ ? createResponderRouteList(() => routerMap) : (store) => responderEndWithRedirect(store, { redirectUrl: featureStatusReport.URL_STATUS_REPORT }) ],
    ...featureStatusReport.routeList
  ])

  server.on('request', createRequestListener({
    responderList: [
      createResponderLog(logger.add),
      createResponderParseURL(option),
      createResponderRouter(routerMap)
    ],
    responderEnd: (store) => {
      responderEnd(store)
      responderLogEnd(store)
    }
  }))

  return { server, start, stop, option, logger, featureStatusReport }
}

export { createServer }
