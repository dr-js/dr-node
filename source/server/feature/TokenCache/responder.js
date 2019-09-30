import { createResponderCheckRateLimit } from '@dr-js/core/module/node/server/Responder/RateLimit'

import { getRequestParam } from 'source/module/RequestCommon'

const createResponderCheckToken = ({
  tokenCachePack: { tokenKey, tryGetToken },
  responderNext,
  responderDeny
}) => createResponderCheckRateLimit({
  checkFunc: (store) => {
    const tokenObject = tryGetToken(getRequestParam(store, tokenKey))
    tokenObject && store.setState({ tokenObject })
    return Boolean(tokenObject)
  },
  responderNext,
  responderDeny
})

const createResponderAssignTokenHeader = ({
  tokenCachePack: { tokenKey, generateToken },
  responder
}) => async (store, tokenObject = {}) => {
  store.response.setHeader(tokenKey, await generateToken(tokenObject))
  return responder(store)
}

const createResponderAssignTokenCookie = ({
  tokenCachePack: { tokenKey, tokenExpireTime, generateToken },
  responder,
  extra = 'path=/; HttpOnly'
}) => async (store, tokenObject = {}) => {
  const baseCookie = `${tokenKey}=${encodeURIComponent(await generateToken(tokenObject))}; expires=${(new Date(Date.now() + tokenExpireTime)).toISOString()}`
  store.response.setHeader('set-cookie', extra ? `${baseCookie}; ${extra}` : baseCookie)
  return responder(store)
}

export {
  createResponderCheckToken,
  createResponderAssignTokenHeader,
  createResponderAssignTokenCookie
}
