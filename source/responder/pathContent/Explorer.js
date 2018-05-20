import { createPathPrefixLock } from 'dr-js/module/node/file/function'
import { responderSendBufferCompress, responderSendJSON } from 'dr-js/module/node/server/Responder/Send'
import { createResponderServeStatic } from 'dr-js/module/node/server/Responder/ServeStatic'

import { createGetPathContent } from 'source/task/getPathContent'
import { createGetPathModify } from 'source/task/getPathModify'
import { prepareBufferDataHTML } from 'source/responder/function'
import { getHTML } from './explorerHTML'

// TODO: list file basic stat info (size / time)
// TODO: edit file
// TODO: sorting

const createResponderExplorer = async (
  pathContentUrl = '/path-content',
  pathModifyUrl = '/path-modify',
  sendFileUrl = '/send-file',
  authCheckUrl = '/auth'
) => {
  const bufferData = await prepareBufferDataHTML(Buffer.from(getHTML({
    PATH_CONTENT_URL: pathContentUrl,
    PATH_MODIFY_URL: pathModifyUrl,
    SEND_FILE_URL: sendFileUrl,
    AUTH_CHECK_URL: authCheckUrl
  })))
  return (store) => responderSendBufferCompress(store, bufferData)
}

const createResponderPathContent = (rootPath, extraData) => {
  const getPathContent = createGetPathContent(rootPath, extraData)
  return async (store, relativePath) => responderSendJSON(store, { object: await getPathContent(relativePath) })
}

const createResponderPathModify = (rootPath, extraData) => {
  const getPathModify = createGetPathModify(rootPath, extraData)
  return async (store, modifyType, relativePathFrom, relativePathTo) => responderSendJSON(store, { object: await getPathModify(modifyType, relativePathFrom, relativePathTo) })
}

const createResponderSendFile = (rootPath) => {
  const getPath = createPathPrefixLock(rootPath)
  const responderServeStatic = createResponderServeStatic({ expireTime: 1000 }) // 1000 ms expire
  return (store, relativePath) => responderServeStatic(store, getPath(relativePath))
}

export {
  createResponderExplorer,
  createResponderPathContent,
  createResponderPathModify,
  createResponderSendFile
}
