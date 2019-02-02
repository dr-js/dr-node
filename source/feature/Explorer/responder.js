import { posix } from 'path'
import { catchAsync } from 'dr-js/module/common/error'
import { indentLine } from 'dr-js/module/common/string'

import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { createPathPrefixLock } from 'dr-js/module/node/file/function'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendJSON } from 'dr-js/module/node/server/Responder/Send'
import { createResponderServeStatic } from 'dr-js/module/node/server/Responder/ServeStatic'

import { getCommonServerStatus } from 'source/function'

import { createFileChunkUpload } from './task/fileChunkUpload'
import { createGetPathAction } from './task/pathAction'

const createResponderPathAction = ({
  rootPath,
  logger
}) => {
  const posixNormalize = (relativeRoot, name) => posix.normalize(posix.join(relativeRoot, name))
  const getPathAction = createGetPathAction(rootPath)
  return async (
    store,
    nameList, // mostly will be: `[ '' ]`
    actionType,
    relativeRootFrom,
    relativeRootTo
  ) => {
    logger.add(`[path-action|${actionType}] ${relativeRootFrom || ''}${relativeRootTo ? ` : ${relativeRootTo}` : ''} (${nameList.join(', ')})`)
    const resultList = []
    const errorList = []
    for (const name of nameList) {
      const relativeFrom = posixNormalize(relativeRootFrom, name)
      const relativeTo = relativeRootTo && posixNormalize(relativeRootTo, name)
      const { result, error } = await catchAsync(getPathAction, actionType, relativeFrom, relativeTo)
      const response = { actionType, relativeFrom, relativeTo, ...result }
      error ? errorList.push({ ...response, error: error.toString() }) : resultList.push(response)
    }
    return responderSendJSON(store, { object: { resultList, errorList } })
  }
}

const createResponderServeFile = ({
  rootPath
}) => {
  const getPath = createPathPrefixLock(rootPath)
  const responderServeStatic = createResponderServeStatic({ expireTime: 1000 }) // 1000 ms expire
  return (store, relativePath) => responderServeStatic(store, getPath(relativePath))
}

const createResponderFileChunkUpload = async ({
  rootPath,
  mergePath,
  logger
}) => {
  const fileChunkUpload = await createFileChunkUpload({
    rootPath,
    mergePath,
    onError: (error) => {
      logger.add(`[ERROR][FileChunkUpload] ${error}`)
      console.error(error)
    }
  })
  return async (store, extraFileUploadOption = {}) => {
    await fileChunkUpload({
      bufferPacket: await receiveBufferAsync(store.request),
      ...extraFileUploadOption
    })
    responderEndWithStatusCode(store, { statusCode: 200 })
  }
}

const createResponderStorageStatus = ({
  rootPath
}) => async (store) => {
  const storageStatusText = (await getCommonServerStatus(rootPath))
    .map(([ title, output ]) => output && `${`[${title}] `.padEnd(80, '=')}\n${indentLine(output, '  ')}`)
    .filter(Boolean).join('\n')
  return responderSendJSON(store, { object: { storageStatusText } })
}

export {
  createResponderPathAction,
  createResponderServeFile,
  createResponderFileChunkUpload,
  createResponderStorageStatus
}
