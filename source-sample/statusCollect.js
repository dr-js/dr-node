import { createRequestListener } from 'dr-js/module/node/server/Server'
import {
  responderEnd,
  responderEndWithStatusCode,
  createResponderParseURL,
  createResponderLog,
  createResponderLogEnd
} from 'dr-js/module/node/server/Responder/Common'
import { createResponderRouter, createRouteMap } from 'dr-js/module/node/server/Responder/Router'

import { configureLogger } from 'source/configure/logger'
import { configureFilePid } from 'source/configure/filePid'
import { configureAuthTimedLookup } from 'source/configure/auth'
import { configureServerBase } from 'source/configure/serverBase'
import { configureStatusCollector } from 'source/configure/status/Collector'
import { createRouteGetFavicon } from 'source/responder/favicon'
import { createResponderRouteList } from 'source/responder/routeList'
import { createResponderStatusVisualize, createResponderStatusState } from 'source/responder/status/Visualize'

const createServer = async ({
  // common
  filePid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, prefixLogFile,
  // auth
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // status collect
  statusCollectPath, statusCollectUrl, statusCollectInterval
}) => {
  await configureFilePid({ filePid })
  const { server, start, stop, option } = await configureServerBase({
    protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
  })
  const logger = await configureLogger({ pathLogDirectory, prefixLogFile })
  const { generateAuthCheckCode, wrapResponderCheckAuthCheckCode } = await configureAuthTimedLookup({
    fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger
  })
  const { factDB, timer } = await configureStatusCollector({
    collectPath: statusCollectPath,
    collectUrl: statusCollectUrl,
    collectInterval: statusCollectInterval,
    getExtraHeaders: () => ({ [ 'auth-check-code' ]: generateAuthCheckCode() })
  })

  const responderLogEnd = createResponderLogEnd(logger.add)
  const responderAuthCheck = wrapResponderCheckAuthCheckCode((store) => responderEndWithStatusCode(store, { statusCode: 200 }))

  const routerMap = createRouteMap([
    [ '/status-visualize', 'GET', await createResponderStatusVisualize('/status-state', '/auth') ],
    [ '/status-state', 'GET', wrapResponderCheckAuthCheckCode(createResponderStatusState(factDB.getState)) ],
    [ '/auth', 'GET', responderAuthCheck ],
    [ '/', 'GET', createResponderRouteList(() => routerMap) ],
    await createRouteGetFavicon()
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

  return { server, start, stop, option, factDB, timer }
}

export { createServer }
