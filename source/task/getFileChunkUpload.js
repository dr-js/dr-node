import { resolve, dirname } from 'path'
import { createReadStream, createWriteStream } from 'fs'

import { getRandomId } from 'dr-js/module/common/math/random'
import { createCacheMap } from 'dr-js/module/common/data/CacheMap'
import { createAsyncTaskQueue } from 'dr-js/module/common/module/AsyncTaskQueue'

import { createPathPrefixLock, writeFileAsync } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { modify } from 'dr-js/module/node/file/Modify'
import { pipeStreamAsync } from 'dr-js/module/node/data/Stream'

const CACHE_SIZE_SUM_MAX = 64 // chunk folder count
const CACHE_EXPIRE_TIME = 10 * 60 * 1000 // in msec, 10min
const GET_DEFAULT_CACHE_MAP = () => createCacheMap({ valueSizeSumMax: CACHE_SIZE_SUM_MAX })

const createFileChunkUpload = async ({
  rootPath,
  mergePath,
  onError,
  expireTime = CACHE_EXPIRE_TIME,
  chunkCacheMap = GET_DEFAULT_CACHE_MAP()
}) => {
  await createDirectory(rootPath)
  await createDirectory(mergePath)
  const getPath = createPathPrefixLock(rootPath)
  const { pushTask } = createAsyncTaskQueue(onError)

  chunkCacheMap.subscribe(({ type, key, payload }) => {
    if (type !== 'delete') return
    const { tempPath } = payload
    pushTask(() => modify.delete(tempPath).catch(() => {}))
  })

  return async (chunkBuffer, chunkIndex, chunkTotal, relativePath, cacheKeyPrefix) => {
    const cacheKey = `${cacheKeyPrefix}-${relativePath}-${chunkTotal}`
    let chunkData = chunkCacheMap.get(cacheKey)
    if (chunkData === undefined) {
      const filePath = getPath(relativePath)
      const tempPath = resolve(mergePath, getRandomId(cacheKey).replace(/[^\w-.]/g, '_'))
      await createDirectory(tempPath)
      chunkData = { tempPath, filePath, chunkTotal, chunkList: [] }
    }

    const chunkPath = resolve(chunkData.tempPath, `chunk-${chunkIndex}-${chunkTotal}`)
    await writeFileAsync(chunkPath, chunkBuffer)
    chunkData.chunkList[ chunkIndex ] = { chunkIndex, chunkPath }
    __DEV__ && console.log(`[save chunk]`, { chunkIndex, chunkPath })

    const chunkCacheCount = Object.keys(chunkData.chunkList).length
    if (chunkCacheCount === chunkTotal) {
      __DEV__ && console.log(`[save chunk to file]`, chunkData.filePath)
      await createDirectory(dirname(chunkData.filePath))
      await writeFileAsync(chunkData.filePath, '') // reset old file
      for (const { chunkPath } of chunkData.chunkList) await pipeStreamAsync(createWriteStream(chunkData.filePath, { flags: 'a' }), createReadStream(chunkPath))
      await modify.delete(chunkData.tempPath)
      chunkCacheMap.delete(cacheKey)
      __DEV__ && console.log(`##[done]`, chunkCacheMap.size, cacheKey)
    } else if (chunkCacheCount > 1) {
      chunkCacheMap.touch(cacheKey, Date.now() + expireTime)
      __DEV__ && console.log(`##[touch]`, chunkCacheMap.size, cacheKey)
    } else {
      chunkCacheMap.set(cacheKey, chunkData, 1, Date.now() + expireTime)
      __DEV__ && console.log(`##[cache]`, chunkCacheMap.size, cacheKey)
    }
  }
}

export { createFileChunkUpload }
