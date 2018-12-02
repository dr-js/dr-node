import { catchSync, catchAsync } from 'dr-js/module/common/error'
import {
  verifyCheckCode, verifyParsedCheckCode,
  generateCheckCode, generateLookupData,
  parseCheckCode,
  packDataArrayBuffer, parseDataArrayBuffer
} from 'dr-js/module/common/module/TimedLookup'
import { createCacheMap } from 'dr-js/module/common/data/CacheMap'

import { readFileAsync, writeFileAsync, createPathPrefixLock } from 'dr-js/module/node/file/function'
import { toArrayBuffer } from 'dr-js/module/node/data/Buffer'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { createResponderCheckRateLimit } from 'dr-js/module/node/server/Responder/RateLimit'

const DEFAULT_AUTH_TAG = 'auth-check-code'
const DEFAULT_RESPONDER_CHECK_FAIL = (store) => responderEndWithStatusCode(store, { statusCode: 403 })

const saveLookupFile = (pathFile, LookupData) => writeFileAsync(pathFile, Buffer.from(packDataArrayBuffer(LookupData)))
const loadLookupFile = async (pathFile) => parseDataArrayBuffer(toArrayBuffer(await readFileAsync(pathFile)))

const configureAuthTimedLookup = async ({
  fileAuth,
  shouldAuthGen = false,
  authGenTag,
  authGenSize,
  authGenTokenSize,
  authGenTimeGap,
  logger
}) => {
  const timedLookupData = await loadLookupFile(fileAuth).catch(async (error) => {
    if (!shouldAuthGen) {
      console.error('missing auth lookup file', error)
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

  const generateAuthCheckCode = () => generateCheckCode(timedLookupData)

  return {
    wrapResponderCheckAuthCheckCode: (
      responderNext,
      responderCheckFail = DEFAULT_RESPONDER_CHECK_FAIL,
      authTag = DEFAULT_AUTH_TAG
    ) => createResponderCheckRateLimit({
      checkFunc: (store) => {
        const { url: { searchParams } } = store.getState()
        const authCheckCode = searchParams.get(authTag) || store.request.headers[ authTag ]
        const { error } = catchSync(verifyCheckCode, timedLookupData, authCheckCode)
        error && logger.add(`[ERROR] verifyCheckCode: ${error}`)
        !error && store.setState({ timedLookupData })
        return !error
      },
      responderNext,
      responderCheckFail
    }),
    wrapResponderAssignAuthCheckCode: (
      responder,
      authTag = DEFAULT_AUTH_TAG
    ) => (store) => {
      store.response.setHeader(authTag, generateAuthCheckCode())
      return responder(store)
    },
    generateAuthCheckCode
  }
}

const AUTH_EXPIRE_TIME = 5 * 60 * 1000 // 5min, in msec
const AUTH_SIZE_SUM_MAX = 4 * 1024 * 1024 // 4MiB, in byte

const INVALID_AUTH = 'INVALID_AUTH'

const configureAuthTimedLookupGroup = async ({
  pathAuthDirectory, // NOTE: the file name should match `getFileNameForTag`
  getFileNameForTag = (tag) => `${tag}.key`,
  authExpireTime = AUTH_EXPIRE_TIME,
  authSizeSumMax = AUTH_SIZE_SUM_MAX,
  authCacheMap = createCacheMap({ valueSizeSumMax: authSizeSumMax, valueSizeSingleMax: authSizeSumMax, eventHub: null }),
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
        __DEV__ && console.log('getTimedLookupData', error)
        authCacheMap.set(tag, INVALID_AUTH, 1, Date.now() + authExpireTime)
        logger.add(`no auth lookup file for tag: ${tag}`)
        return INVALID_AUTH
      })

  const checkInvalid = (timedLookupData) => {
    if (timedLookupData === INVALID_AUTH) throw new Error(INVALID_AUTH)
    return timedLookupData
  }

  const verifyAuthCheckCode = async (authCheckCode) => {
    const parsedCheckCode = parseCheckCode(authCheckCode)
    const tag = parsedCheckCode[ 0 ]
    const timedLookupData = checkInvalid(await getTimedLookupData(tag))
    verifyParsedCheckCode(timedLookupData, parsedCheckCode)
    return timedLookupData
  }

  const generateAuthCheckCodeForTag = async (tag) => generateCheckCode(checkInvalid(await getTimedLookupData(tag)))

  return {
    wrapResponderCheckAuthCheckCode: (
      responderNext,
      responderCheckFail = DEFAULT_RESPONDER_CHECK_FAIL,
      authTag = DEFAULT_AUTH_TAG
    ) => createResponderCheckRateLimit({
      checkFunc: async (store) => {
        const { url: { searchParams } } = store.getState()
        const authCheckCode = searchParams.get(authTag) || store.request.headers[ authTag ]
        const { result: timedLookupData, error } = await catchAsync(verifyAuthCheckCode, authCheckCode)
        error && logger.add(`[ERROR] verifyCheckCode: ${error}`)
        !error && store.setState({ timedLookupData })
        return !error
      },
      responderNext,
      responderCheckFail
    }),
    wrapResponderAssignAuthCheckCodeForTag: (
      responder,
      tag,
      authTag = DEFAULT_AUTH_TAG
    ) => async (store) => {
      store.response.setHeader(authTag, await generateAuthCheckCodeForTag(tag))
      return responder(store)
    },
    generateAuthCheckCodeForTag
  }
}

export {
  saveLookupFile,
  loadLookupFile,
  configureAuthTimedLookup,
  configureAuthTimedLookupGroup
}
