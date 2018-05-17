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
import { routeGetFavicon } from 'source/responder/favicon'
import { getRouteGetRouteList } from 'source/responder/routeList'
import { createResponderUploader, createResponderFileChunkUpload } from 'source/responder/fileUpload/Uploader'

const createServer = async ({
  pathLogDirectory, prefixLogFile,
  filePid,
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  uploadRootPath, uploadMergePath
}) => {
  const logger = await configureLogger({ pathLogDirectory, prefixLogFile })

  await configureFilePid({ filePid })

  const { wrapResponderAuthTimedLookup } = await configureAuthTimedLookup({ fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger })

  const { server, start, stop, option } = await configureServerBase({ protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam })

  const responderLogEnd = createResponderLogEnd(logger.add)
  const responderAuthCheck = wrapResponderAuthTimedLookup((store) => responderEndWithStatusCode(store, { statusCode: 200 }))
  const responderFileChunkUpload = wrapResponderAuthTimedLookup(await createResponderFileChunkUpload(uploadRootPath, uploadMergePath, (error) => {
    logger.add(`[ERROR] ${error}`)
    console.error(error)
  }))

  const routerMap = createRouteMap([
    [ '/uploader', 'GET', createResponderUploader('/file-chunk-upload', '/auth') ],
    [ '/file-chunk-upload', 'POST', responderFileChunkUpload ],
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

  return { server, start, stop, option }
}

export { createServer }
