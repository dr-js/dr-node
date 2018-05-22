import { dirname } from 'path'
import { writeFileSync } from 'fs'

import { catchAsync, catchSync } from 'dr-js/module/common/error'
import { getTimestamp } from 'dr-js/module/common/time'
import { createCacheMap } from 'dr-js/module/common/data/CacheMap'

import { readFileAsync } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { addExitListenerSync } from 'dr-js/module/node/system/ExitListener'
import { getRandomBufferAsync } from 'dr-js/module/node/data/function'
import { parseCookieString } from 'dr-js/module/node/server/function'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { createResponderCheckRateLimit } from 'dr-js/module/node/server/Responder/RateLimit'

const loadTokenCache = async (tokenCacheMap, fileTokenCache) => {
  tokenCacheMap.parseList(JSON.parse(await readFileAsync(fileTokenCache, { encoding: 'utf8' })))
  __DEV__ && console.log('loaded token cache file', fileTokenCache)
}

const saveTokenCache = (tokenCacheMap, fileTokenCache) => {
  const tokenPackString = JSON.stringify(tokenCacheMap.packList())
  writeFileSync(fileTokenCache, tokenPackString)
}

const TOKEN_SIZE = 128 // in byte
const TOKEN_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000 // in msec, 30day
const TOKEN_SIZE_SUM_MAX = 32 * 1024 // token count
const DEFAULT_RESPONDER_CHECK_FAIL = (store) => responderEndWithStatusCode(store, { statusCode: 403 })

const configureTokenCache = async ({
  fileTokenCache,
  tokenSize = TOKEN_SIZE, // in bytes
  expireTime = TOKEN_EXPIRE_TIME,
  tokenCacheMap = createCacheMap({ valueSizeSumMax: TOKEN_SIZE_SUM_MAX })
}) => {
  await createDirectory(dirname(fileTokenCache))
  await catchAsync(loadTokenCache, tokenCacheMap, fileTokenCache)

  addExitListenerSync((exitState) => {
    catchSync(saveTokenCache, tokenCacheMap, fileTokenCache)
    __DEV__ && console.log('saved to fileTokenCache', fileTokenCache, exitState)
  })

  const tryGetToken = (token) => {
    __DEV__ && console.log('tryGetToken: token', token)
    const tokenObject = tokenCacheMap.get(token)
    __DEV__ && console.log('tryGetToken: tokenObject', tokenObject)
    return tokenObject
  }
  const generateToken = async (tokenObject) => {
    const timestamp = getTimestamp()
    const token = `${timestamp.toString(36)}-${(await getRandomBufferAsync(tokenSize)).toString('base64')}`
    tokenCacheMap.set(token, { ...tokenObject, timestamp }, 1, Date.now() + expireTime)
    __DEV__ && console.log('assignToken: token', token)
    return token
  }

  return {
    tryGetToken,
    generateToken,
    wrapResponderCheckToken: (responderNext, responderCheckFail = DEFAULT_RESPONDER_CHECK_FAIL, headerKey = 'auth-token') => createResponderCheckRateLimit({
      checkFunc: (store) => {
        const tokenObject = tryGetToken(store.request.headers[ headerKey ])
        tokenObject && store.setState({ tokenObject })
        return Boolean(tokenObject)
      },
      responderNext,
      responderCheckFail
    }),
    wrapResponderAssignToken: (responder, headerKey = 'auth-token') => async (store, tokenObject = {}) => {
      store.response.setHeader(headerKey, await generateToken(tokenObject))
      return responder(store)
    },
    wrapResponderCheckTokenCookie: (responderNext, responderCheckFail = DEFAULT_RESPONDER_CHECK_FAIL, tokenKey = 'auth-token') => createResponderCheckRateLimit({
      checkFunc: (store) => {
        const tokenObject = tryGetToken(decodeURIComponent(parseCookieString(store.request.headers[ 'cookie' ] || '')[ tokenKey ]))
        tokenObject && store.setState({ tokenObject })
        return Boolean(tokenObject)
      },
      responderNext,
      responderCheckFail
    }),
    wrapResponderAssignTokenCookie: (responder, tokenKey = 'auth-token', extra = 'path=/; HttpOnly') => async (store, tokenObject = {}) => {
      const baseCookie = `${tokenKey}=${encodeURIComponent(await generateToken(tokenObject))}; expires=${(new Date(Date.now() + expireTime)).toISOString()}`
      store.response.setHeader('set-cookie', extra ? `${baseCookie}; ${extra}` : baseCookie)
      return responder(store)
    }
  }
}

export { configureTokenCache }
