import { gzip } from 'zlib'
import { promisify } from 'util'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { getEntityTagByContentHashAsync } from 'dr-js/module/node/module/EntityTag'

const gzipAsync = promisify(gzip)

const prepareBufferData = async (buffer, type) => ({
  type,
  buffer,
  bufferGzip: await gzipAsync(buffer),
  entityTag: await getEntityTagByContentHashAsync(buffer),
  length: buffer.length
})

const prepareBufferDataHTML = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.html)
const prepareBufferDataJSON = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.json)
const prepareBufferDataPNG = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.png)

const initAuthMask = ({ urlAuthCheck, onAuthPass }) => {
  const {
    Request,
    Response,
    fetch,
    caches,
    cE,
    Dr: {
      Common: {
        Function: { lossyAsync },
        Error: { catchAsync },
        Module: { TimedLookup: { generateCheckCode, packDataArrayBuffer, parseDataArrayBuffer } }
      },
      Browser: {
        DOM: { applyDragFileListListener },
        Data: { Blob: { parseBlobAsArrayBuffer } }
      }
    }
  } = window

  const SAVE_KEY = 'timedLookupData'
  const saveTimedLookupData = async (timedLookupData) => (await caches.open(SAVE_KEY)).put(new Request(SAVE_KEY), new Response(packDataArrayBuffer(timedLookupData)))
  const loadTimedLookupData = async () => parseDataArrayBuffer(await (await caches.match(new Request(SAVE_KEY))).arrayBuffer())
  const clearTimedLookupData = async () => caches.delete(SAVE_KEY)

  const authCheck = async (timedLookupData) => {
    const checkCode = generateCheckCode(timedLookupData)
    const { ok } = await fetch(urlAuthCheck, { headers: { 'auth-check-code': checkCode } })
    if (!ok) throw new Error('[authCheck] failed for timedLookupData')
    return timedLookupData
  }
  const authCheckFileBlob = lossyAsync(async (fileBlob) => {
    const { result: timedLookupData, error } = await catchAsync(async () => {
      const lookupData = await parseDataArrayBuffer(await parseBlobAsArrayBuffer(fileBlob))
      return authCheck(lookupData)
    })
    if (error) {
      authInfoPre.innerText = `auth invalid for file: ${fileBlob.name}`
      return
    }
    authMaskDiv.remove()
    onAuthPass(timedLookupData)
    await catchAsync(saveTimedLookupData, timedLookupData)
  }).trigger
  const authInfoPre = cE('pre', { innerText: 'select auth file', style: 'flex: 1;' })
  const authKeyInput = cE('input', { type: 'file' })
  const authMainDiv = cE('div', {
    style: 'display: flex; flex: 1; flex-flow: column; padding: 12px; width: 100%; height: 100%; max-width: 480px; max-height: 480px; box-shadow: 0 0 2px 0 #666;'
  }, [ authInfoPre, authKeyInput ])
  const authMaskDiv = cE('div', {
    style: 'position: fixed; display: flex; align-items: center; justify-content: center; top: 0px; left: 0px; width: 100vw; height: 100vh; z-index: 256;'
  }, [ authMainDiv ])
  const tryAuthCheck = () => {
    const fileBlob = authKeyInput.files[ 0 ]
    authInfoPre.innerText = fileBlob ? fileBlob.name : 'select auth file'
    fileBlob && authCheckFileBlob(fileBlob)
  }
  applyDragFileListListener(authMaskDiv, (fileList) => {
    authKeyInput.files = fileList
    tryAuthCheck()
  })
  authKeyInput.addEventListener('change', tryAuthCheck)
  return catchAsync(loadTimedLookupData)
    .then(({ result: timedLookupData }) => catchAsync(authCheck, timedLookupData))
    .then(({ result: timedLookupData, error }) => {
      if (!error) return onAuthPass(timedLookupData)
      document.body.appendChild(authMaskDiv)
      return catchAsync(clearTimedLookupData)
    })
}

export {
  prepareBufferData,
  prepareBufferDataHTML,
  prepareBufferDataJSON,
  prepareBufferDataPNG,
  initAuthMask
}
