import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT, DR_BROWSER_SCRIPT } from 'dr-js/module/node/server/commonHTML'
import { initAuthMask } from 'source/responder/function'

const getHTML = (envObject) => COMMON_LAYOUT([
  COMMON_STYLE(),
  mainStyle
], [
  `<div id="control-panel" style="overflow-x: auto; display: flex; flex-flow: row nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="main-panel" style="position: relative; overflow: auto; display: flex; flex-flow: column nowrap; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT({ ...envObject, initAuthMask, onload: onLoadFunc }),
  DR_BROWSER_SCRIPT()
])

const mainStyle = `<style>
.loading { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: #eee; opacity: 0; z-index: 256; transition: opacity 1s ease; }
.path { margin: 12px 2px; }
.directory, .file { display: flex; flex-flow: row nowrap; align-items: stretch; border-top: 1px solid #ddd; }
.file { pointer-events: none; color: #666; }
.name { overflow:hidden; flex: 1; align-self: center; margin: 0; white-space:nowrap; text-overflow: ellipsis; background: transparent; }
.edit { pointer-events: auto; min-width: 1.5em; min-height: auto; line-height: normal; }
</style>`

const onLoadFunc = () => {
  const {
    prompt,
    fetch,
    crypto,
    isSecureContext,
    qS,
    cE,
    aCL,
    PATH_CONTENT_URL,
    PATH_MODIFY_URL,
    FILE_UPLOAD_URL,
    SERVE_FILE_URL,
    AUTH_CHECK_URL,
    initAuthMask,
    Dr: {
      Common: {
        Time: { clock },
        Error: { catchAsync },
        Function: { withRetryAsync, lossyAsync },
        Data: { ArrayBuffer: { packBufferString } },
        Immutable: { Object: { objectSet, objectDelete, objectMerge }, StateStore: { createStateStore } },
        Module: { TimedLookup: { generateCheckCode } },
        Format
      },
      Browser: {
        Resource: { createDownloadWithBlob },
        DOM: { applyDragFileListListener },
        Data: { Blob: { parseBlobAsArrayBuffer }, BlobPacket: { packBlobPacket } }
      }
    }
  } = window

  const calcBlobHashBufferString = async (blob) => packBufferString(await crypto.subtle.digest('SHA-256', await parseBlobAsArrayBuffer(blob)))

  const CHUNK_SIZE_MAX = 1024 * 1024 // 1MB max
  const uploadFileByChunk = async (fileBlob, filePath, onProgress, getAuthCheckCode) => {
    const fileBlobSize = fileBlob.size
    let chunkIndex = 0
    const chunkTotal = Math.ceil(fileBlobSize / CHUNK_SIZE_MAX) || 1
    onProgress(0, fileBlobSize)

    while (chunkIndex < chunkTotal) {
      const chunkSize = (chunkIndex < chunkTotal - 1)
        ? CHUNK_SIZE_MAX
        : fileBlobSize % CHUNK_SIZE_MAX
      const chunkBlob = fileBlob.slice(chunkIndex * CHUNK_SIZE_MAX, chunkIndex * CHUNK_SIZE_MAX + chunkSize)
      const chunkByteLength = chunkBlob.size
      // TODO: non-https site can not access window.crypto.subtle
      const chunkHashBufferString = isSecureContext ? await calcBlobHashBufferString(chunkBlob) : ''
      const blobPacket = packBlobPacket(JSON.stringify({ filePath, chunkByteLength, chunkHashBufferString, chunkIndex, chunkTotal }), chunkBlob)
      onProgress(chunkIndex * CHUNK_SIZE_MAX, fileBlobSize)
      await withRetryAsync(async () => {
        const { ok } = await fetch(FILE_UPLOAD_URL, { method: 'POST', headers: { 'auth-check-code': getAuthCheckCode() }, body: blobPacket })
        if (!ok) throw new Error(`[uploadFileByChunk] error uploading chunk ${chunkIndex} of ${filePath}`)
      }, 3, 50)
      chunkIndex += 1
    }
    onProgress(fileBlobSize, fileBlobSize)
  }

  const initExplorer = (timedLookupData) => {
    const getAuthCheckCode = () => generateCheckCode(timedLookupData)

    const INITIAL_STATE = {
      isLoading: false,
      pathState: {
        pathFragList: [ /* pathFrag */ ],
        pathContent: { relativePath: '', directoryList: [ /* name */ ], fileList: [ /* name */ ] }
      },
      uploadState: {
        isActive: false,
        uploadFileList: [ /* { filePath, fileBlob } */ ],
        uploadProgress: { /* [filePath]: progress[0,1] */ },
        uploadStatus: ''
      }
    }

    const STATE_STORE = createStateStore(INITIAL_STATE)

    const wrapLossyLoading = (func) => lossyAsync(async (...args) => {
      if (STATE_STORE.getState().isLoading) return
      STATE_STORE.setState({ isLoading: true })
      await catchAsync(func, ...args)
      STATE_STORE.setState({ isLoading: false })
    }).trigger

    const updatePathState = (pathState) => STATE_STORE.setState({ pathState: objectMerge(STATE_STORE.getState().pathState, pathState) })
    const updateUploadState = (uploadState) => STATE_STORE.setState({ uploadState: objectMerge(STATE_STORE.getState().uploadState, uploadState) })

    const loadPathAsync = async (pathFragList = STATE_STORE.getState().pathState.pathFragList) => {
      const response = await fetch(`${PATH_CONTENT_URL}/${encodeURI(pathFragList.join('/'))}`, {
        method: 'GET',
        headers: { 'auth-check-code': getAuthCheckCode() }
      })
      if (!response.ok) throw new Error(`[loadPathAsync] error status: ${response.status}`)
      const { relativePath, directoryList, fileList } = await response.json()
      updatePathState({ pathFragList, pathContent: { relativePath, directoryList, fileList } })
    }
    const modifyPathAsync = async (modifyType, relativePathFrom, relativePathTo) => {
      if ((modifyType === 'move' || modifyType === 'copy') && (!relativePathTo || relativePathTo === relativePathFrom)) return
      const response = await fetch(PATH_MODIFY_URL, {
        method: 'POST',
        headers: { 'auth-check-code': getAuthCheckCode() },
        body: JSON.stringify({ modifyType, relativePathFrom, relativePathTo })
      })
      if (!response.ok) throw new Error(`[modifyPathAsync] error status: ${response.status}`)
      await response.json()
      await loadPathAsync()
    }
    const fetchFileAsync = async (pathList, fileName) => {
      const response = await fetch(`${SERVE_FILE_URL}/${encodeURI([ ...pathList, fileName ].join('/'))}`, {
        method: 'GET',
        headers: { 'auth-check-code': getAuthCheckCode() }
      })
      if (!response.ok) throw new Error(`[fetchFileAsync] error status: ${response.status}`)
      createDownloadWithBlob(fileName, await response.blob())
    }
    const uploadFileAsync = async () => {
      const { uploadFileList } = STATE_STORE.getState().uploadState
      updateUploadState({ uploadStatus: 'uploading' })
      const timeStart = clock()
      const uploadStatusList = []
      for (const { filePath, fileBlob } of uploadFileList) {
        const onProgress = (current, total) => updateUploadState({
          uploadProgress: objectSet(
            STATE_STORE.getState().uploadState.uploadProgress,
            filePath,
            total ? (current / total) : 1
          )
        })
        const { error } = await catchAsync(uploadFileByChunk, fileBlob, filePath, onProgress, getAuthCheckCode)
        error && uploadStatusList.push(`Error upload '${filePath}': ${error.stack || (error.target && error.target.error) || error}`)
      }
      uploadStatusList.push(`Done in ${Format.time(clock() - timeStart)} for ${uploadFileList.length} file`)
      updateUploadState({ uploadStatus: uploadStatusList.join('\n') })
      await loadPathAsync()
    }
    const appendUploadFileList = (fileList = []) => {
      const { isLoading, pathState: { pathFragList }, uploadState } = STATE_STORE.getState()
      if (isLoading) return
      const dedupSet = new Set()
      const uploadFileList = [
        ...fileList.map((fileBlob) => ({ filePath: [ ...pathFragList, fileBlob.name ].join('/'), fileBlob })),
        ...uploadState.uploadFileList
      ].filter(({ filePath }) => dedupSet.has(filePath) ? false : dedupSet.add(filePath))
      const uploadProgress = uploadFileList.reduce(
        (uploadProgress, { filePath }) => objectDelete(uploadProgress, filePath),
        uploadState.uploadProgress
      )
      updateUploadState({ isActive: true, uploadFileList, uploadProgress, uploadStatus: '' })
    }

    const loadPath = wrapLossyLoading(loadPathAsync)
    const modifyPath = wrapLossyLoading(modifyPathAsync)
    const fetchFile = wrapLossyLoading(fetchFileAsync)
    const uploadFile = wrapLossyLoading(uploadFileAsync)

    STATE_STORE.subscribe((state, prevState) => {
      const shouldUpdateLoading = state.isLoading !== prevState.isLoading
      const shouldUpdatePath = state.pathState !== prevState.pathState
      const shouldUpdateUpload = shouldUpdatePath || state.uploadState !== prevState.uploadState

      shouldUpdateLoading && renderLoading(state)
      shouldUpdatePath && renderPathContent(state)
      shouldUpdateUpload && renderUpload(state)
    })

    const renderLoading = ({ isLoading }) => {
      if (!isLoading) return qS('#loading') && qS('#loading').remove()
      !qS('#loading') && document.body.appendChild(cE('div', { id: 'loading', className: 'loading' }))
      setTimeout(() => { if (qS('#loading')) qS('#loading').style.opacity = '0.5' }, 200)
    }

    const renderPathContent = ({ pathState: { pathFragList, pathContent: { relativePath, directoryList, fileList } } }) => {
      const commonEdit = (relativePath) => [
        cE('button', { className: 'edit', innerText: '✂', onclick: () => modifyPath('move', relativePath, prompt('Move To', relativePath)) }),
        cE('button', { className: 'edit', innerText: '⎘', onclick: () => modifyPath('copy', relativePath, prompt('Copy To', relativePath)) }),
        cE('button', { className: 'edit', innerText: '☢', onclick: () => modifyPath('delete', relativePath) })
      ]

      const contentList = [
        cE('h2', { className: 'path', innerText: relativePath ? (`/${relativePath}/`) : '[ROOT]' }),
        relativePath && cE('div', { className: 'directory' }, [
          cE('span', { className: 'name button', innerText: '🔙|..', onclick: () => loadPath(pathFragList.slice(0, -1)) })
        ]),
        ...directoryList.map((name) => cE('div', { className: 'directory' }, [
          cE('span', { className: 'name button', innerText: `📁|${name}/`, onclick: () => loadPath([ ...pathFragList, name ]) }),
          ...commonEdit([ ...pathFragList, name ].join('/'))
        ])),
        ...fileList.map((name) => cE('div', { className: 'file' }, [
          cE('span', { className: 'name button', innerText: `📄|${name}` }),
          cE('button', { className: 'edit', innerText: '⭳', onclick: () => fetchFile(pathFragList, name) }),
          ...commonEdit([ ...pathFragList, name ].join('/'))
        ]))
      ].filter(Boolean)
      const mainPanel = qS('#main-panel', '')
      contentList.forEach((element) => mainPanel.appendChild(element))
    }

    const renderUpload = ({ uploadState: { isActive, uploadFileList, uploadProgress, uploadStatus } }) => {
      if (!isActive) {
        const uploadBlockDiv = qS('#upload-panel')
        uploadBlockDiv && uploadBlockDiv.remove()
        return
      }
      const uploadBlockDiv = getUploadBlockDiv()
      uploadBlockDiv.querySelector('pre').innerText = [
        ...uploadFileList.map(({ filePath, fileBlob: { size } }) =>
          `[${Format.percent(uploadProgress[ filePath ] || 0).padStart(7, ' ')}] - ${filePath} (${Format.binary(size)}B)`
        ),
        uploadStatus
      ].filter(Boolean).join('\n') || 'or drop file here'
    }

    const getUploadBlockDiv = () => {
      const uploadBlockDiv = qS('#upload-panel') || document.body.appendChild(cE('div', {
        id: 'upload-panel',
        style: 'overflow: hidden; position: absolute; bottom: 0; right: 0; margin: 8px; background: #fff; box-shadow: 0 0 2px 0 #666;',
        innerHTML: [
          '<div style="overflow-x: auto; display: flex; flex-flow: row nowrap; box-shadow: 0 0 12px 0 #666;">',
          ...[
            '<button class="edit">Upload</button>',
            '<button class="edit">Clear</button>',
            '<div style="flex: 1;"></div>',
            '<button class="edit" style="align-self: flex-end;">☓</button>'
          ],
          '</div>',
          '<label>Select file: <input type="file" multiple/></label>',
          '<pre style="overflow: auto; padding: 8px 4px; max-width: 80vw; max-height: 60vh; min-height: 64px; color: #666;"></pre>'
        ].join('<br />')
      }))
      const [ uploadButton, clearButton, removeBlockButton ] = uploadBlockDiv.querySelectorAll('button')
      const uploadFileListInput = uploadBlockDiv.querySelector('input[type="file"]')

      uploadButton.addEventListener('click', uploadFile)
      clearButton.addEventListener('click', () => updateUploadState({ ...INITIAL_STATE.uploadState, isActive: true }))
      removeBlockButton.addEventListener('click', () => updateUploadState({ isActive: false }))
      uploadFileListInput.addEventListener('change', () => appendUploadFileList([ ...uploadFileListInput.files ]))

      return uploadBlockDiv
    }

    aCL(qS('#control-panel'), [
      cE('button', { innerText: 'Refresh', onclick: () => loadPath() }),
      cE('button', { innerText: 'To Root', onclick: () => loadPath([]) }),
      cE('button', { innerText: 'New Directory', onclick: () => modifyPath('create-directory', [ ...STATE_STORE.getState().pathState.pathFragList, prompt('Directory Name', `new-directory-${Date.now().toString(36)}`) ].join('/')) }),
      cE('button', { innerText: 'Toggle Upload', onclick: () => updateUploadState({ isActive: !STATE_STORE.getState().uploadState.isActive }) })
    ])

    applyDragFileListListener(document.body, (fileList) => appendUploadFileList([ ...fileList ]))

    loadPath([])
  }

  initAuthMask({ authCheckUrl: AUTH_CHECK_URL, onAuthPass: initExplorer })
}

export { getHTML }
