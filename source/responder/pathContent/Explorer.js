import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { createPathPrefixLock } from 'dr-js/module/node/file/function'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendBufferCompress, responderSendJSON } from 'dr-js/module/node/server/Responder/Send'
import { createResponderServeStatic } from 'dr-js/module/node/server/Responder/ServeStatic'

import { createFileChunkUpload } from 'source/task/getFileChunkUpload'
import { createGetPathModify } from 'source/task/getPathModify'
import { prepareBufferDataHTML } from 'source/responder/function'
import { getHTML } from './explorerHTML'

// TODO: list file basic stat info (size / time)
// TODO: edit file
// TODO: sorting

const createResponderExplorer = async ({
  urlAuthCheck = '/auth',
  urlPathModify = '/path-modify',
  urlFileUpload = '/file-chunk-upload',
  urlFileServe = '/file-serve'
}) => {
  const bufferData = await prepareBufferDataHTML(Buffer.from(getHTML({
    URL_AUTH_CHECK: urlAuthCheck,
    URL_PATH_MODIFY: urlPathModify,
    URL_FILE_UPLOAD: urlFileUpload,
    URL_FILE_SERVE: urlFileServe
  })))
  return (store) => responderSendBufferCompress(store, bufferData)
}

const createResponderPathModify = (rootPath) => {
  const getPathModify = createGetPathModify(rootPath)
  return async (store, modifyType, relativePathFrom, relativePathTo) => responderSendJSON(store, {
    object: await getPathModify(modifyType, relativePathFrom, relativePathTo)
  })
}

const createResponderServeFile = (rootPath) => {
  const getPath = createPathPrefixLock(rootPath)
  const responderServeStatic = createResponderServeStatic({ expireTime: 1000 }) // 1000 ms expire
  return (store, relativePath) => responderServeStatic(store, getPath(relativePath))
}

const createResponderFileChunkUpload = async (option) => {
  const fileChunkUpload = await createFileChunkUpload(option)
  return async (store) => {
    await fileChunkUpload(await receiveBufferAsync(store.request), store.request.socket.remoteAddress)
    responderEndWithStatusCode(store, { statusCode: 200 })
  }
}

export {
  createResponderExplorer,
  createResponderPathModify,
  createResponderServeFile,
  createResponderFileChunkUpload
}
