import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderCheckRateLimit } from '@dr-js/core/module/node/server/Responder/RateLimit'

import { getRequestParam } from 'source/module/RequestCommon'
import { configureAuth } from 'source/module/Auth'

const configureFeaturePack = async ({
  logger: { add: log }, routePrefix = '',

  authKey,
  authSkip = false,
  authFile,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,

  URL_AUTH_CHECK = `${routePrefix}/auth`
}) => {
  const authPack = await configureAuth({
    authKey, log,
    authSkip,
    authFile,
    authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix
  })

  const createResponderCheckAuth = ({
    responderNext,
    responderDeny // optional
  }) => createResponderCheckRateLimit({
    checkFunc: async (store) => {
      const authToken = await authPack.checkAuth(getRequestParam(store, authPack.authKey))
      store.setState({ authToken })
      return true // pass check
    },
    responderNext,
    responderDeny
  })

  const createResponderGrantAuthHeader = ({ responder }) => async (store, requestTag) => {
    store.response.setHeader(authPack.authKey, await authPack.generateAuthCheckCode(requestTag))
    return responder(store)
  }

  const routeList = [
    [ URL_AUTH_CHECK, 'GET', createResponderCheckAuth({ responderNext: (store) => responderEndWithStatusCode(store, { statusCode: 200 }) }) ]
  ]

  return {
    authPack,
    createResponderCheckAuth,
    createResponderGrantAuthHeader,

    URL_AUTH_CHECK,
    routeList
  }
}

export { configureFeaturePack }
