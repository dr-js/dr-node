import { fetch } from 'dr-js/module/node/net'
import { createRequestListener } from 'dr-js/module/node/server/Server'
import {
  responderEnd,
  createResponderParseURL,
  createResponderLog,
  createResponderLogEnd
} from 'dr-js/module/node/server/Responder/Common'
import { createResponderFavicon } from 'dr-js/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap } from 'dr-js/module/node/server/Responder/Router'

import { configureLogger } from 'dr-server/module/configure/logger'
import { configureFilePid } from 'dr-server/module/configure/filePid'
import { configureAuthTimedLookup } from 'dr-server/module/configure/auth'
import { configureServerBase } from 'dr-server/module/configure/serverBase'
import { createResponderStatusReport } from 'dr-server/module/responder/status/Report'
import { createResponderRouteList } from 'dr-server/module/responder/routeList'
import { createGetStatusReport } from 'dr-server/module/task/getStatusReport'

const createServer = async ({
  // common
  filePid, shouldIgnoreExistPid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, prefixLogFile,
  // auth
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // status report
  statusReportProcessTag
}) => {
  await configureFilePid({ filePid, shouldIgnoreExistPid })
  const { server, start, stop, option } = await configureServerBase({
    protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
  })
  const logger = await configureLogger({ pathLogDirectory, prefixLogFile })
  const { generateAuthCheckCode, wrapResponderCheckAuthCheckCode } = await configureAuthTimedLookup({
    fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger
  })

  const responderLogEnd = createResponderLogEnd(logger.add)

  const routerMap = createRouteMap([
    [ '/status-report', 'GET', wrapResponderCheckAuthCheckCode(createResponderStatusReport(statusReportProcessTag)) ],
    [ '/', 'GET', createResponderRouteList(() => routerMap) ],
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ]
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

  const getStatusReport = createGetStatusReport(statusReportProcessTag)
  const reportStatus = async (url) => {
    const { status } = await fetch(url, {
      method: 'POST',
      headers: { 'auth-check-code': generateAuthCheckCode() },
      body: JSON.stringify(getStatusReport())
    })
    __DEV__ && console.log('reported status:', status)
  }

  return { server, start, stop, option, logger, reportStatus }
}

export { createServer }
