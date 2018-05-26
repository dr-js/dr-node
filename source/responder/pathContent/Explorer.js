import { createHash } from 'crypto'

import { parseBufferString } from 'dr-js/module/common/data/ArrayBuffer'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { parseBufferPacket } from 'dr-js/module/node/data/BufferPacket'
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
    const [ headerString, payloadBuffer ] = parseBufferPacket(await receiveBufferAsync(store.request))
    const { filePath: filePathRaw, chunkByteLength, chunkHashBufferString, chunkIndex, chunkTotal } = JSON.parse(headerString)

    if (chunkByteLength !== payloadBuffer.length) throw new Error(`chunk length mismatch, get: ${payloadBuffer.length}, expect ${chunkByteLength}`)

    if (chunkHashBufferString) { // TODO: wait for non-isSecureContext browser crypto
      const chunkHashBuffer = Buffer.from(parseBufferString(chunkHashBufferString))
      const verifyChunkHashBuffer = createHash('sha256').update(payloadBuffer).digest()
      if ((Buffer.compare(chunkHashBuffer, verifyChunkHashBuffer) !== 0)) {
        throw new Error(`chunk hash mismatch, get: ${verifyChunkHashBuffer.toString('base64')}, expect ${chunkHashBuffer.toString('base64')}`)
      }
    }

    await fileChunkUpload(payloadBuffer, chunkIndex, chunkTotal, filePathRaw, store.request.socket.remoteAddress)

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
