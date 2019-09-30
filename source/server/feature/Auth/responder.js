import { createResponderCheckRateLimit } from '@dr-js/core/module/node/server/Responder/RateLimit'

import { getRequestParam } from 'source/module/RequestCommon'

const createResponderCheckAuth = ({
  authPack: { authKey, checkAuth },
  responderNext,
  responderDeny // optional
}) => createResponderCheckRateLimit({
  checkFunc: async (store) => {
    const authToken = await checkAuth(getRequestParam(store, authKey))
    store.setState({ authToken })
    return true // pass check
  },
  responderNext,
  responderDeny
})

const createResponderGrantAuthHeader = ({
  authPack: { authKey, generateAuthCheckCode },
  responder
}) => async (store, requestTag) => {
  store.response.setHeader(authKey, await generateAuthCheckCode(requestTag))
  return responder(store)
}

export {
  createResponderCheckAuth,
  createResponderGrantAuthHeader
}
