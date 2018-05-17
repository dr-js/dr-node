import { catchSync } from 'dr-js/module/common/error'
import { generateCheckCode, verifyCheckCode } from 'dr-js/module/common/module/TimedLookup'
import { generateLookupData, loadLookupFile, saveLookupFile } from 'dr-js/module/node/module/TimedLookup'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { createResponderCheckRateLimit } from 'dr-js/module/node/server/Responder/RateLimit'

const configureAuthTimedLookup = async ({
  fileAuthConfig,
  shouldAuthGen = false,
  authGenTag,
  authGenSize,
  authGenTokenSize,
  authGenTimeGap,
  logger
}) => {
  let timedLookupData
  try {
    timedLookupData = await loadLookupFile(fileAuthConfig)
    logger.add('loaded auth lookup file')
  } catch (error) {
    if (!shouldAuthGen) {
      console.error('missing auth lookup file', error)
      throw error
    }
    logger.add('generate new auth lookup file')
    timedLookupData = await generateLookupData({
      tag: authGenTag,
      size: authGenSize,
      tokenSize: authGenTokenSize,
      timeGap: authGenTimeGap
    })
    await saveLookupFile(fileAuthConfig, timedLookupData)
  }

  const verifyAuthHeader = (headers) => verifyCheckCode(timedLookupData, headers[ 'auth-check-code' ])
  const assignAuthHeader = () => [ 'auth-check-code', generateCheckCode(timedLookupData) ]

  return {
    verifyAuthHeader,
    assignAuthHeader,
    wrapResponderAuthTimedLookup: (responder) => createResponderCheckRateLimit({
      checkFunc: (store) => {
        __DEV__ && console.log('AuthTimedLookup: check', store.request.headers[ 'auth-check-code' ], generateCheckCode(timedLookupData))
        const { error } = catchSync(verifyAuthHeader, store.request.headers)
        __DEV__ && console.log('AuthTimedLookup: pass?', !error)
        return !error
      },
      responderNext: responder,
      responderCheckFail: (store) => responderEndWithStatusCode(store, { statusCode: 403 })
    }),
    wrapResponderAssignTimedLookup: (responder) => (store) => {
      store.response.setHeader(...assignAuthHeader())
      return responder(store)
    }
  }
}

export { configureAuthTimedLookup }
