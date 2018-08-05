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
import { createResponderRouter, createRouteMap, getRouteParamAny } from 'dr-js/module/node/server/Responder/Router'

import { configureLogger } from 'dr-server/module/configure/logger'
import { configureFilePid } from 'dr-server/module/configure/filePid'
import { configureAuthTimedLookup } from 'dr-server/module/configure/auth'
import { configureServerBase } from 'dr-server/module/configure/serverBase'

import { createResponderRouteList } from 'dr-server/module/responder/routeList'
import {
  createResponderExplorer,
  createResponderPathModify,
  createResponderPathBatchModify,
  createResponderServeFile,
  createResponderFileChunkUpload,
  createResponderStorageStatus
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
  const responderPathModify = createResponderPathModify(uploadRootPath)
  const responderPathBatchModify = createResponderPathBatchModify(uploadRootPath)
  const responderServeFile = createResponderServeFile(uploadRootPath)
  const responderStorageStatus = createResponderStorageStatus(uploadRootPath)

  const routerMap = createRouteMap([
    [ '/explorer', 'GET', await createResponderExplorer({
      urlAuthCheck: '/auth',
      urlPathModify: '/path-modify',
      urlPathBatchModify: '/path-batch-modify',
      urlFileUpload: '/file-chunk-upload',
      urlFileServe: '/file-serve',
      urlStorageStatus: '/storage-status'
    }) ],
    [ '/path-modify', 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { modifyType, relativePathFrom, relativePathTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathModify(store, modifyType, relativePathFrom, relativePathTo)
    }) ],
    [ '/path-batch-modify', 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { nameList, modifyType, relativePathFrom, relativePathTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathBatchModify(store, nameList, modifyType, relativePathFrom, relativePathTo)
    }) ],
    [ '/file-chunk-upload', 'POST', wrapResponderCheckAuthCheckCode(responderFileChunkUpload) ],
    [ '/storage-status', 'GET', wrapResponderCheckAuthCheckCode(responderStorageStatus) ],
    [ '/file-serve/*', 'GET', wrapResponderCheckAuthCheckCode((store) => responderServeFile(store, decodeURIComponent(getRouteParamAny(store)))) ],
    [ '/auth', 'GET', wrapResponderCheckAuthCheckCode((store) => responderEndWithStatusCode(store, { statusCode: 200 })) ],
    [ '/', 'GET', __DEV__ ? createResponderRouteList(() => routerMap) : (store) => responderEndWithRedirect(store, { redirectUrl: '/explorer' }) ],
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

  return { server, start, stop, option, logger }
}

export { createServer }
