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
import { createResponderCheckRateLimit } from 'dr-js/module/node/server/Responder/RateLimit'

const DEFAULT_TOKEN_KEY = 'auth-token'

const loadTokenCache = async (tokenCacheMap, fileTokenCache) => {
  tokenCacheMap.parseList(JSON.parse(await readFileAsync(fileTokenCache)))
  __DEV__ && console.log('loaded token cache file', fileTokenCache)
}

const saveTokenCache = (tokenCacheMap, fileTokenCache) => {
  const tokenPackString = JSON.stringify(tokenCacheMap.packList())
  writeFileSync(fileTokenCache, tokenPackString)
}

const TOKEN_SIZE = 128 // in byte, big to prevent conflict, and safer for auth token
const TOKEN_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000 // in msec, 30day
const TOKEN_SIZE_SUM_MAX = 4 * 1024 // token count, old token will be dropped

// TODO: not used in sample yet

const configureTokenCache = async ({
  fileTokenCache,
  tokenSize = TOKEN_SIZE, // in bytes
  tokenExpireTime = TOKEN_EXPIRE_TIME,
  tokenSizeSumMax = TOKEN_SIZE_SUM_MAX,
  tokenCacheMap = createCacheMap({ valueSizeSumMax: tokenSizeSumMax, valueSizeSingleMax: 1, eventHub: null }),
  tokenKey = DEFAULT_TOKEN_KEY
}) => {
  await createDirectory(dirname(fileTokenCache))
  await catchAsync(loadTokenCache, tokenCacheMap, fileTokenCache)

  addExitListenerSync((exitState) => {
    catchSync(saveTokenCache, tokenCacheMap, fileTokenCache)
    __DEV__ && console.log('saved to fileTokenCache', fileTokenCache, exitState)
  })

  const tryGetToken = (token) => tokenCacheMap.get(token)
  const generateToken = async (tokenObject) => {
    const timestamp = getTimestamp()
    const token = `${(await getRandomBufferAsync(tokenSize)).toString('base64').replace(/\W/g, '')}-${timestamp.toString(36)}`
    tokenCacheMap.set(token, { ...tokenObject, timestamp }, 1, Date.now() + tokenExpireTime)
    __DEV__ && console.log('generateToken: token', token)
    return token
  }

  return {
    tryGetToken,
    generateToken,
    createResponderCheckToken: ({
      responderNext,
      responderDeny
    }) => createResponderCheckRateLimit({
      checkFunc: (store) => {
        const tokenObject = tryGetToken(store.request.headers[ tokenKey ])
        tokenObject && store.setState({ tokenObject })
        return Boolean(tokenObject)
      },
      responderNext,
      responderDeny
    }),
    createResponderAssignToken: ({
      responder
    }) => async (store, tokenObject = {}) => {
      store.response.setHeader(tokenKey, await generateToken(tokenObject))
      return responder(store)
    },
    createResponderCheckTokenCookie: ({
      responderNext,
      responderDeny
    }) => createResponderCheckRateLimit({
      checkFunc: (store) => {
        const tokenObject = tryGetToken(decodeURIComponent(parseCookieString(store.request.headers[ 'cookie' ] || '')[ tokenKey ]))
        tokenObject && store.setState({ tokenObject })
        return Boolean(tokenObject)
      },
      responderNext,
      responderDeny
    }),
    createResponderAssignTokenCookie: ({
      responder,
      extra = 'path=/; HttpOnly'
    }) => async (store, tokenObject = {}) => {
      const baseCookie = `${tokenKey}=${encodeURIComponent(await generateToken(tokenObject))}; expires=${(new Date(Date.now() + tokenExpireTime)).toISOString()}`
      store.response.setHeader('set-cookie', extra ? `${baseCookie}; ${extra}` : baseCookie)
      return responder(store)
    }
  }
}

export { configureTokenCache }
