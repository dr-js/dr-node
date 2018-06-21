import { createHash } from 'crypto'

import { toString as arrayBufferToString } from 'dr-js/module/common/data/ArrayBuffer'
import { parseChainArrayBufferPacket } from 'dr-js/module/common/data/ArrayBufferPacket'
import { receiveBufferAsync, toArrayBuffer } from 'dr-js/module/node/data/Buffer'
import { createPathPrefixLock } from 'dr-js/module/node/file/function'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendBufferCompress, responderSendJSON } from 'dr-js/module/node/server/Responder/Send'
import { createResponderServeStatic } from 'dr-js/module/node/server/Responder/ServeStatic'

import { createFileChunkUpload } from 'source/task/getFileChunkUpload'
import { createGetPathContent } from 'source/task/getPathContent'
import { createGetPathModify } from 'source/task/getPathModify'
import { prepareBufferDataHTML } from 'source/responder/function'
import { getHTML } from './explorerHTML'

// TODO: list file basic stat info (size / time)
// TODO: edit file
// TODO: sorting

const createResponderExplorer = async ({
  fileUploadUrl = '/file-chunk-upload',
  pathStatusUrl = '/path-status',
  pathContentUrl = '/path-content',
  pathModifyUrl = '/path-modify',
  serveFileUrl = '/serve-file',
  authCheckUrl = '/auth'
}) => {
  const bufferData = await prepareBufferDataHTML(Buffer.from(getHTML({
    PATH_STATUS_URL: pathStatusUrl,
    PATH_CONTENT_URL: pathContentUrl,
    PATH_MODIFY_URL: pathModifyUrl,
    FILE_UPLOAD_URL: fileUploadUrl,
    SERVE_FILE_URL: serveFileUrl,
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

const createResponderServeFile = (rootPath) => {
  const getPath = createPathPrefixLock(rootPath)
  const responderServeStatic = createResponderServeStatic({ expireTime: 1000 }) // 1000 ms expire
  return (store, relativePath) => responderServeStatic(store, getPath(relativePath))
}

const createResponderFileChunkUpload = async (option) => {
  const fileChunkUpload = await createFileChunkUpload(option)
  return async (store) => {
    const [ headerArrayBuffer, chunkHashArrayBuffer, chunkArrayBuffer ] = parseChainArrayBufferPacket(toArrayBuffer(await receiveBufferAsync(store.request)))
    const { filePath: filePathRaw, chunkByteLength, chunkIndex, chunkTotal } = JSON.parse(arrayBufferToString(headerArrayBuffer))
    const chunkBuffer = Buffer.from(chunkArrayBuffer)

    if (chunkByteLength !== chunkBuffer.length) throw new Error(`chunk length mismatch, get: ${chunkBuffer.length}, expect ${chunkByteLength}`)

    if (chunkHashArrayBuffer.byteLength) { // TODO: Currently optional, wait for non-isSecureContext browser crypto
      const chunkHashBuffer = Buffer.from(chunkHashArrayBuffer)
      const verifyChunkHashBuffer = createHash('sha256').update(chunkBuffer).digest()
      if ((Buffer.compare(chunkHashBuffer, verifyChunkHashBuffer) !== 0)) {
        throw new Error(`chunk hash mismatch, get: ${verifyChunkHashBuffer.toString('base64')}, expect ${chunkHashBuffer.toString('base64')}`)
      }
    }

    await fileChunkUpload(chunkBuffer, chunkIndex, chunkTotal, filePathRaw, store.request.socket.remoteAddress)

    responderEndWithStatusCode(store, { statusCode: 200 })
  }
}

export {
  createResponderExplorer,
  createResponderPathContent,
  createResponderPathModify,
  createResponderServeFile,
  createResponderFileChunkUpload
}
