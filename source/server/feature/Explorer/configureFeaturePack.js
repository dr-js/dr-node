import { BASIC_EXTENSION_MAP } from '@dr-js/core/module/common/module/MIME'
import { responderSendBufferCompress, prepareBufferDataAsync } from '@dr-js/core/module/node/server/Responder/Send'
import { getRouteParamAny } from '@dr-js/core/module/node/server/Responder/Router'

import { AUTH_SKIP } from 'source/module/Auth'
import { PATH_ACTION_TYPE } from 'source/module/PathAction'
import { getRequestJSON } from 'source/module/RequestCommon'

import { getHTML } from './HTML/main'
import {
  createResponderPathAction,
  createResponderServeFile,
  createResponderFileChunkUpload,
  createResponderStorageStatus
} from './responder'
import {
  PERMISSION_EXPLORER_PATH_ACTION,
  PERMISSION_EXPLORER_FILE_UPLOAD_START
} from './permission'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',
  featureAuth: { authPack: { authMode }, createResponderCheckAuth, URL_AUTH_CHECK },
  featurePermission: { permissionPack: { checkPermission = (type, payload) => true } }, // async (type, { store, ... }) => true/false

  explorerRootPath: rootPath,
  explorerUploadMergePath: mergePath,
  explorerStatusCommandList: statusCommandList
}) => {
  const URL_HTML = `${routePrefix}/explorer`
  const URL_PATH_ACTION = `${routePrefix}/path-action`
  const URL_FILE_SERVE = `${routePrefix}/file-serve`
  const URL_FILE_UPLOAD = `${routePrefix}/file-chunk-upload`
  const URL_STORAGE_STATUS = `${routePrefix}/storage-status`

  const IS_SKIP_AUTH = authMode === AUTH_SKIP
  const IS_READ_ONLY = !mergePath // TODO: should be decided by user permission

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    URL_AUTH_CHECK,
    URL_PATH_ACTION,
    URL_FILE_SERVE,
    URL_FILE_UPLOAD,
    URL_STORAGE_STATUS,
    IS_SKIP_AUTH,
    IS_READ_ONLY,
    PATH_ACTION_TYPE
  })), BASIC_EXTENSION_MAP.html)

  const responderPathAction = createResponderPathAction({ rootPath, logger })
  const responderFileServe = createResponderServeFile({ rootPath })
  const responderFileChunkUpload = IS_READ_ONLY
    ? (store) => {}
    : await createResponderFileChunkUpload({ rootPath, mergePath, logger })
  const responderStorageStatus = createResponderStorageStatus({ rootPath, statusCommandList })

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_PATH_ACTION, 'POST', createResponderCheckAuth({
      responderNext: async (store) => {
        const { nameList, actionType, key, keyTo } = await getRequestJSON(store)
        if (IS_SKIP_AUTH || await checkPermission(PERMISSION_EXPLORER_PATH_ACTION, { store, actionType })) { // else ends with 400
          return responderPathAction(store, nameList, actionType, key, keyTo)
        }
      }
    }) ],
    [ `${URL_FILE_SERVE}/*`, 'GET', createResponderCheckAuth({
      responderNext: (store) => responderFileServe(store, decodeURIComponent(getRouteParamAny(store)))
    }) ],
    [ URL_FILE_UPLOAD, 'POST', createResponderCheckAuth({
      responderNext: (store) => responderFileChunkUpload(store, {
        onUploadStart: async ({ filePath, key }) => {
          if (IS_SKIP_AUTH || await checkPermission(PERMISSION_EXPLORER_FILE_UPLOAD_START, { store, filePath, key, IS_READ_ONLY })) return // pass
          throw new Error(`deny file upload: ${key}`) // ends with 500
        }
      })
    }) ],
    [ URL_STORAGE_STATUS, 'GET', createResponderCheckAuth({ responderNext: responderStorageStatus }) ]
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