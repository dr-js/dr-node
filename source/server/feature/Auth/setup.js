import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'
import { createResponderCheckRateLimit } from '@dr-js/core/module/node/server/Responder/RateLimit'

import { getRequestParam } from 'source/module/RequestCommon'
import { configureAuth } from 'source/module/Auth'

const setup = async ({
  name = 'feature:auth',
  logger: { add: log }, routePrefix = '',

  // TODO: support `featureTokenCache` here, so `createResponderGrantAuthTokenHeader` can be supported

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

  const createResponderCheckAuth = ({ // wrap a responder to add auth check before passing the request down
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

  const routeList = [
    [ URL_AUTH_CHECK, 'HEAD', createResponderCheckAuth({ responderNext: (store) => responderEndWithStatusCode(store, { statusCode: 200 }) }) ]
  ]

  return {
    authPack,
    createResponderCheckAuth,

    URL_AUTH_CHECK,
    routeList,
    name
  }
}

export { setup }
