import { resolve, dirname } from 'path'
import { createReadStream, createWriteStream } from 'fs'
import { createHash } from 'crypto'

import { getRandomId } from '@dr-js/core/module/common/math/random'
import { createCacheMap } from '@dr-js/core/module/common/data/CacheMap'
import { toString as arrayBufferToString, fromString } from '@dr-js/core/module/common/data/ArrayBuffer'
import { packChainArrayBufferPacket, parseChainArrayBufferPacket } from '@dr-js/core/module/common/data/ArrayBufferPacket'
import { createAsyncTaskQueue } from '@dr-js/core/module/common/module/AsyncTaskQueue'

import { toArrayBuffer } from '@dr-js/core/module/node/data/Buffer'
import { pipeStreamAsync } from '@dr-js/core/module/node/data/Stream'
import { writeFileAsync } from '@dr-js/core/module/node/file/function'
import { createPathPrefixLock } from '@dr-js/core/module/node/file/Path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete, modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'

// TODO: add `fileSocketUpload`

const CACHE_SIZE_SUM_MAX = 64 // chunk folder count
const CACHE_EXPIRE_TIME = 10 * 60 * 1000 // in msec, 10min

const createFileChunkUpload = async ({
  rootPath,
  mergePath, // TODO: unfinished file chunk may be left here
  onError,
  expireTime = CACHE_EXPIRE_TIME,
  chunkCacheMap = createCacheMap({ valueSizeSumMax: CACHE_SIZE_SUM_MAX })
}) => {
  await createDirectory(rootPath)
  await createDirectory(mergePath)
  const getPath = createPathPrefixLock(rootPath)
  const { pushTask } = createAsyncTaskQueue(onError) // TODO: queue path delete, should also queue upload?

  chunkCacheMap.subscribe(({ type, key, payload }) => {
    if (type !== 'delete') return
    const { tempPath } = payload
    pushTask(() => modifyDeleteForce(tempPath))
  })

  return async ({
    bufferPacket,
    cacheKeyPrefix = '', // should stay the same for the chunk upload process
    onUploadStart, // ({ tempPath, filePath, key, chunkTotal, chunkList }) => {} // before start to receive the initial chunk, good place to do extra check/auth
    onUploadChunk, // (chunkData, chunkIndex) => {} // after chunk saved
    onUploadEnd // (chunkData) => {} // after merged file created
  }) => {
    const [ headerArrayBuffer, chunkHashArrayBuffer, chunkArrayBuffer ] = parseChainArrayBufferPacket(toArrayBuffer(bufferPacket))
    const { key, chunkByteLength, chunkIndex, chunkTotal } = JSON.parse(arrayBufferToString(headerArrayBuffer))
    const chunkBuffer = Buffer.from(chunkArrayBuffer)

    if (chunkByteLength !== chunkBuffer.length) throw new Error(`chunk length mismatch, get: ${chunkBuffer.length}, expect ${chunkByteLength}`)

    if (chunkHashArrayBuffer.byteLength) { // TODO: now optional, wait for non-isSecureContext browser crypto
      const chunkHashBuffer = Buffer.from(chunkHashArrayBuffer)
      const verifyChunkHashBuffer = createHash('sha256').update(chunkBuffer).digest()
      if ((Buffer.compare(chunkHashBuffer, verifyChunkHashBuffer) !== 0)) {
        throw new Error(`chunk hash mismatch, get: ${verifyChunkHashBuffer.toString('base64')}, expect ${chunkHashBuffer.toString('base64')}`)
      }
    }

    const cacheKey = `${cacheKeyPrefix}-${key}-${chunkTotal}`
    let chunkData = chunkCacheMap.get(cacheKey)
    if (chunkData === undefined) {
      const filePath = getPath(key)
      const tempPath = resolve(mergePath, getRandomId(cacheKey).replace(/[^\w-.]/g, '_'))
      chunkData = { tempPath, filePath, key, chunkTotal, chunkList: [] }
      onUploadStart && await onUploadStart(chunkData)
      await createDirectory(tempPath)
    }

    const chunkPath = resolve(chunkData.tempPath, `chunk-${chunkIndex}-${chunkTotal}`)
    await writeFileAsync(chunkPath, chunkBuffer)
    chunkData.chunkList[ chunkIndex ] = { chunkIndex, chunkByteLength, chunkPath }
    __DEV__ && console.log(`[save chunk]`, chunkData.chunkList[ chunkIndex ])
    onUploadChunk && await onUploadChunk(chunkData, chunkIndex)

    const chunkCacheCount = Object.keys(chunkData.chunkList).length
    if (chunkCacheCount === chunkTotal) {
      __DEV__ && console.log(`[merge chunk to file]`, chunkData.filePath)
      await createDirectory(dirname(chunkData.filePath))
      await writeFileAsync(chunkData.filePath, '') // reset old file
      for (const { chunkPath } of chunkData.chunkList) {
        await pipeStreamAsync(
          createWriteStream(chunkData.filePath, { flags: 'a' }),
          createReadStream(chunkPath)
        )
      }
      await modifyDelete(chunkData.tempPath)
      chunkCacheMap.delete(cacheKey)
      __DEV__ && console.log(`##[done]`, chunkCacheMap.size, cacheKey)
      onUploadEnd && await onUploadEnd(chunkData)
    } else if (chunkCacheCount > 1) {
      chunkCacheMap.touch(cacheKey, Date.now() + expireTime)
      __DEV__ && console.log(`##[touch]`, chunkCacheMap.size, cacheKey)
    } else {
      chunkCacheMap.set(cacheKey, chunkData, 1, Date.now() + expireTime)
      __DEV__ && console.log(`##[cache]`, chunkCacheMap.size, cacheKey)
    }
  }
}

