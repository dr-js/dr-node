import { dirname } from 'path'
import { writeFileSync, promises as fsAsync } from 'fs'

import { getTimestamp } from '@dr-js/core/module/common/time'
import { createCacheMap } from '@dr-js/core/module/common/data/CacheMap'

import { getRandomBufferAsync } from '@dr-js/core/module/node/data/Buffer'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'

const DEFAULT_TOKEN_KEY = 'auth-token'
const TOKEN_SIZE = 128 // in byte, big to prevent conflict, and safer for auth token
const TOKEN_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000 // in msec, 30day
const TOKEN_SIZE_SUM_MAX = 4 * 1024 // token count, old token will be dropped, with default setting should use 128*4*1024 = 512KiB memory

// TODO: not used in sample yet
const createTokenCacheExot = ({
  id = 'exot:token-cache',
  fileTokenCache,
  tokenKey = DEFAULT_TOKEN_KEY,
  tokenSize = TOKEN_SIZE, // in bytes
  tokenExpireTime = TOKEN_EXPIRE_TIME, // in msec
  tokenSizeSumMax = TOKEN_SIZE_SUM_MAX,
  tokenCacheMap = createCacheMap({ valueSizeSumMax: tokenSizeSumMax, valueSizeSingleMax: 1, eventHub: null })
}) => {
  let _isUp = false

  const up = async (onExotError) => {
    await createDirectory(dirname(fileTokenCache))
    try { // allow fail
      tokenCacheMap.loadCacheList(JSON.parse(String(await fsAsync.readFile(fileTokenCache))))
    } catch (error) { __DEV__ && console.log(error) }
    _isUp = true
  }
  const down = () => {
    _isUp = false
    try { // allow fail
      writeFileSync(fileTokenCache, JSON.stringify(tokenCacheMap.saveCacheList()))
    } catch (error) { __DEV__ && console.log(error) }
  }

  const tryGetToken = (token) => tokenCacheMap.get(token)
  const generateToken = async (tokenObject) => {
    const timestamp = getTimestamp()
    const token = `${(await getRandomBufferAsync(tokenSize)).toString('base64').replace(/\W/g, '')}-${timestamp.toString(36)}`
    tokenCacheMap.set(token, { ...tokenObject, timestamp }, 1, Date.now() + tokenExpireTime)
    __DEV__ && console.log('generateToken: token', token)
    return token
  }

  return {
    id, up, down, isUp: () => _isUp,
    tokenKey,
    tokenExpireTime,
    tryGetToken,
    generateToken
  }
}

export {
  DEFAULT_TOKEN_KEY,
  createTokenCacheExot
}
