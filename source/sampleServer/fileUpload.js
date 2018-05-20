import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { createRequestListener } from 'dr-js/module/node/server/Server'
import {
  responderEnd,
  responderEndWithStatusCode,
  createResponderParseURL,
  createResponderLog,
  createResponderLogEnd
} from 'dr-js/module/node/server/Responder/Common'
import { createResponderRouter, createRouteMap, getRouteParamAny } from 'dr-js/module/node/server/Responder/Router'

import { configureLogger } from 'source/configure/logger'
import { configureFilePid } from 'source/configure/filePid'
import { configureAuthTimedLookup } from 'source/configure/auth'
import { configureServerBase } from 'source/configure/serverBase'
import { createRouteGetFavicon } from 'source/responder/favicon'
import { createResponderRouteList } from 'source/responder/routeList'
import { createResponderUploader, createResponderFileChunkUpload } from 'source/responder/fileUpload/Uploader'
import { createResponderExplorer, createResponderPathContent, createResponderPathModify, createResponderSendFile } from 'source/responder/pathContent/Explorer'

const createServer = async ({
  // common
  filePid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, prefixLogFile,
  // auth
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // file upload
  uploadRootPath, uploadMergePath
}) => {
  await configureFilePid({ filePid })
  const { server, start, stop, option } = await configureServerBase({ protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam })
  const logger = await configureLogger({ pathLogDirectory, prefixLogFile })
  const {
    wrapResponderAuthTimedLookup
  } = await configureAuthTimedLookup({ fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger })

  const responderLogEnd = createResponderLogEnd(logger.add)
  const responderFileChunkUpload = await createResponderFileChunkUpload({
    rootPath: uploadRootPath,
    mergePath: uploadMergePath,
    onError: (error) => {
      logger.add(`[ERROR] ${error}`)
      console.error(error)
    }
  })
  const responderPathContent = createResponderPathContent(uploadRootPath)
  const responderPathModify = createResponderPathModify(uploadRootPath)
  const responderSendFile = createResponderSendFile(uploadRootPath)

  const routerMap = createRouteMap([
    [ '/auth', 'GET', wrapResponderAuthTimedLookup((store) => responderEndWithStatusCode(store, { statusCode: 200 })) ],
    [ '/uploader', 'GET', await createResponderUploader('/file-chunk-upload', '/auth') ],
    [ '/file-chunk-upload', 'POST', wrapResponderAuthTimedLookup(responderFileChunkUpload) ],
    [ '/explorer', 'GET', await createResponderExplorer('/path-content', '/path-modify', '/send-file', '/auth') ],
    [ '/path-content/*', 'GET', wrapResponderAuthTimedLookup((store) => responderPathContent(store, decodeURI(getRouteParamAny(store)))) ],
    [ '/path-modify', 'POST', wrapResponderAuthTimedLookup(async (store) => {
      const { modifyType, relativePathFrom, relativePathTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathModify(store, modifyType, relativePathFrom, relativePathTo)
    }) ],
    [ '/send-file/*', 'GET', wrapResponderAuthTimedLookup((store) => responderSendFile(store, decodeURI(getRouteParamAny(store)))) ],
    [ '/', 'GET', createResponderRouteList(() => routerMap) ],
    await createRouteGetFavicon()
  ].filter(Boolean))

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
