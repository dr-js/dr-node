import { createRequestListener } from 'dr-js/module/node/server/Server'
import {
  responderEnd,
  createResponderParseURL,
  createResponderLog,
  createResponderLogEnd
} from 'dr-js/module/node/server/Responder/Common'
import { createResponderRouter, createRouteMap } from 'dr-js/module/node/server/Responder/Router'

import { configureLogger } from 'source/configure/logger'
import { configureFilePid } from 'source/configure/filePid'
import { configureAuthTimedLookup } from 'source/configure/auth'
import { configureServerBase } from 'source/configure/serverBase'
import { routeGetFavicon } from 'source/responder/favicon'
import { createResponderStatusReport } from 'source/responder/status/Report'
import { getRouteGetRouteList } from 'source/responder/routeList'

const createServer = async ({
  // common
  filePid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, prefixLogFile,
  // auth
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // status report
  statusReportProcessTag
}) => {
  await configureFilePid({ filePid })
  const { server, start, stop, option } = await configureServerBase({ protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam })
  const logger = await configureLogger({ pathLogDirectory, prefixLogFile })
  const {
    wrapResponderAuthTimedLookup
  } = await configureAuthTimedLookup({ fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger })

  const responderLogEnd = createResponderLogEnd(logger.add)

  const routerMap = createRouteMap([
    [ '/status-report', 'GET', wrapResponderAuthTimedLookup(createResponderStatusReport(statusReportProcessTag)) ],
    getRouteGetRouteList(() => routerMap),
    routeGetFavicon
  ])

  server.on('request', createRequestListener({
    responderList: [
      createResponderParseURL(option),
      createResponderLog(logger.add),
      createResponderRouter(routerMap)
    ],
    responderEnd: (store) => {
      responderEnd(store)
      responderLogEnd(store)
    }
  }))

  return { server, start, stop, option }
}

export { createServer }
