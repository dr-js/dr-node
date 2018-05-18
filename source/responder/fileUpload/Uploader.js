import { resolve, dirname } from 'path'
import { createReadStream, createWriteStream } from 'fs'
import { createHash } from 'crypto'

import { clock } from 'dr-js/module/common/time'
import { getRandomId } from 'dr-js/module/common/math/random'
import { parseBufferString } from 'dr-js/module/common/data/ArrayBuffer'
import { createCacheMap } from 'dr-js/module/common/data/CacheMap'
import { createAsyncTaskQueue } from 'dr-js/module/common/module/AsyncTaskQueue'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'

import { createPathPrefixLock, writeFileAsync } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { modify } from 'dr-js/module/node/file/Modify'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { parseBufferPacket } from 'dr-js/module/node/data/BufferPacket'

import { pipeStreamAsync } from 'dr-js/module/node/data/Stream'

import { getHTML } from './uploaderHTML'

const createResponderUploader = (
  fileUploadUrl = '/file-chunk-upload',
  authCheckUrl = '/auth'
) => {
  const HTML_TEMPLATE_WITH_SCRIPT = getHTML({
    FILE_UPLOAD_URL: fileUploadUrl,
    AUTH_CHECK_URL: authCheckUrl
  })

  return (store) => responderSendBufferCompress(store, {
    buffer: Buffer.from(HTML_TEMPLATE_WITH_SCRIPT),
    type: BASIC_EXTENSION_MAP.html
  })
}

const CACHE_SIZE_SUM_MAX = 64 // chunk folder count
const CACHE_EXPIRE_TIME = 10 * 60 * 1000 // in msec, 10min
const GET_DEFAULT_CACHE_MAP = () => createCacheMap({ valueSizeSumMax: CACHE_SIZE_SUM_MAX })

const createResponderFileChunkUpload = async (
  rootPath,
  mergePath,
  onError,
  expireTime = CACHE_EXPIRE_TIME,
  chunkCacheMap = GET_DEFAULT_CACHE_MAP()
) => {
  await createDirectory(rootPath)
  await createDirectory(mergePath)
  const getPath = createPathPrefixLock(rootPath)
  const { pushTask } = createAsyncTaskQueue(onError)
  chunkCacheMap.subscribe(({ type, key, payload }) => {
    if (type !== 'delete') return
    const { tempPath } = payload
    pushTask(() => modify.delete(tempPath).catch(() => {}))
  })

  return async (store) => {
    const [ headerString, payloadBuffer ] = parseBufferPacket(await receiveBufferAsync(store.request))
    const { filePath: filePathRaw, chunkByteLength, chunkHashBufferString, chunkIndex, chunkTotal } = JSON.parse(headerString)

    if (chunkByteLength !== payloadBuffer.length) {
      throw new Error(`chunk length mismatch, get: ${payloadBuffer.length}, expect ${chunkByteLength}`)
    }

    if (chunkHashBufferString) { // TODO: wait for stable browser crypto
      const chunkHashBuffer = Buffer.from(parseBufferString(chunkHashBufferString))
      const verifyChunkHashBuffer = createHash('sha256').update(payloadBuffer).digest()
      if ((Buffer.compare(chunkHashBuffer, verifyChunkHashBuffer) !== 0)) {
        throw new Error(`chunk hash mismatch, get: ${verifyChunkHashBuffer.toString('base64')}, expect ${chunkHashBuffer.toString('base64')}`)
      }
    }

    const filePath = getPath(filePathRaw)
    const cacheKey = `${store.request.socket.remoteAddress}-${filePathRaw}-${chunkTotal}`
    let chunkData = chunkCacheMap.get(cacheKey)
    if (chunkData === undefined) {
      const tempPath = resolve(mergePath, getRandomId(cacheKey).replace(/[^\w-.]/g, '_'))
      await createDirectory(tempPath)
      chunkData = { tempPath, filePath, chunkTotal, chunkList: [] }
    }

    const chunkPath = resolve(chunkData.tempPath, `chunk-${chunkIndex}-${chunkTotal}`)
    await writeFileAsync(chunkPath, payloadBuffer)
    chunkData.chunkList[ chunkIndex ] = { chunkIndex, chunkPath }
    __DEV__ && console.log(`[save chunk]`, { chunkIndex, chunkPath })

    const chunkCacheCount = Object.keys(chunkData.chunkList).length

    if (chunkCacheCount === chunkTotal) {
      __DEV__ && console.log(`[save chunk to file]`, filePath)
      await createDirectory(dirname(filePath))
      await writeFileAsync(filePath, '') // reset old file
      for (const { chunkPath } of chunkData.chunkList) await pipeStreamAsync(createWriteStream(filePath, { flags: 'a' }), createReadStream(chunkPath))
      await modify.delete(chunkData.tempPath)
      chunkCacheMap.delete(cacheKey)
      __DEV__ && console.log(`##[done]`, chunkCacheMap.size, cacheKey)
    } else if (chunkCacheCount > 1) {
      chunkCacheMap.touch(cacheKey, clock() + expireTime)
      __DEV__ && console.log(`##[touch]`, chunkCacheMap.size, cacheKey)
    } else {
      chunkCacheMap.set(cacheKey, chunkData, 1, clock() + expireTime)
      __DEV__ && console.log(`##[cache]`, chunkCacheMap.size, cacheKey)
    }

    responderEndWithStatusCode(store, { statusCode: 200 })
  }
}

export {
  createResponderUploader,
  createResponderFileChunkUpload
}
