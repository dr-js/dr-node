import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { responderSendBufferCompress, prepareBufferDataAsync } from 'dr-js/module/node/server/Responder/Send'
import { getRouteParamAny } from 'dr-js/module/node/server/Responder/Router'

import { getHTML } from './HTML/main'
import {
  createResponderPathModify,
  createResponderPathBatchModify,
  createResponderServeFile,
  createResponderFileChunkUpload,
  createResponderStorageStatus
} from './responder'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  uploadRootPath,
  uploadMergePath,

  // TODO: maybe less specific, or optional?
  urlAuthCheck = '', // [ '/auth', 'GET', wrapResponderCheckAuthCheckCode((store) => responderEndWithStatusCode(store, { statusCode: 200 })) ]
  wrapResponderCheckAuthCheckCode = (responder) => responder
}) => {
  const URL_HTML = `${routePrefix}/explorer`
  const URL_PATH_MODIFY = `${routePrefix}/path-modify`
  const URL_PATH_BATCH_MODIFY = `${routePrefix}/path-batch-modify`
  const URL_FILE_UPLOAD = `${routePrefix}/file-chunk-upload`
  const URL_FILE_SERVE = `${routePrefix}/file-serve`
  const URL_STORAGE_STATUS = `${routePrefix}/storage-status`

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    URL_AUTH_CHECK: urlAuthCheck,
    URL_PATH_MODIFY,
    URL_PATH_BATCH_MODIFY,
    URL_FILE_UPLOAD,
    URL_FILE_SERVE,
    URL_STORAGE_STATUS
  })), BASIC_EXTENSION_MAP.html)

  const responderPathModify = createResponderPathModify(uploadRootPath)
  const responderPathBatchModify = createResponderPathBatchModify(uploadRootPath)
  const responderFileChunkUpload = await createResponderFileChunkUpload({
    rootPath: uploadRootPath,
    mergePath: uploadMergePath,
    onError: (error) => {
      logger.add(`[ERROR] ${error}`)
      console.error(error)
    }
  })
  const responderFileServe = createResponderServeFile(uploadRootPath)
  const responderStorageStatus = createResponderStorageStatus(uploadRootPath)

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_PATH_MODIFY, 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { modifyType, relativePathFrom, relativePathTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathModify(store, modifyType, relativePathFrom, relativePathTo)
    }) ],
    [ URL_PATH_BATCH_MODIFY, 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { nameList, modifyType, relativePathFrom, relativePathTo } = JSON.parse(await receiveBufferAsync(store.request))
      return responderPathBatchModify(store, nameList, modifyType, relativePathFrom, relativePathTo)
    }) ],
    [ URL_FILE_UPLOAD, 'POST', wrapResponderCheckAuthCheckCode(responderFileChunkUpload) ],
    [ `${URL_FILE_SERVE}/*`, 'GET', wrapResponderCheckAuthCheckCode((store) => responderFileServe(store, decodeURIComponent(getRouteParamAny(store)))) ],
    [ URL_STORAGE_STATUS, 'GET', wrapResponderCheckAuthCheckCode(responderStorageStatus) ]
  ]

  return {
    URL_HTML,
    URL_PATH_MODIFY,
    URL_PATH_BATCH_MODIFY,
    URL_FILE_UPLOAD,
    URL_FILE_SERVE,
    URL_STORAGE_STATUS,
    routeList
  }
}

export { configureFeaturePack }
