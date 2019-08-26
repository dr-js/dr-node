import {
  verifyCheckCode, verifyParsedCheckCode,
  generateCheckCode, generateLookupData,
  parseCheckCode,
  packDataArrayBuffer, parseDataArrayBuffer
} from '@dr-js/core/module/common/module/TimedLookup'
import { createCacheMap } from '@dr-js/core/module/common/data/CacheMap'

import { fetchLikeRequest } from '@dr-js/core/module/node/net'
import { toArrayBuffer } from '@dr-js/core/module/node/data/Buffer'
import { readFileAsync, writeFileAsync } from '@dr-js/core/module/node/file/function'
import { createPathPrefixLock } from '@dr-js/core/module/node/file/Path'

const DEFAULT_AUTH_KEY = 'auth-check-code' // TODO: NOTE: should match 'DEFAULT_AUTH_KEY' from `./html.js`

const AUTH_SKIP = 'auth-skip'
const AUTH_FILE = 'auth-file'
const AUTH_FILE_GROUP = 'auth-file-group'

const saveLookupFile = (pathFile, LookupData) => writeFileAsync(pathFile, Buffer.from(packDataArrayBuffer(LookupData)))
const loadLookupFile = async (pathFile) => parseDataArrayBuffer(toArrayBuffer(await readFileAsync(pathFile)))

const authFetchTimedLookup = async (url, config, timedLookupData, authKey) => {
  const response = await fetchLikeRequest(url, {
    ...config,
    headers: {
      [ authKey ]: generateCheckCode(timedLookupData),
      ...config.headers
    }
  })
  if (!response.ok) throw new Error(`[authFetch] status: ${response.status}`)
  return response
}

const configureAuthSkip = async ({
  authKey = DEFAULT_AUTH_KEY,
  logger, log = logger && logger.add
}) => {
  log && log('auth skip enabled')
  const generateAuthCheckCode = async () => 'auth-skip'

  return {
    authMode: AUTH_SKIP,
    authKey,
    authFetch: fetchLikeRequest,
    checkAuth: () => 'auth-skip', // as a token / identity info if next responder need to use
    generateAuthCheckCode,
    generateAuthHeader: generateAuthCheckCode
  }
}

const configureAuthFile = async ({
  timedLookupData, // directly pass
  authFile, // file to load from, or save auth gen result
  authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap, // generate new one to file

  authKey = DEFAULT_AUTH_KEY,
  logger, log = logger && logger.add
}) => {
  if (!timedLookupData) {
    timedLookupData = await loadLookupFile(authFile).catch(async (error) => {
      if (!authFileGenTag) {
        log && log('missing auth file', error)
        throw error
      }
      log && log('generate new auth file')
      const timedLookupData = await generateLookupData({
        tag: authFileGenTag,
        size: authFileGenSize,
        tokenSize: authFileGenTokenSize,
        timeGap: authFileGenTimeGap
      })
      await saveLookupFile(authFile, timedLookupData)
      return timedLookupData
    })
    log && log('loaded auth file')
  }

  const generateAuthCheckCode = () => generateCheckCode(timedLookupData)

  return {
    authMode: AUTH_FILE,
    authKey,
    authFetch: (url, option) => authFetchTimedLookup(url, option, timedLookupData, authKey),
    checkAuth: (checkCode) => {
      verifyCheckCode(timedLookupData, checkCode)
      return timedLookupData.tag // as a token / identity info if next responder need to use
    },
    generateAuthCheckCode,
    generateAuthHeader: generateAuthCheckCode
  }
}

const AUTH_CACHE_EXPIRE_TIME = 5 * 60 * 1000 // 5min, in msec
const AUTH_CACHE_SIZE_SUM_MAX = 8 * 1024 * 1024 // 8MiB, in byte

const configureAuthFileGroup = async ({
  authFileGroupPath, // file name should match `getFileNameForTag` and `authFileGroupKeySuffix`
  authFileGroupDefaultTag,
  authFileGroupKeySuffix,

  getFileNameForTag = authFileGroupKeySuffix ? (tag) => `${tag}${authFileGroupKeySuffix}` : (tag) => `${tag}.key`,

  authCacheExpireTime = AUTH_CACHE_EXPIRE_TIME,
  authCacheMap = createCacheMap({ valueSizeSumMax: AUTH_CACHE_SIZE_SUM_MAX, eventHub: null }),

  authKey = DEFAULT_AUTH_KEY,
  logger, log = logger && logger.add
}) => {
  const getPath = createPathPrefixLock(authFileGroupPath)
  const getTimedLookupData = (tag) => authCacheMap.get(tag) || loadLookupFile(getPath(getFileNameForTag(tag))).then(
    (timedLookupData) => {
      authCacheMap.set(tag, timedLookupData, timedLookupData.dataView.byteLength, Date.now() + authCacheExpireTime)
      log && log(`loaded auth file for tag: ${tag}`)
      return timedLookupData
    },
    (error) => {
      __DEV__ && console.log('getTimedLookupData failed', error)
      log && log(`no auth file for tag: ${tag}`)
      throw error
    }
  )
  const generateAuthCheckCode = async (tag = authFileGroupDefaultTag) => generateCheckCode(await getTimedLookupData(tag))

  return {
    authMode: AUTH_FILE_GROUP,
    authKey,
    authFetch: async (url, option, tag = authFileGroupDefaultTag) => authFetchTimedLookup(url, option, await getTimedLookupData(tag), authKey),
    checkAuth: async (checkCode) => {
      const parsedCheckCode = parseCheckCode(checkCode)
      const tag = parsedCheckCode[ 0 ]
      const timedLookupData = await getTimedLookupData(tag)
      verifyParsedCheckCode(timedLookupData, parsedCheckCode)
      return timedLookupData.tag
    },
    generateAuthCheckCode,
    generateAuthHeader: generateAuthCheckCode
  }
}

export {
  DEFAULT_AUTH_KEY,

  AUTH_SKIP,
  AUTH_FILE,
  AUTH_FILE_GROUP,

  configureAuthSkip,
  configureAuthFile,
  configureAuthFileGroup
}
