import {
  verifyCheckCode, verifyParsedCheckCode,
  generateCheckCode, generateLookupData,
  parseCheckCode,
  packDataArrayBuffer, parseDataArrayBuffer
} from 'dr-js/module/common/module/TimedLookup'
import { createCacheMap } from 'dr-js/module/common/data/CacheMap'

import { fetchLikeRequest } from 'dr-js/module/node/net'
import { toArrayBuffer } from 'dr-js/module/node/data/Buffer'
import { readFileAsync, writeFileAsync, createPathPrefixLock } from 'dr-js/module/node/file/function'
import { createResponderCheckRateLimit } from 'dr-js/module/node/server/Responder/RateLimit'

const DEFAULT_AUTH_KEY = 'auth-check-code'

const saveLookupFile = (pathFile, LookupData) => writeFileAsync(pathFile, Buffer.from(packDataArrayBuffer(LookupData)))
const loadLookupFile = async (pathFile) => parseDataArrayBuffer(toArrayBuffer(await readFileAsync(pathFile)))

const authFetchTimedLookup = async (
  url,
  config = {},
  timedLookupData,
  authKey = DEFAULT_AUTH_KEY
) => {
  const response = await fetchLikeRequest(url, {
    ...config,
    headers: {
      [ authKey ]: generateCheckCode(timedLookupData),
      ...config.headers
    }
  })
  if (!response.ok) throw new Error(`[Error][AuthFetch] status: ${response.status}`)
  return response
}

const configureAuthTimedLookup = async ({
  timedLookupData, // directly pass

  fileAuth, // load from file

  shouldAuthGen = false, // generate new one to file
  authGenTag, authGenSize, authGenTokenSize, authGenTimeGap,

  authKey = DEFAULT_AUTH_KEY,
  logger
}) => {
  if (!timedLookupData) {
    timedLookupData = await loadLookupFile(fileAuth).catch(async (error) => {
      if (!shouldAuthGen) {
        logger.add('missing auth lookup file', error)
        throw error
      }
      logger.add('generate new auth lookup file')
      const timedLookupData = await generateLookupData({
        tag: authGenTag,
        size: authGenSize,
        tokenSize: authGenTokenSize,
        timeGap: authGenTimeGap
      })
      await saveLookupFile(fileAuth, timedLookupData)
      return timedLookupData
    })
    logger.add('loaded auth lookup file')
  }

  const generateAuth = () => generateCheckCode(timedLookupData)

  const authFetch = (url, option) => authFetchTimedLookup(url, option, timedLookupData, authKey)

  return {
    createResponderCheckAuth: ({
      responderNext,
      responderDeny
    }) => createResponderCheckRateLimit({
      checkFunc: (store) => {
        const authCheckCode = store.request.headers[ authKey ] || store.getState().url.searchParams.get(authKey)
        verifyCheckCode(timedLookupData, authCheckCode)
        store.setState({ timedLookupData })
        return true // pass check
      },
      responderNext,
      responderDeny
    }),
    createResponderAssignAuth: ({ responder }) => (store) => {
      store.response.setHeader(authKey, generateAuth())
      return responder(store)
    },
    generateAuth,
    authFetch
  }
}

const AUTH_EXPIRE_TIME = 5 * 60 * 1000 // 5min, in msec
const AUTH_SIZE_SUM_MAX = 4 * 1024 * 1024 // 4MiB, in byte

const INVALID_AUTH = 'INVALID_AUTH'
const checkValidAuthData = (timedLookupData) => {
  if (timedLookupData === INVALID_AUTH) throw new Error(INVALID_AUTH)
  return timedLookupData
}

const configureAuthTimedLookupGroup = async ({
  pathAuthDirectory, // NOTE: the file name should match `getFileNameForTag`
  getFileNameForTag = (tag) => `${tag}.key`,
  verifyRequestTag, // (store, tag) => { if (isFail) throw new Error() }, mostly for per route auth
  authExpireTime = AUTH_EXPIRE_TIME,
  authSizeSumMax = AUTH_SIZE_SUM_MAX,
  authCacheMap = createCacheMap({ valueSizeSumMax: authSizeSumMax, valueSizeSingleMax: authSizeSumMax, eventHub: null }),
  authKey = DEFAULT_AUTH_KEY,
  logger
}) => {
  const getPath = createPathPrefixLock(pathAuthDirectory)

  const getTimedLookupData = (tag) => authCacheMap.get(tag) ||
    loadLookupFile(getPath(getFileNameForTag(tag)))
      .then((timedLookupData) => {
        authCacheMap.set(tag, timedLookupData, timedLookupData.dataView.byteLength, Date.now() + authExpireTime)
        logger.add(`loaded auth lookup file for tag: ${tag}`)
        return timedLookupData
      }, (error) => {
        __DEV__ && console.log('getTimedLookupData failed', error)
        authCacheMap.set(tag, INVALID_AUTH, 1, Date.now() + authExpireTime)
        logger.add(`no auth lookup file for tag: ${tag}`)
        return INVALID_AUTH
      })

  const generateAuthForTag = async (tag) => generateCheckCode(checkValidAuthData(await getTimedLookupData(tag)))

  const authFetchForTag = async (url, option, tag) => authFetchTimedLookup(url, option, checkValidAuthData(await getTimedLookupData(tag)), authKey)

  return {
    createResponderCheckAuth: ({
      responderNext,
      responderDeny
    }) => createResponderCheckRateLimit({
      checkFunc: async (store) => {
        const authCheckCode = store.request.headers[ authKey ] || store.getState().url.searchParams.get(authKey)
        const parsedCheckCode = parseCheckCode(authCheckCode)
        const tag = parsedCheckCode[ 0 ]
        verifyRequestTag && await verifyRequestTag(store, tag) // pre tag check
        const timedLookupData = checkValidAuthData(await getTimedLookupData(tag))
        verifyParsedCheckCode(timedLookupData, parsedCheckCode)
        store.setState({ timedLookupData })
        return true // pass check
      },
      responderNext,
      responderDeny
    }),
    createResponderAssignAuthForTag: ({ responder, tag }) => async (store) => {
      store.response.setHeader(authKey, await generateAuthForTag(tag))
      return responder(store)
    },
    generateAuthForTag,
    authFetchForTag
  }
}

export {
  DEFAULT_AUTH_KEY,
  saveLookupFile,
  loadLookupFile,
  authFetchTimedLookup,
  configureAuthTimedLookup,
  configureAuthTimedLookupGroup
}
