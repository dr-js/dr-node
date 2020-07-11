import { createPathPrefixLock } from '@dr-js/core/module/node/file/Path'
import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderServeStatic } from '@dr-js/core/module/node/server/Responder/ServeStatic'

import { createOnFileChunkUpload } from '@dr-js/core/module/node/module/FileChunkUpload'
import { getRequestBuffer } from 'source/module/RequestCommon'

const createResponderServeFile = ({
  rootPath
}) => {
  const getPath = createPathPrefixLock(rootPath)
  const responderServeStatic = createResponderServeStatic({ expireTime: 10 * 1000 }) // 10sec expire
  return (store, relativePath) => responderServeStatic(store, getPath(relativePath))
}

const createResponderFileChunkUpload = async ({
  rootPath,
  mergePath,
  logger
}) => {
  const fileChunkUpload = await createOnFileChunkUpload({
    rootPath,
    mergePath,
    onError: (error) => {
      logger.add(`[ERROR][FileChunkUpload] ${error}`)
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