const prepareFileChunkBufferList = (fileBuffer, chunkSizeMax = 1024 * 1024) => {
  const fileSize = fileBuffer.length
  const chunkTotal = Math.ceil(fileSize / chunkSizeMax) || 1
  const chunkBufferList = []
  let chunkIndex = 0
  while (chunkIndex < chunkTotal) {
    const chunkSize = (chunkIndex < chunkTotal - 1)
      ? chunkSizeMax
      : fileSize % chunkSizeMax
    const chunkBuffer = fileBuffer.slice(chunkIndex * chunkSizeMax, chunkIndex * chunkSizeMax + chunkSize)
    chunkBufferList.push({ chunkBuffer, chunkIndex, chunkTotal })
    chunkIndex += 1
  }
  return chunkBufferList
}

const CHUNK_SIZE_MAX = 1024 * 1024 // 1MB max
const uploadFileByChunk = async ({
  fileBuffer,
  key,
  chunkSizeMax = CHUNK_SIZE_MAX,
  onProgress, // (uploadedSize, totalSize) => {}
  uploadFileChunkBuffer // (chainBufferPacket, { key, chunkByteLength, chunkIndex, chunkTotal }) => {}
}) => {
  const fileSize = fileBuffer.length
  const chunkBufferList = prepareFileChunkBufferList(fileBuffer, chunkSizeMax)
  for (const { chunkBuffer, chunkIndex, chunkTotal } of chunkBufferList) {
    onProgress && onProgress(chunkIndex * chunkSizeMax, fileSize)
    const chunkArrayBuffer = toArrayBuffer(chunkBuffer)
    const chunkByteLength = chunkArrayBuffer.byteLength
    const verifyChunkHashBuffer = createHash('sha256').update(chunkBuffer).digest()
    const chunkInfo = { key, chunkByteLength, chunkIndex, chunkTotal }
    await uploadFileChunkBuffer(Buffer.from(packChainArrayBufferPacket([
      fromString(JSON.stringify(chunkInfo)),
      toArrayBuffer(verifyChunkHashBuffer),
      chunkArrayBuffer
    ])), chunkInfo)
  }
  onProgress && onProgress(fileSize, fileSize)
}

export {
  createFileChunkUpload,
  uploadFileByChunk
}
