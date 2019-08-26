import { posix } from 'path'
import { catchAsync } from '@dr-js/core/module/common/error'
import { indentLine } from '@dr-js/core/module/common/string'

import { createPathPrefixLock } from '@dr-js/core/module/node/file/Path'
import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'
import { responderSendJSON } from '@dr-js/core/module/node/server/Responder/Send'
import { createResponderServeStatic } from '@dr-js/core/module/node/server/Responder/ServeStatic'

import { createFileChunkUpload } from './task/fileChunkUpload'
import { createGetPathAction } from './task/pathAction'
import { getCommonServerStatus } from './task/serverStatus'

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
      const key = posixNormalize(relativeRootFrom, name)
      const keyTo = relativeRootTo && posixNormalize(relativeRootTo, name)
      const { result, error } = await catchAsync(getPathAction, actionType, key, keyTo)
      const response = { actionType, key, keyTo, ...result }
      response.relativeFrom = key // TODO: DEPRECATED back support code, drop at 20190930?
      response.relativeTo = keyTo // TODO: DEPRECATED back support code, drop at 20190930?
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
      bufferPacket: await store.requestBuffer(),
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
