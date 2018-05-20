import { createHash } from 'crypto'

import { parseBufferString } from 'dr-js/module/common/data/ArrayBuffer'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { parseBufferPacket } from 'dr-js/module/node/data/BufferPacket'

import { createFileChunkUpload } from 'source/task/getFileChunkUpload'
import { prepareBufferDataHTML } from 'source/responder/function'
import { getHTML } from './uploaderHTML'

// TODO: list uploaded file basic info
// TODO: re-upload failed file

const createResponderUploader = async (
  fileUploadUrl = '/file-chunk-upload',
  pathStatusUrl = '/path-status',
  authCheckUrl = '/auth'
) => {
  const bufferData = await prepareBufferDataHTML(Buffer.from(getHTML({
    FILE_UPLOAD_URL: fileUploadUrl,
    PATH_STATUS_URL: pathStatusUrl,
    AUTH_CHECK_URL: authCheckUrl
  })))
  return (store) => responderSendBufferCompress(store, bufferData)
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
  createResponderUploader,
  createResponderFileChunkUpload
}
