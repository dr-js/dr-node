const initAuthMask = ({ urlAuthCheck, onAuthPass, authKey = 'auth-check-code' }) => {
  const {
    fetch, location, URL,
    cE,
    Dr: {
      Common: {
        Function: { lossyAsync },
        Error: { catchAsync },
        Module: { TimedLookup: { generateCheckCode, packDataArrayBuffer, parseDataArrayBuffer } }
      },
      Browser: {
        DOM: { applyDragFileListListener },
        Data: { Blob: { parseBlobAsArrayBuffer } },
        Resource: { saveArrayBufferCache, loadArrayBufferCache, deleteArrayBufferCache, createDownload }
      }
    }
  } = window

  const CACHE_BUCKET = '@@cache'
  const CACHE_KEY = 'timedLookupData'
  const saveTimedLookupData = async (timedLookupData) => saveArrayBufferCache(CACHE_BUCKET, CACHE_KEY, packDataArrayBuffer(timedLookupData))
  const loadTimedLookupData = async () => parseDataArrayBuffer(await loadArrayBufferCache(CACHE_BUCKET, CACHE_KEY))
  const clearTimedLookupData = async () => deleteArrayBufferCache(CACHE_BUCKET, CACHE_KEY)

  const getAuthFetch = (timedLookupData) => async (url, option = {}) => {
    const response = await fetch(url, { ...option, headers: { [ authKey ]: generateCheckCode(timedLookupData), ...option.headers } })
    if (!response.ok) throw new Error(`[authFetch] error status: ${response.status}, url: ${url}`)
    return response
  }

  const getAuthDownload = (timedLookupData) => (url, filename) => {
    const urlObject = new URL(url, location.origin)
    urlObject.searchParams.set(authKey, generateCheckCode(timedLookupData))
    createDownload(filename, urlObject.toString())
  }

  const authCheck = async (timedLookupData) => {
    const checkCode = generateCheckCode(timedLookupData)
    const { ok } = await fetch(urlAuthCheck, { headers: { [ authKey ]: checkCode } })
    if (!ok) throw new Error('[authCheck] failed for timedLookupData')
    return timedLookupData
  }
  const authPass = (timedLookupData) => onAuthPass({
    authFetch: getAuthFetch(timedLookupData),
    authDownload: getAuthDownload(timedLookupData)
  })

  const authInfoPre = cE('pre', { innerText: 'select auth file', style: 'flex: 1;' })
  const authKeyInput = cE('input', { type: 'file' })
  const authMainDiv = cE('div', {
    style: 'display: flex; flex-flow: column; margin: 8px; padding: 8px; width: 480px; height: 480px; max-width: 92vw; max-height: 64vh; box-shadow: 0 0 2px 0 #666;'
  }, [ authInfoPre, authKeyInput ])
  const authMaskDiv = cE('div', {
    style: 'position: fixed; display: flex; align-items: center; justify-content: center; top: 0px; left: 0px; width: 100vw; height: 100vh; z-index: 256;'
  }, [ authMainDiv ])

  const tryAuthCheck = lossyAsync(async () => {
    const fileBlob = authKeyInput.files[ 0 ]
    authInfoPre.innerText = fileBlob ? fileBlob.name : 'select auth file'
    if (!fileBlob) return
    const { result: timedLookupData, error } = await catchAsync(async () => {
      const timedLookupData = await parseDataArrayBuffer(await parseBlobAsArrayBuffer(fileBlob))
      await getAuthFetch(timedLookupData)(urlAuthCheck)
      return timedLookupData
    })
    if (error) authInfoPre.innerText = `auth invalid for file: ${fileBlob.name}`
    else {
      authMaskDiv.remove()
      await authPass(timedLookupData)
      await catchAsync(saveTimedLookupData, timedLookupData)
    }
  }).trigger

  authKeyInput.addEventListener('change', tryAuthCheck)
  applyDragFileListListener(authMaskDiv, (fileList) => {
    authKeyInput.files = fileList
    tryAuthCheck()
  })

  return catchAsync(async () => {
    const { result: timedLookupData, error } = await catchAsync(async () => authCheck(await loadTimedLookupData()))
    if (error) {
      document.body.appendChild(authMaskDiv)
      return catchAsync(clearTimedLookupData)
    }
    return authPass(timedLookupData)
  })
}

export { initAuthMask }
