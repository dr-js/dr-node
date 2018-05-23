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

import { configureLogger } from 'dr-server/module/configure/logger'
import { configureFilePid } from 'dr-server/module/configure/filePid'
import { configureAuthTimedLookup } from 'dr-server/module/configure/auth'
import { configureServerBase } from 'dr-server/module/configure/serverBase'

import { createRouteGetFavicon } from 'dr-server/module/responder/favicon'
import { createResponderRouteList } from 'dr-server/module/responder/routeList'
import { createResponderUploader, createResponderFileChunkUpload } from 'dr-server/module/responder/fileUpload/Uploader'
import { createResponderExplorer, createResponderPathContent, createResponderPathModify, createResponderServeFile } from 'dr-server/module/responder/pathContent/Explorer'

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
  const { server, start, stop, option } = await configureServerBase({
    protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
  })
  const logger = await configureLogger({ pathLogDirectory, prefixLogFile })
  const { wrapResponderCheckAuthCheckCode } = await configureAuthTimedLookup({
    fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap, logger
  })

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
  const responderServeFile = createResponderServeFile(uploadRootPath)

  const routerMap = createRouteMap([
    [ '/uploader', 'GET', await createResponderUploader('/file-chunk-upload', '/auth') ],
    [ '/file-chunk-upload', 'POST', wrapResponderCheckAuthCheckCode(responderFileChunkUpload) ],
    [ '/explorer', 'GET', await createResponderExplorer('/path-content', '/path-modify', '/serve-file', '/auth') ],
    [ '/path-content/*', 'GET', wrapResponderCheckAuthCheckCode((store) => responderPathContent(store, decodeURI(getRouteParamAny(store)))) ],
    [ '/path-modify', 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { modifyType, relativePathFrom, relativePathTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathModify(store, modifyType, relativePathFrom, relativePathTo)
    }) ],
    [ '/serve-file/*', 'GET', wrapResponderCheckAuthCheckCode((store) => responderServeFile(store, decodeURI(getRouteParamAny(store)))) ],
    [ '/auth', 'GET', wrapResponderCheckAuthCheckCode((store) => responderEndWithStatusCode(store, { statusCode: 200 })) ],
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
