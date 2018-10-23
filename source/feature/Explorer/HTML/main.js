import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT } from 'dr-js/module/node/server/commonHTML'

import { DR_BROWSER_SCRIPT } from 'source/HTML/function'
import { initModal } from 'source/HTML/Modal'
import { initAuthMask } from 'source/HTML/AuthMask'
import { initLoadingMask } from 'source/HTML/LoadingMask'

import { pathContentStyle, initPathContent } from './pathContent'
import { initFileUpload, initUploader } from './uploader'

const getHTML = ({
  IS_SKIP_AUTH = false,
  IS_READ_ONLY = false,
  URL_AUTH_CHECK,
  URL_PATH_ACTION,
  URL_FILE_SERVE,
  URL_FILE_UPLOAD,
  URL_STORAGE_STATUS
}) => COMMON_LAYOUT([
  `<title>Explorer</title>`,
  COMMON_STYLE(),
  mainStyle,
  pathContentStyle
], [
  `<div id="control-panel" style="overflow-x: auto; white-space: nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="main-panel" style="position: relative; overflow: auto; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT({
    IS_SKIP_AUTH,
    IS_READ_ONLY,
    URL_AUTH_CHECK,
    URL_PATH_ACTION,
    URL_FILE_SERVE,
    URL_FILE_UPLOAD,
    URL_STORAGE_STATUS,
    initModal,
    initLoadingMask,
    initAuthMask,
    initPathContent,
    initFileUpload,
    initUploader,
    onload: onLoadFunc
  }),
  DR_BROWSER_SCRIPT()
])

const mainStyle = `<style>
* { font-family: monospace; }
</style>`

const onLoadFunc = () => {
  const {
    URL, location,
    qS, cE, aCL,

    IS_SKIP_AUTH, IS_READ_ONLY,
    URL_AUTH_CHECK, URL_PATH_ACTION, URL_FILE_SERVE, URL_FILE_UPLOAD, URL_STORAGE_STATUS,
    initModal, initLoadingMask, initAuthMask, initPathContent, initFileUpload, initUploader,

    Dr: {
      Common: { Immutable: { StateStore: { createStateStore } } },
      Browser: {
        DOM: { applyDragFileListListener },
        Module: { HistoryStateStore: { createHistoryStateStore } }
      }
    }
  } = window

  const initExplorer = async ({ authRevoke, authFetch, authDownload }) => {
    const { uploadFileByChunk } = IS_READ_ONLY ? {} : initFileUpload(URL_FILE_UPLOAD, authFetch)
    const { withAlertModal, withConfirmModal, withPromptModal } = initModal()
    const { initialLoadingMaskState, wrapLossyLoading, renderLoadingMask } = initLoadingMask()
    const { initialPathContentState, cyclePathSortType, getLoadPathAsync, getPathActionAsync, getDownloadFileAsync, renderPathContent } = initPathContent(URL_PATH_ACTION, URL_FILE_SERVE, authFetch, withConfirmModal, withPromptModal, IS_READ_ONLY)
    const { initialUploaderState, getUploadFileAsync, getAppendUploadFileList, renderUploader } = IS_READ_ONLY ? {} : initUploader(uploadFileByChunk)

    const loadingMaskStore = createStateStore(initialLoadingMaskState)
    const pathContentStore = createStateStore(initialPathContentState)
    const uploaderStore = !IS_READ_ONLY && createStateStore(initialUploaderState)

    const loadPathAsync = getLoadPathAsync(pathContentStore)

    const loadPath = wrapLossyLoading(loadingMaskStore, loadPathAsync)
    const pathAction = wrapLossyLoading(loadingMaskStore, getPathActionAsync(pathContentStore))
    const downloadFile = wrapLossyLoading(loadingMaskStore, getDownloadFileAsync(pathContentStore, authDownload))
    const uploadFile = !IS_READ_ONLY && wrapLossyLoading(loadingMaskStore, getUploadFileAsync(uploaderStore, loadPathAsync))
    const showStorageStatus = !IS_READ_ONLY && wrapLossyLoading(loadingMaskStore, async () => {
      const { storageStatusText } = await (await authFetch(URL_STORAGE_STATUS)).json()
      await withAlertModal(storageStatusText)
    })
    const appendUploadFileList = !IS_READ_ONLY && getAppendUploadFileList(uploaderStore, () => ({
      shouldAppend: !loadingMaskStore.getState().isLoading,
      relativePath: pathContentStore.getState().pathContent.relativePath
    }))
    const createNewDirectory = async () => pathAction(
      [ await withPromptModal('Directory Name', `new-directory-${Date.now().toString(36)}`) ],
      'create-directory',
      pathContentStore.getState().pathContent.relativePath
    )
    const updateSort = () => { qS('#button-sort').innerText = `Sort: ${pathContentStore.getState().pathSortType}` }
    const cycleSort = () => {
      cyclePathSortType(pathContentStore)
      updateSort()
    }

    const historyStateStore = createHistoryStateStore()
    const historyStateListener = (url) => loadPath(decodeURIComponent((new URL(url)).hash.slice(1)))
    historyStateStore.subscribe(historyStateListener)
    const loadPathWithHistoryState = (relativePath = pathContentStore.getState().pathContent.relativePath) => {
      const urlObject = new URL(historyStateStore.getState())
      urlObject.hash = `#${encodeURIComponent(relativePath)}`
      historyStateStore.setState(urlObject.toString())
    }

    loadingMaskStore.subscribe(() => renderLoadingMask(loadingMaskStore))
    pathContentStore.subscribe(() => renderPathContent(pathContentStore, qS('#main-panel'), loadPathWithHistoryState, pathAction, downloadFile))
    !IS_READ_ONLY && uploaderStore.subscribe(() => renderUploader(uploaderStore, uploadFile, appendUploadFileList))

    aCL(qS('#control-panel'), [
      cE('button', { innerText: 'To Root', onclick: () => loadPathWithHistoryState('.') }),
      cE('span', { innerText: '|' }),
      cE('button', { innerText: 'Refresh', onclick: () => loadPath(pathContentStore.getState().pathContent.relativePath) }),
      cE('button', { id: 'button-sort', onclick: cycleSort }),
      !IS_READ_ONLY && cE('button', { innerText: 'New Directory', onclick: createNewDirectory }),
      !IS_READ_ONLY && cE('span', { innerText: '|' }),
      !IS_READ_ONLY && cE('button', { innerText: 'Toggle Upload', onclick: () => uploaderStore.setState({ isActive: !uploaderStore.getState().isActive }) }),
      !IS_READ_ONLY && cE('button', { innerText: 'Storage Status', onclick: () => showStorageStatus() }),
      cE('button', { innerText: 'Auth Revoke', onclick: () => authRevoke().then(() => location.reload()) })
    ])

    !IS_READ_ONLY && applyDragFileListListener(document.body, (fileList) => appendUploadFileList(fileList))
    historyStateListener(historyStateStore.getState())
    updateSort()

    if (__DEV__) window.DEBUG = { loadingMaskStore, pathContentStore, uploaderStore }
  }

  initAuthMask({
    urlAuthCheck: URL_AUTH_CHECK,
    onAuthPass: initExplorer,
    isSkipAuth: IS_SKIP_AUTH
  })
}

export { getHTML }
