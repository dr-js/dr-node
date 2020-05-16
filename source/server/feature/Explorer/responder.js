import { posix } from 'path'
import { catchAsync } from '@dr-js/core/module/common/error'
import { indentLine } from '@dr-js/core/module/common/string'

import { createPathPrefixLock } from '@dr-js/core/module/node/file/Path'
import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'
import { responderSendJSON } from '@dr-js/core/module/node/server/Responder/Send'
import { createResponderServeStatic } from '@dr-js/core/module/node/server/Responder/ServeStatic'

import { getCommonServerStatus } from 'source/module/ServerStatus'
import { createFileChunkUpload } from 'source/module/FileChunkUpload'
import { PATH_ACTION_MAP, createPathActionTask } from 'source/module/PathAction/base'
import { PATH_ACTION_MAP as EXTRA_COMPRESS_PATH_ACTION_MAP } from 'source/module/PathAction/extraCompress'
import { getRequestBuffer } from 'source/module/RequestCommon'

const createResponderPathAction = ({
  rootPath,
  logger
}) => {
  const posixNormalize = (relativeRoot, name) => posix.normalize(posix.join(relativeRoot, name))
  const pathActionTask = createPathActionTask({ rootPath, pathActionMap: { ...PATH_ACTION_MAP, ...EXTRA_COMPRESS_PATH_ACTION_MAP } })
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
      const { result, error } = await catchAsync(pathActionTask, actionType, key, keyTo)
      const response = { actionType, key, keyTo, ...result }
      error ? errorList.push({ ...response, error: String(error) }) : resultList.push(response)
    }
    return responderSendJSON(store, { object: { resultList, errorList } })
  }
}

const createResponderServeFile = ({
  rootPath
}) => {
  const getPath = createPathPrefixLock(rootPath)
  const responderServeStatic = createResponderServeStatic({ expireTime: 10000 }) // 10sec expire
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
      bufferPacket: await getRequestBuffer(store),
      ...extraFileUploadOption
    })
    responderEndWithStatusCode(store, { statusCode: 200 })
  }
}

const createResponderStorageStatus = ({
  rootPath, statusCommandList
}) => async (store) => {
  const storageStatusText = (await getCommonServerStatus(rootPath, statusCommandList))
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
