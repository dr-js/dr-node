const initAuthMask = ({ urlAuthCheck, onAuthPass, authKey = 'auth-check-code', isSkipAuth = false }) => {
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

  const authRevoke = () => catchAsync(clearTimedLookupData)

  const getAuthFetch = (timedLookupData) => async (url, option = {}) => {
    const response = await fetch(url, isSkipAuth ? option : { ...option, headers: { [ authKey ]: generateCheckCode(timedLookupData), ...option.headers } })
    if (!response.ok) throw new Error(`[authFetch] error status: ${response.status}, url: ${url}`)
    return response
  }

  const getAuthDownload = (timedLookupData) => (url, filename) => {
    const urlObject = new URL(url, location.origin)
    !isSkipAuth && urlObject.searchParams.set(authKey, generateCheckCode(timedLookupData))
    createDownload(filename, urlObject.toString())
  }

  const authPass = (timedLookupData) => onAuthPass({
    isSkipAuth,
    authRevoke, // should reload after
    authFetch: getAuthFetch(timedLookupData),
    authDownload: getAuthDownload(timedLookupData)
  })

  if (isSkipAuth) return authPass(null) // skipped auth, but keep auth method usable

  const CACHE_BUCKET = '@@cache'
  const CACHE_KEY = 'timedLookupData'
  const saveTimedLookupData = async (timedLookupData) => saveArrayBufferCache(CACHE_BUCKET, CACHE_KEY, packDataArrayBuffer(timedLookupData))
  const loadTimedLookupData = async () => parseDataArrayBuffer(await loadArrayBufferCache(CACHE_BUCKET, CACHE_KEY))
  const clearTimedLookupData = async () => deleteArrayBufferCache(CACHE_BUCKET, CACHE_KEY)

  const authCheck = async (timedLookupData) => {
    const checkCode = generateCheckCode(timedLookupData)
    const { ok } = await fetch(urlAuthCheck, { headers: { [ authKey ]: checkCode } })
    if (!ok) throw new Error('[authCheck] failed for timedLookupData')
    return timedLookupData
  }

  const PRE_TEXT = 'drop the auth file here, or select file below'
  const authInfoDiv = cE('div', { innerText: PRE_TEXT, style: 'flex: 1;' })
  const authKeyInput = cE('input', { type: 'file' })
  const authSaveInput = cE('input', { type: 'checkbox' })
  const authSaveLabel = cE('label', {}, [ authSaveInput, document.createTextNode('save auth in CacheStorage') ])
  const authMainDiv = cE('div', {
    style: 'display: flex; flex-flow: column; margin: 8px; padding: 8px; width: 480px; height: 480px; max-width: 92vw; max-height: 64vh; line-height: 2em; box-shadow: 0 0 2px 0 #666;'
  }, [ authInfoDiv, authKeyInput, authSaveLabel ])
  const authMaskDiv = cE('div', {
    style: 'position: fixed; display: flex; align-items: center; justify-content: center; top: 0px; left: 0px; width: 100vw; height: 100vh; z-index: 256;'
  }, [ authMainDiv ])

  const tryAuthCheck = lossyAsync(async () => {
    const fileBlob = authKeyInput.files[ 0 ]
    authInfoDiv.innerText = fileBlob ? fileBlob.name : PRE_TEXT
    if (!fileBlob) return
    const { result: timedLookupData, error } = await catchAsync(async () => {
      const timedLookupData = await parseDataArrayBuffer(await parseBlobAsArrayBuffer(fileBlob))
      await getAuthFetch(timedLookupData)(urlAuthCheck)
      return timedLookupData
    })
    if (error) authInfoDiv.innerText = `auth invalid for file: ${fileBlob.name}`
    else {
      authMaskDiv.remove()
      await authPass(timedLookupData)
      authSaveInput.checked && await catchAsync(saveTimedLookupData, timedLookupData)
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
      return authRevoke()
    }
    return authPass(timedLookupData)
  })
}

export { initAuthMask }
