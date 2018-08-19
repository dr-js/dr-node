import { clock, getTimestamp } from 'dr-js/module/common/time'
import { roundFloat } from 'dr-js/module/common/math/base'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
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
import { configureStatusCollector } from 'dr-server/module/configure/status/Collector'
import { createResponderStatusVisualize, createResponderStatusState } from 'dr-server/module/responder/status/Visualize'

const createServer = async ({
  // common
  filePid, shouldIgnoreExistPid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, prefixLogFile,
  // auth
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // status collect
  statusCollectPath, statusCollectUrl, statusCollectInterval
}) => {
  await configureFilePid({ filePid, shouldIgnoreExistPid })
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
    getExtraHeaders: () => ({ 'auth-check-code': generateAuthCheckCode() })
  })

  const responderLogEnd = createResponderLogEnd(logger.add)
  const responderAuthCheck = wrapResponderCheckAuthCheckCode((store) => responderEndWithStatusCode(store, { statusCode: 200 }))
  const responderStatusCollect = async (store) => {
    const statusBuffer = await receiveBufferAsync(store.request)
    __DEV__ && console.log(`statusBuffer`, statusBuffer.toString())
    factDB.add({ timestamp: getTimestamp(), retryCount: 0, status: JSON.parse(statusBuffer), timeOk: 0, timeDownload: roundFloat(clock() - store.getState().time) })
    responderEndWithStatusCode(store, { statusCode: 200 })
  }

  const routerMap = createRouteMap([
    [ '/status-visualize', 'GET', await createResponderStatusVisualize('/status-state', '/auth') ],
    [ '/status-state', 'GET', wrapResponderCheckAuthCheckCode(createResponderStatusState(factDB.getState)) ],
    [ '/status-collect', 'POST', wrapResponderCheckAuthCheckCode(responderStatusCollect) ],
    [ '/auth', 'GET', responderAuthCheck ],
    [ '/', 'GET', __DEV__ ? createResponderRouteList(() => routerMap) : (store) => responderEndWithRedirect(store, { redirectUrl: '/status-visualize' }) ],
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

  return { server, start, stop, option, logger, timer }
}

export { createServer }
