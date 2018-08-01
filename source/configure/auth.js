import { catchSync } from 'dr-js/module/common/error'
import { generateCheckCode, verifyCheckCode, generateLookupData, packDataArrayBuffer, parseDataArrayBuffer } from 'dr-js/module/common/module/TimedLookup'
import { readFileAsync, writeFileAsync } from 'dr-js/module/node/file/function'
import { toArrayBuffer } from 'dr-js/module/node/data/Buffer'
import { responderEndWithStatusCode } from 'dr-js/module/node/server/Responder/Common'
import { createResponderCheckRateLimit } from 'dr-js/module/node/server/Responder/RateLimit'

const DEFAULT_RESPONDER_CHECK_FAIL = (store) => responderEndWithStatusCode(store, { statusCode: 403 })

const saveLookupFile = (pathFile, LookupData) => writeFileAsync(pathFile, Buffer.from(packDataArrayBuffer(LookupData)))
const loadLookupFile = async (pathFile) => parseDataArrayBuffer(toArrayBuffer(await readFileAsync(pathFile)))

// TODO: allow check multiple auth file

const configureAuthTimedLookup = async ({
  fileAuthConfig,
  shouldAuthGen = false,
  authGenTag,
  authGenSize,
  authGenTokenSize,
  authGenTimeGap,
  logger
}) => {
  const timedLookupData = await loadLookupFile(fileAuthConfig).catch(async (error) => {
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
    await saveLookupFile(fileAuthConfig, timedLookupData)
    return timedLookupData
  })
  logger.add('loaded auth lookup file')

  const generateAuthCheckCode = () => generateCheckCode(timedLookupData)

  return {
    generateAuthCheckCode,
    wrapResponderCheckAuthCheckCode: (responderNext, responderCheckFail = DEFAULT_RESPONDER_CHECK_FAIL, headerKey = 'auth-check-code') => createResponderCheckRateLimit({
      checkFunc: (store) => {
        const authCheckCode = store.request.headers[ headerKey ]
        const { error } = catchSync(verifyCheckCode, timedLookupData, authCheckCode)
        error && logger.add(`[ERROR] verifyCheckCode: ${error}`)
        !error && store.setState({ timedLookupData })
        return !error
      },
      responderNext,
      responderCheckFail
    }),
    wrapResponderAssignAuthCheckCode: (responder, headerKey = 'auth-check-code') => (store) => {
      store.response.setHeader(headerKey, generateAuthCheckCode())
      return responder(store)
    }
  }
}

export {
  saveLookupFile,
  loadLookupFile,
  configureAuthTimedLookup
}
