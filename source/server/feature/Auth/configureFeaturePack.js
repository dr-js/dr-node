import { responderEndWithStatusCode } from '@dr-js/core/module/node/server/Responder/Common'

import { configureAuthSkip, configureAuthFile, configureAuthFileGroup } from './configure'
import { createResponderCheckAuth, createResponderGrantAuthHeader } from './responder'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',
  authSkip = false,
  authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,
  URL_AUTH_CHECK = `${routePrefix}/auth`
}) => {
  const authPack = authSkip ? await configureAuthSkip({ logger })
    : authFile ? await configureAuthFile({ authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap, logger })
      : await configureAuthFileGroup({ authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix, logger })

  const routeList = [
    [ URL_AUTH_CHECK, 'GET', createResponderCheckAuth({ authPack, responderNext: (store) => responderEndWithStatusCode(store, { statusCode: 200 }) }) ]
  ]

  return {
    authPack,
    createResponderCheckAuth: ({ responderNext, responderDeny }) => createResponderCheckAuth({ authPack, responderNext, responderDeny }),
    createResponderGrantAuthHeader: ({ responderNext, responderDeny }) => createResponderGrantAuthHeader({ authPack, responderNext, responderDeny }),

    URL_AUTH_CHECK,
    routeList
  }
}

export { configureFeaturePack }
