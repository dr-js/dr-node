import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT } from '@dr-js/core/module/node/server/commonHTML'
import { DR_BROWSER_SCRIPT_TAG } from '@dr-js/core/module/node/resource'

import { initModal } from 'source/server/share/HTML/Modal'
import { initLoadingMask } from 'source/server/share/HTML/LoadingMask'

import { initAuthMask } from 'source/server/feature/Auth/HTML'

import { pathContentStyle, initPathContent } from './pathContent'
import { initFileUpload, initUploader } from './uploader'

const getHTML = ({
  URL_AUTH_CHECK,
  URL_PATH_ACTION,
  URL_FILE_SERVE,
  URL_FILE_UPLOAD,
  URL_STORAGE_STATUS,
  IS_SKIP_AUTH = false,
  IS_READ_ONLY = false,
  PATH_ACTION_TYPE
}) => COMMON_LAYOUT([
  `<title>Explorer</title>`,
  COMMON_STYLE(),
  mainStyle,
  pathContentStyle
], [
  `<div id="control-panel" style="overflow-x: auto; white-space: nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="main-panel" style="position: relative; overflow: auto; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT({
    URL_AUTH_CHECK,
    URL_PATH_ACTION,
    URL_FILE_SERVE,
    URL_FILE_UPLOAD,
    URL_STORAGE_STATUS,
    IS_SKIP_AUTH,
    IS_READ_ONLY,
    PATH_ACTION_TYPE,
    initModal,
    initLoadingMask,
    initAuthMask,
    initPathContent,
    initFileUpload,
    initUploader,
    onload: onLoadFunc
  }),
  DR_BROWSER_SCRIPT_TAG()
])

const mainStyle = `<style>
* { font-family: monospace; }
</style>`

const onLoadFunc = () => {
  const {
    URL, location,
    qS, cE, aCL,

    URL_AUTH_CHECK, URL_PATH_ACTION, URL_FILE_SERVE, URL_FILE_UPLOAD, URL_STORAGE_STATUS,
    IS_SKIP_AUTH, IS_READ_ONLY, PATH_ACTION_TYPE,
    initModal, initLoadingMask, initAuthMask, initPathContent, initFileUpload, initUploader,

    Dr: {
      Common: { Immutable: { StateStore: { createStateStore } } },
      Browser: {
        DOM: { applyDragFileListListener },
        Module: { HistoryStateStore: { createHistoryStateStore } }
      }
    }
  } = window

  const initExplorer = async ({ authRevoke, authUrl, authFetch, authDownload }) => {
    const { withAlertModal, withConfirmModal, withPromptModal } = initModal()
    const { initialLoadingMaskState, wrapLossyLoading, renderLoadingMask } = initLoadingMask()
    const { initialPathContentState, cyclePathSortType, getLoadPathAsync, getPathActionAsync, getPreviewFile, getDownloadFile, renderPathContent } = initPathContent(
      URL_PATH_ACTION,
      URL_FILE_SERVE,
      IS_READ_ONLY,
      PATH_ACTION_TYPE,
      authFetch,
      withConfirmModal,
      withPromptModal
    )
    const { initialUploaderState, getUploadFileAsync, getAppendUploadFileList, renderUploader } = IS_READ_ONLY ? {} : initUploader(
      IS_READ_ONLY
        ? () => { throw new Error(`deny file upload, read only`) }
        : initFileUpload(URL_FILE_UPLOAD, authFetch).uploadFileByChunk
    )

    const loadingMaskStore = createStateStore(initialLoadingMaskState)
    const pathContentStore = createStateStore(initialPathContentState)
    const uploaderStore = !IS_READ_ONLY && createStateStore(initialUploaderState)

    const loadPathAsync = getLoadPathAsync(pathContentStore)

    const loadPath = wrapLossyLoading(loadingMaskStore, loadPathAsync)
    const pathAction = wrapLossyLoading(loadingMaskStore, getPathActionAsync(pathContentStore))
    const previewFile = getPreviewFile(pathContentStore, authUrl)
    const downloadFile = getDownloadFile(pathContentStore, authDownload)
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
      PATH_ACTION_TYPE.DIRECTORY_CREATE,
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
    pathContentStore.subscribe(() => renderPathContent(pathContentStore, qS('#main-panel'), loadPathWithHistoryState, pathAction, previewFile, downloadFile))
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
      !IS_SKIP_AUTH && cE('button', { innerText: 'Auth Revoke', onclick: () => authRevoke().then(() => location.reload()) })
    ])

    !IS_READ_ONLY && applyDragFileListListener(document.body, (fileList) => appendUploadFileList(fileList))
    historyStateListener(historyStateStore.getState())
    updateSort()

    if (__DEV__) window.DEBUG = { loadingMaskStore, pathContentStore, uploaderStore }
  }

  initAuthMask({
    IS_SKIP_AUTH,
    URL_AUTH_CHECK,
    onAuthPass: initExplorer
  })
}

export { getHTML }
