import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT, DR_BROWSER_SCRIPT } from 'dr-js/module/node/server/commonHTML'
import { initLoadingMask, initAuthMask } from 'source/responder/commonHTML'
import { pathContentStyle, initPathContent } from './HTML/pathContent'
import { initFileUpload, initUploader } from './HTML/uploader'

const getHTML = (envObject) => COMMON_LAYOUT([
  COMMON_STYLE(),
  mainStyle,
  pathContentStyle
], [
  `<div id="control-panel" style="overflow-x: auto; white-space: nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="main-panel" style="position: relative; overflow: auto; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT({ ...envObject, initAuthMask, initLoadingMask, initPathContent, initFileUpload, initUploader, onload: onLoadFunc }),
  DR_BROWSER_SCRIPT()
])

const mainStyle = `<style>
* { font-family: monospace; }
</style>`

const onLoadFunc = () => {
  const {
    alert, prompt,
    qS, cE, aCL,
    URL_AUTH_CHECK, URL_PATH_MODIFY, URL_PATH_BATCH_MODIFY, URL_FILE_UPLOAD, URL_FILE_SERVE, URL_STORAGE_STATUS,
    initAuthMask, initLoadingMask, initPathContent, initFileUpload, initUploader,
    Dr: {
      Common: { Immutable: { StateStore: { createStateStore } } },
      Browser: { DOM: { applyDragFileListListener } }
    }
  } = window

  const initExplorer = ({ authFetch, authDownload }) => {
    const { uploadFileByChunk } = initFileUpload(URL_FILE_UPLOAD)
    const { initialLoadingMaskState, wrapLossyLoading, renderLoadingMask } = initLoadingMask()
    const { initialPathContentState, cyclePathSortType, getLoadPathAsync, getModifyPathAsync, getModifyPathBatchAsync, getDownloadFileAsync, renderPathContent } = initPathContent(URL_PATH_MODIFY, URL_PATH_BATCH_MODIFY, URL_FILE_SERVE)
    const { initialUploaderState, getUploadFileAsync, getAppendUploadFileList, renderUploader } = initUploader(uploadFileByChunk)

    const loadingMaskStore = createStateStore(initialLoadingMaskState)
    const pathContentStore = createStateStore(initialPathContentState)
    const uploaderStore = createStateStore(initialUploaderState)

    const loadPathAsync = getLoadPathAsync(pathContentStore, authFetch)

    const loadPath = wrapLossyLoading(loadingMaskStore, loadPathAsync)
    const modifyPath = wrapLossyLoading(loadingMaskStore, getModifyPathAsync(pathContentStore, authFetch))
    const modifyPathBatch = wrapLossyLoading(loadingMaskStore, getModifyPathBatchAsync(pathContentStore, authFetch))
    const downloadFile = wrapLossyLoading(loadingMaskStore, getDownloadFileAsync(pathContentStore, authDownload))
    const uploadFile = wrapLossyLoading(loadingMaskStore, getUploadFileAsync(uploaderStore, authFetch, loadPathAsync))
    const showStorageStatus = wrapLossyLoading(loadingMaskStore, async () => {
      const response = await authFetch(URL_STORAGE_STATUS)
      const { storageStatusText } = await response.json()
      alert(storageStatusText)
    })
    const appendUploadFileList = getAppendUploadFileList(uploaderStore, () => ({
      shouldAppend: !loadingMaskStore.getState().isLoading,
      pathFragList: pathContentStore.getState().pathFragList
    }))
    const createNewDirectory = () => modifyPath('create-directory', [
      ...pathContentStore.getState().pathFragList,
      prompt('Directory Name', `new-directory-${Date.now().toString(36)}`)
    ].join('/'))
    const updateSort = () => { qS('#button-sort').innerText = `Sort: ${pathContentStore.getState().pathSortType}` }
    const cycleSort = () => {
      cyclePathSortType(pathContentStore)
      updateSort()
    }

    loadingMaskStore.subscribe(() => renderLoadingMask(loadingMaskStore))
    pathContentStore.subscribe(() => renderPathContent(pathContentStore, qS('#main-panel'), loadPath, modifyPath, modifyPathBatch, downloadFile))
    uploaderStore.subscribe(() => renderUploader(uploaderStore, uploadFile, appendUploadFileList))

    aCL(qS('#control-panel'), [
      cE('button', { innerText: 'To Root', onclick: () => loadPath([]) }),
      cE('span', { innerText: '|' }),
      cE('button', { innerText: 'Refresh', onclick: () => loadPath() }),
      cE('button', { id: 'button-sort', onclick: cycleSort }),
      cE('button', { innerText: 'New Directory', onclick: createNewDirectory }),
      cE('span', { innerText: '|' }),
      cE('button', { innerText: 'Toggle Upload', onclick: () => uploaderStore.setState({ isActive: !uploaderStore.getState().isActive }) }),
      cE('button', { innerText: 'Storage Status', onclick: () => showStorageStatus() })
    ])

    applyDragFileListListener(document.body, (fileList) => appendUploadFileList(fileList))
    loadPath([])
    updateSort()

    if (__DEV__) window.DEBUG = { loadingMaskStore, pathContentStore, uploaderStore }
  }

  initAuthMask({
    urlAuthCheck: URL_AUTH_CHECK,
    onAuthPass: initExplorer
  })
}

export { getHTML }
