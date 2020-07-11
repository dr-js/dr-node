import { getRouteParamAny } from '@dr-js/core/module/node/server/Responder/Router'

import { AUTH_SKIP } from 'source/module/Auth'

import {
  createResponderServeFile,
  createResponderFileChunkUpload
} from './responder'

const PERMISSION_CHECK_FILE_UPLOAD_START = 'permission:check:file-upload-start'

const setup = async ({
  name = 'feature:file',
  logger, routePrefix = '',
  featureAuth: { authPack: { authMode }, createResponderCheckAuth },
  featurePermission: { permissionPack: { checkPermission = (type, payload) => true } }, // async (type, { store, ... }) => true/false

  fileRootPath: rootPath,
  fileUploadMergePath: mergePath,

  enhanceFileChunkUploadOption = (option) => option,

  URL_FILE_SERVE = `${routePrefix}/file-serve`,
  URL_FILE_UPLOAD = `${routePrefix}/file-chunk-upload`,

  IS_SKIP_AUTH = authMode === AUTH_SKIP,
  IS_READ_ONLY = !mergePath // TODO: should be decided by user permission
}) => {
  const responderFileServe = createResponderServeFile({ rootPath })
  const responderFileChunkUpload = IS_READ_ONLY
    ? (store, extraFileUploadOption) => {}
    : await createResponderFileChunkUpload({ rootPath, mergePath, logger })

  const routeList = [
    [ `${URL_FILE_SERVE}/*`, 'GET', createResponderCheckAuth({
      responderNext: (store) => responderFileServe(store, decodeURIComponent(getRouteParamAny(store)))
    }) ],
    [ URL_FILE_UPLOAD, 'POST', createResponderCheckAuth({
      responderNext: (store) => responderFileChunkUpload(store, enhanceFileChunkUploadOption({
        onUploadStart: async ({ filePath, key }) => {
          if (IS_SKIP_AUTH || await checkPermission(PERMISSION_CHECK_FILE_UPLOAD_START, { store, filePath, key, IS_READ_ONLY })) return // pass
          throw new Error(`deny file upload: ${key}`) // ends with 500
        }
      }))
    }) ]
  ].filter(Boolean)

  return {
    IS_READ_ONLY,

    URL_FILE_SERVE,
    URL_FILE_UPLOAD,
    routeList,
    name
  }
}

export {
  PERMISSION_CHECK_FILE_UPLOAD_START,
  setup
}
