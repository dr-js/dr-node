import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { responderSendBufferCompress, prepareBufferDataAsync } from 'dr-js/module/node/server/Responder/Send'
import { getRouteParamAny } from 'dr-js/module/node/server/Responder/Router'

import { getHTML } from './HTML/main'
import {
  createResponderPathAction,
  createResponderServeFile,
  createResponderFileChunkUpload,
  createResponderStorageStatus
} from './responder'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  isReadOnly = false,

  explorerRootPath: rootPath,
  explorerUploadMergePath: mergePath,

  // TODO: maybe less specific, or optional?
  isSkipAuth = false,
  urlAuthCheck = '',
  wrapResponderCheckAuthCheckCode = (responder) => responder
}) => {
  if (isReadOnly === Boolean(mergePath)) throw new Error(`[Explorer] expect either isReadOnly: ${isReadOnly} or mergePath: ${mergePath}`)
  if (isSkipAuth === Boolean(urlAuthCheck)) throw new Error(`[Explorer] expect either isSkipAuth: ${isSkipAuth} or urlAuthCheck: ${urlAuthCheck}`)

  const URL_HTML = `${routePrefix}/explorer`
  const URL_PATH_ACTION = `${routePrefix}/path-action`
  const URL_FILE_SERVE = `${routePrefix}/file-serve`
  const URL_FILE_UPLOAD = `${routePrefix}/file-chunk-upload`
  const URL_STORAGE_STATUS = `${routePrefix}/storage-status`

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    IS_SKIP_AUTH: isSkipAuth,
    IS_READ_ONLY: isReadOnly,
    URL_AUTH_CHECK: urlAuthCheck,
    URL_PATH_ACTION,
    URL_FILE_SERVE,
    URL_FILE_UPLOAD,
    URL_STORAGE_STATUS
  })), BASIC_EXTENSION_MAP.html)

  const responderPathAction = createResponderPathAction({ rootPath, isReadOnly, logger })
  const responderFileServe = createResponderServeFile({ rootPath })
  const responderFileChunkUpload = !isReadOnly && await createResponderFileChunkUpload({
    rootPath,
    mergePath,
    onError: (error) => {
      logger.add(`[ERROR][FileChunkUpload] ${error}`)
      console.error(error)
    }
  })
  const responderStorageStatus = !isReadOnly && createResponderStorageStatus({ rootPath })

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_PATH_ACTION, 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { nameList, actionType, relativeFrom, relativeTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathAction(store, nameList, actionType, relativeFrom, relativeTo)
    }) ],
    [ `${URL_FILE_SERVE}/*`, 'GET', wrapResponderCheckAuthCheckCode((store) => responderFileServe(store, decodeURIComponent(getRouteParamAny(store)))) ],
    !isReadOnly && [ URL_FILE_UPLOAD, 'POST', wrapResponderCheckAuthCheckCode(responderFileChunkUpload) ],
    !isReadOnly && [ URL_STORAGE_STATUS, 'GET', wrapResponderCheckAuthCheckCode(responderStorageStatus) ]
  ].filter(Boolean)

  return {
    URL_HTML,
    URL_PATH_ACTION,
    URL_FILE_SERVE,
    URL_FILE_UPLOAD,
    URL_STORAGE_STATUS,
    routeList
  }
}

export { configureFeaturePack }
