const initModal = () => {
  const {
    cE, aCL,
    Dr: { Common: { Error: { catchAsync } } }
  } = window

  const MODAL_Z_INDEX = 0xffffff // not that big but should be enough
  const FULLSCREEN_STYLE = 'position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;'

  const renderModal = () => {
    const modalMaskDiv = cE('div', { style: `${FULLSCREEN_STYLE} background: rgba(0, 0, 0, 0.4);` })
    const modalMainDiv = cE('div', { style: `position: relative; overflow-y: auto; margin: 8px; padding: 4px; width: 640px; max-width: 92vw; min-width: 240px; background: #fff; box-shadow: 0 0 2px 0 #666;` })
    const modalDiv = cE('div', { style: `${FULLSCREEN_STYLE} display: flex; flex-flow: column; align-items: center; justify-content: center; z-index: ${MODAL_Z_INDEX};` }, [ modalMaskDiv, modalMainDiv ])
    return { modalDiv, modalMaskDiv, modalMainDiv }
  }

  // NOTE: multiple modal will just overlap
  // NOTE: no timeout protection is added here
  const withModal = async (func) => {
    const { modalDiv, modalMaskDiv, modalMainDiv } = renderModal()
    document.body.appendChild(modalDiv)
    const { result, error } = await catchAsync(func, { modalDiv, modalMaskDiv, modalMainDiv })
    modalDiv.remove()
    if (error) { throw error } else return result
  }

  const COMMON_FLEX_STYLE = { display: 'flex', flexFlow: 'column' }
  const createFlexRow = (...args) => cE('div', { style: 'display: flex; flex-flow: row; align-items: center; justify-content: center;' }, args)
  const createMessage = (message) => cE('pre', { innerText: message, style: 'overflow: auto; max-height: 64vh; min-height: 2em; white-space: pre-wrap;' })

  const withAlertModal = async (message) => withModal(({ modalMainDiv }) => new Promise((resolve) => {
    Object.assign(modalMainDiv.style, COMMON_FLEX_STYLE)
    const confirmButton = cE('button', { innerText: 'Confirm', onclick: resolve })
    aCL(modalMainDiv, [
      createMessage(message),
      createFlexRow(confirmButton)
    ])
    setTimeout(() => confirmButton.focus(), 200)
  }))

  const withConfirmModal = async (message) => withModal(({ modalMainDiv }) => new Promise((resolve) => {
    Object.assign(modalMainDiv.style, COMMON_FLEX_STYLE)
    const confirmButton = cE('button', { innerText: 'Confirm', onclick: () => resolve(true) })
    aCL(modalMainDiv, [
      createMessage(message),
      createFlexRow(
        cE('button', { innerText: 'Cancel', onclick: () => resolve(false) }),
        confirmButton
      )
    ])
    setTimeout(() => confirmButton.focus(), 200)
  }))

  const withPromptModal = async (message, defaultValue = '') => withModal(({ modalMainDiv }) => new Promise((resolve) => {
    Object.assign(modalMainDiv.style, COMMON_FLEX_STYLE)
    const promptInput = cE('input', { value: defaultValue })
    aCL(modalMainDiv, [
      createMessage(message),
      promptInput,
      createFlexRow(
        cE('button', { innerText: 'Cancel', onclick: () => resolve(null) }),
        cE('button', { innerText: 'Confirm', onclick: () => resolve(promptInput.value) })
      )
    ])
    setTimeout(() => promptInput.focus(), 200)
  }))

  return { MODAL_Z_INDEX, renderModal, withModal, withAlertModal, withConfirmModal, withPromptModal }
}

const initLoadingMask = () => {
  const {
    qS, cE,
    Dr: { Common: { Error: { catchAsync }, Function: { lossyAsync } } }
  } = window

  const MASK_Z_INDEX = 0xffffff // not that big but should be enough

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
      style: `position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: #eee; opacity: 0; z-index: ${MASK_Z_INDEX}; transition: opacity 1s ease;`
    }))
    setTimeout(() => {
      if (qS('#loading-mask')) qS('#loading-mask').style.opacity = '0.5'
    }, 200)
  }

  return {
    MASK_Z_INDEX,
    initialLoadingMaskState,
    wrapLossyLoading,
    renderLoadingMask
  }
}

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

// TODO: add prompt/alert/confirm Mask

export {
  initModal,
  initLoadingMask,
  initAuthMask
}
