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

export { initModal }