const initLoadingMask = () => {
  const {
    qS, cE,
    Dr: { Common: { Error: { catchAsync }, Function: { lossyAsync } } }
  } = window

  const initialLoadingMaskState = { isLoading: false }

  const wrapLossyLoading = (loadingMaskStore, func) => lossyAsync(async (...args) => {
    if (loadingMaskStore.getState().isLoading) return
    loadingMaskStore.setState({ isLoading: true })
    await catchAsync(func, ...args)
    loadingMaskStore.setState({ isLoading: false })
  }).trigger

  const renderLoadingMask = (loadingMaskStore) => {
    const { isLoading } = loadingMaskStore.getState()
    const loadingMaskDiv = qS('#loading-mask')
    if (!isLoading) return loadingMaskDiv && loadingMaskDiv.remove()
    if (loadingMaskDiv) return
    document.body.appendChild(cE('div', {
      id: 'loading-mask',
      style: 'position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: #eee; opacity: 0; z-index: 256; transition: opacity 1s ease;'
    }))
    setTimeout(() => {
      if (qS('#loading-mask')) qS('#loading-mask').style.opacity = '0.5'
    }, 200)
  }

  return {
    initialLoadingMaskState,
    wrapLossyLoading,
    renderLoadingMask
  }
}

const initAuthMask = ({ urlAuthCheck, onAuthPass }) => {
  const {
    Request, Response, fetch, caches,
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

  const getAuthFetch = (timedLookupData) => async (url, option = {}) => {
    const response = await fetch(url, { ...option, headers: { 'auth-check-code': generateCheckCode(timedLookupData), ...option.headers } })
    if (!response.ok) throw new Error(`[authFetch] error status: ${response.status}, url: ${url}`)
    return response
  }

  const authCheck = async (timedLookupData) => {
    const checkCode = generateCheckCode(timedLookupData)
    const { ok } = await fetch(urlAuthCheck, { headers: { 'auth-check-code': checkCode } })
    if (!ok) throw new Error('[authCheck] failed for timedLookupData')
    return timedLookupData
  }

  const authInfoPre = cE('pre', { innerText: 'select auth file', style: 'flex: 1;' })
  const authKeyInput = cE('input', { type: 'file' })
  const authMainDiv = cE('div', {
    style: 'display: flex; flex: 1; flex-flow: column; padding: 12px; width: 100%; height: 100%; max-width: 480px; max-height: 480px; box-shadow: 0 0 2px 0 #666;'
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
      onAuthPass(timedLookupData)
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
    if (!error) return onAuthPass(getAuthFetch(timedLookupData))
    document.body.appendChild(authMaskDiv)
    return catchAsync(clearTimedLookupData)
  })
}

export {
  initLoadingMask,
  initAuthMask
}
