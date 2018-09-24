import { join } from 'path'
import { binary } from 'dr-js/module/common/format'
import { catchAsync } from 'dr-js/module/common/error'

import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { createPathPrefixLock } from 'dr-js/module/node/file/function'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendJSON } from 'dr-js/module/node/server/Responder/Send'
import { createResponderServeStatic } from 'dr-js/module/node/server/Responder/ServeStatic'
import { runQuiet } from 'dr-js/module/node/system/Run'

import { createFileChunkUpload } from './task/getFileChunkUpload'
import { createGetPathModify } from './task/getPathModify'

const createResponderPathModify = (rootPath) => {
  const getPathModify = createGetPathModify(rootPath)
  return async (store, modifyType, relativePathFrom, relativePathTo) => responderSendJSON(store, {
    object: await getPathModify(modifyType, relativePathFrom, relativePathTo)
  })
}

const createResponderPathBatchModify = (rootPath) => {
  const getPathModify = createGetPathModify(rootPath)
  return async (store, nameList, modifyType, relativePathFrom, relativePathTo) => {
    const resultList = []
    const errorList = []
    for (const name of nameList) {
      const { result, error } = await catchAsync(getPathModify, modifyType, join(relativePathFrom, name), relativePathTo && join(relativePathTo, name))
      const response = { name, modifyType, relativePathFrom, relativePathTo, error, result }
      error ? errorList.push(response) : resultList.push(response)
    }
    return responderSendJSON(store, { object: { resultList, errorList } })
  }
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

const createResponderStorageStatus = (rootPath) => {
  const runQuick = async (command) => {
    const { promise, stdoutBufferPromise } = runQuiet({ command, option: { cwd: rootPath } })
    await promise
    return (await stdoutBufferPromise).toString()
  }
  const getPathStatus = () => runQuick('du -hd1').catch(() => '')// no good win32 alternative
  const getDiskStatus = () => runQuick('df -h .').catch(
    () => runQuick('dir | find "bytes free"').then( // win32 alternative, sample stdout: `27 Dir(s)  147,794,321,408 bytes free`
      (stdout) => `${binary(Number(stdout.match(/([\d,]+) bytes free/)[ 1 ].replace(/\D/g, '')))}B storage free`
    )
  )
  return async (store) => responderSendJSON(store, {
    object: {
      storageStatusText: [
        await getPathStatus(),
        await getDiskStatus()
      ].filter(Boolean).join('\n')
    }
  })
}

export {
  createResponderPathModify,
  createResponderPathBatchModify,
  createResponderServeFile,
  createResponderFileChunkUpload,
  createResponderStorageStatus
}
