import { createPathPrefixLock } from '@dr-js/core/module/node/file/Path'
import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderServeStatic } from '@dr-js/core/module/node/server/Responder/ServeStatic'

import { createOnFileChunkUpload } from '@dr-js/core/module/node/module/FileChunkUpload'
import { getRequestBuffer } from 'source/module/RequestCommon'

const createResponderServeFile = ({
  rootPath,
  responderFallback // (store, { error, relativePath }) => {}
}) => {
  const getPath = createPathPrefixLock(rootPath)
  const responderServeStatic = createResponderServeStatic({ expireTime: 10 * 1000 }) // 10sec expire
  return responderFallback
    ? (store, relativePath) => responderServeStatic(store, getPath(relativePath)).catch((error) => responderFallback(store, { error, relativePath }))
    : (store, relativePath) => responderServeStatic(store, getPath(relativePath))
}

const createResponderFileChunkUpload = async ({
  rootPath,
  mergePath,
  loggerExot
}) => {
  const fileChunkUpload = await createOnFileChunkUpload({
    rootPath,
    mergePath,
    onError: (error) => {
      loggerExot.add(`[ERROR][FileChunkUpload] ${error}`)
      console.error(error)
    }
  })
  return async (store, extraFileUploadOption = {}) => {
    await fileChunkUpload({
      bufferPacket: await getRequestBuffer(store),
      ...extraFileUploadOption
    })
    return responderEndWithStatusCode(store, { statusCode: 200 })
  }
}

export {
  createResponderServeFile,
  createResponderFileChunkUpload
}
