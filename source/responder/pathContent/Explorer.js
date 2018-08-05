import { join } from 'path'
import { binary } from 'dr-js/module/common/format'
import { catchAsync } from 'dr-js/module/common/error'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { createPathPrefixLock } from 'dr-js/module/node/file/function'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendBufferCompress, responderSendJSON } from 'dr-js/module/node/server/Responder/Send'
import { createResponderServeStatic } from 'dr-js/module/node/server/Responder/ServeStatic'
import { runQuiet } from 'dr-js/module/node/system/Run'

import { createFileChunkUpload } from 'source/task/getFileChunkUpload'
import { createGetPathModify } from 'source/task/getPathModify'
import { prepareBufferDataHTML } from 'source/responder/function'
import { getHTML } from './explorerHTML'

// TODO: edit file
// TODO: sorting

const createResponderExplorer = async ({
  urlAuthCheck = '/auth',
  urlPathModify = '/path-modify',
  urlPathBatchModify = '/path-batch-modify',
  urlFileUpload = '/file-chunk-upload',
  urlFileServe = '/file-serve',
  urlStorageStatus = '/storage-status'
}) => {
  const bufferData = await prepareBufferDataHTML(Buffer.from(getHTML({
    URL_AUTH_CHECK: urlAuthCheck,
    URL_PATH_MODIFY: urlPathModify,
    URL_PATH_BATCH_MODIFY: urlPathBatchModify,
    URL_FILE_UPLOAD: urlFileUpload,
    URL_FILE_SERVE: urlFileServe,
    URL_STORAGE_STATUS: urlStorageStatus
  })))
  return (store) => responderSendBufferCompress(store, bufferData)
}

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
  const runQuick = async (command, option) => {
    const { promise, stdoutBufferPromise } = runQuiet({ command, option })
    await promise
    return (await stdoutBufferPromise).toString()
  }

  const getStatus = process.platform !== 'win32'
    ? () => runQuick('df -h .', { cwd: rootPath })
    : () => runQuick('df -h .', { cwd: rootPath }).catch(() => // win32 alternative
      runQuick('dir | find "bytes free"', { cwd: rootPath }) // sample stdout: `27 Dir(s)  147,794,321,408 bytes free`
        .then((stdout) => `${binary(Number(stdout.match(/([\d,]+) bytes free/)[ 1 ].replace(/\D/g, '')))}B storage free`)
    )

  return async (store) => responderSendJSON(store, { object: { storageStatusText: await getStatus() } })
}

export {
  createResponderExplorer,
  createResponderPathModify,
  createResponderPathBatchModify,
  createResponderServeFile,
  createResponderFileChunkUpload,
  createResponderStorageStatus
}
