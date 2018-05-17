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
import { routeGetFavicon } from 'source/responder/favicon'
import { getRouteGetRouteList } from 'source/responder/routeList'
import { createResponderStatusVisualize, createResponderStatusState } from 'source/responder/status/Visualize'

const createServer = async ({
  pathLogDirectory, prefixLogFile,
  filePid,
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  statusCollectPath, statusCollectUrl, statusCollectInterval
}) => {
  const logger = await configureLogger({ pathLogDirectory, prefixLogFile })

  await configureFilePid({ filePid })

  const {
    assignAuthHeader,
    wrapResponderAuthTimedLookup
  } = await configureAuthTimedLookup({ fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger })

  const { server, start, stop, option } = await configureServerBase({ protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam })

  const { factDB, timer } = await configureStatusCollector({
    collectPath: statusCollectPath,
    collectUrl: statusCollectUrl,
    collectInterval: statusCollectInterval,
    getExtraHeaders: () => {
      const [ key, value ] = assignAuthHeader()
      return { [ key ]: value }
    }
  })

  const responderLogEnd = createResponderLogEnd(logger.add)
  const responderAuthCheck = wrapResponderAuthTimedLookup((store) => responderEndWithStatusCode(store, { statusCode: 200 }))

  const routerMap = createRouteMap([
    [ '/status-visualize', 'GET', createResponderStatusVisualize('/status-state', '/auth') ],
    [ '/status-state', 'GET', wrapResponderAuthTimedLookup(createResponderStatusState(factDB.getState)) ],
    [ '/auth', 'GET', responderAuthCheck ],
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

  return { server, start, stop, option, factDB, timer }
}

export { createServer }
