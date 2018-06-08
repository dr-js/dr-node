import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { createRequestListener } from 'dr-js/module/node/server/Server'
import {
  responderEnd,
  responderEndWithStatusCode,
  createResponderParseURL,
  createResponderLog,
  createResponderLogEnd
} from 'dr-js/module/node/server/Responder/Common'
import { createResponderFavicon } from 'dr-js/module/node/server/Responder/Send'
import { createResponderRouter, createRouteMap, getRouteParamAny } from 'dr-js/module/node/server/Responder/Router'

import { configureLogger } from 'dr-server/module/configure/logger'
import { configureFilePid } from 'dr-server/module/configure/filePid'
import { configureAuthTimedLookup } from 'dr-server/module/configure/auth'
import { configureServerBase } from 'dr-server/module/configure/serverBase'

import { createResponderRouteList } from 'dr-server/module/responder/routeList'
import {
  createResponderExplorer,
  createResponderPathContent,
  createResponderPathModify,
  createResponderServeFile,
  createResponderFileChunkUpload
} from 'dr-server/module/responder/pathContent/Explorer'

const createServer = async ({
  // common
  filePid, shouldIgnoreExistPid,
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathLogDirectory, prefixLogFile,
  // auth
  fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,
  // file upload
  uploadRootPath, uploadMergePath
}) => {
  await configureFilePid({ filePid, shouldIgnoreExistPid })
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
    [ '/explorer', 'GET', await createResponderExplorer({ fileUploadUrl: '/file-chunk-upload', pathStatusUrl: '/path-status', pathContentUrl: '/path-content', pathModifyUrl: '/path-modify', serveFileUrl: '/serve-file', authCheckUrl: '/auth' }) ],
    [ '/file-chunk-upload', 'POST', wrapResponderCheckAuthCheckCode(responderFileChunkUpload) ],
    [ '/path-content/*', 'GET', wrapResponderCheckAuthCheckCode((store) => responderPathContent(store, decodeURI(getRouteParamAny(store)))) ],
    [ '/path-modify', 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { modifyType, relativePathFrom, relativePathTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathModify(store, modifyType, relativePathFrom, relativePathTo)
    }) ],
    [ '/serve-file/*', 'GET', wrapResponderCheckAuthCheckCode((store) => responderServeFile(store, decodeURI(getRouteParamAny(store)))) ],
    [ '/auth', 'GET', wrapResponderCheckAuthCheckCode((store) => responderEndWithStatusCode(store, { statusCode: 200 })) ],
    [ '/', 'GET', createResponderRouteList(() => routerMap) ],
    [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ]
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
