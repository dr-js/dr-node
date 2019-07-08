const initFileUpload = (
  URL_FILE_UPLOAD,
  authFetch
) => {
  const {
    crypto, isSecureContext,
    Dr: {
      Common: {
        Function: { withRetryAsync },
        Data: { ArrayBuffer: { fromString }, ArrayBufferPacket: { packChainArrayBufferPacket } }
      },
      Browser: { Data: { Blob: { parseBlobAsArrayBuffer } } }
    }
  } = window

  const CHUNK_SIZE_MAX = 1024 * 1024 // 1MB max
  const uploadFileByChunk = async (fileBlob, key, onProgress) => {
    const fileSize = fileBlob.size
    let chunkIndex = 0
    const chunkTotal = Math.ceil(fileSize / CHUNK_SIZE_MAX) || 1
    onProgress(0, fileSize)

    while (chunkIndex < chunkTotal) {
      const chunkSize = (chunkIndex < chunkTotal - 1)
        ? CHUNK_SIZE_MAX
        : fileSize % CHUNK_SIZE_MAX
      const chunkArrayBuffer = await parseBlobAsArrayBuffer(fileBlob.slice(chunkIndex * CHUNK_SIZE_MAX, chunkIndex * CHUNK_SIZE_MAX + chunkSize))
      const chunkByteLength = chunkArrayBuffer.byteLength
      const chainArrayBufferPacket = packChainArrayBufferPacket([
        fromString(JSON.stringify({ key, chunkByteLength, chunkIndex, chunkTotal })),
        isSecureContext ? await crypto.subtle.digest('SHA-256', chunkArrayBuffer) : new ArrayBuffer(0), // TODO: non-https site can not access window.crypto.subtle
        chunkArrayBuffer
      ])
      onProgress(chunkIndex * CHUNK_SIZE_MAX, fileSize)
      await withRetryAsync(
        () => authFetch(URL_FILE_UPLOAD, { method: 'POST', body: chainArrayBufferPacket }),
        4,
        1000
      )
      chunkIndex += 1
    }
    onProgress(fileSize, fileSize)
  }

  return { uploadFileByChunk }
}

const initUploader = (
  uploadFileByChunk
) => {
  const {
    qS, cE,
    Dr: {
      Common: {
        Format,
        Time: { createStepper },
        Error: { catchAsync },
        Immutable: { Object: { objectSet, objectDelete, objectPickKey } }
      }
    }
  } = window

  const initialUploaderState = {
    isActive: false,
    uploadFileList: [ /* { key, fileBlob } */ ],
    uploadProgress: { /* [key]: progress[0,1] */ },
    uploadStatus: ''
  }

  const getUploadFileAsync = (uploaderStore, onUploadComplete) => async () => {
    const { uploadFileList: fileList } = uploaderStore.getState()
    uploaderStore.setState({ uploadStatus: 'uploading' })
    const stepper = createStepper()
    const uploadStatusList = []
    for (const { key, fileBlob } of fileList) {
      const onProgress = (current, total) => uploaderStore.setState({
        uploadProgress: objectSet(uploaderStore.getState().uploadProgress, key, total ? (current / total) : 1)
      })
      const { error } = await catchAsync(uploadFileByChunk, fileBlob, key, onProgress)
      error && uploadStatusList.push(`Error upload '${key}': ${error.stack || (error.target && error.target.error) || error}`)
    }
    uploadStatusList.push(`Done in ${Format.time(stepper())} for ${fileList.length} file`)
    {
      const { uploadFileList, uploadProgress } = uploaderStore.getState()
      uploaderStore.setState({
        uploadFileList: uploadFileList.filter((v) => !fileList.includes(v)),
        uploadProgress: objectPickKey(uploadProgress, Object.keys(uploadProgress).filter((key) => !fileList.find((v) => v.key === key))),
        uploadStatus: uploadStatusList.join('\n')
      })
    }
    await onUploadComplete()
  }

  const getAppendUploadFileList = (uploaderStore, getExtraState) => (fileList = []) => {
    const { shouldAppend, relativePath } = getExtraState()
    if (!shouldAppend) return

    fileList = Array.from(fileList) // NOTE: convert FileList, for Edge support, do not use `...fileList`
    const dedupSet = new Set()
    const uploadFileList = [
      ...fileList.map((fileBlob) => ({ key: `${relativePath}/${fileBlob.name}`, fileBlob })),
      ...uploaderStore.getState().uploadFileList
    ].filter(({ key }) => dedupSet.has(key) ? false : dedupSet.add(key))
    const uploadProgress = uploadFileList.reduce(
      (uploadProgress, { key }) => objectDelete(uploadProgress, key),
      uploaderStore.getState().uploadProgress
    )
    uploaderStore.setState({ isActive: true, uploadFileList, uploadProgress, uploadStatus: '' })
  }

  const renderUploader = (uploaderStore, uploadFile, appendUploadFileList) => {
    const { isActive, uploadFileList, uploadProgress, uploadStatus } = uploaderStore.getState()
    let uploadBlockDiv = qS('#upload-panel')

    if (!isActive) return uploadBlockDiv && uploadBlockDiv.remove()

    uploadBlockDiv = uploadBlockDiv || document.body.appendChild(cE('div', {
      id: 'upload-panel',
      style: 'overflow: hidden; position: absolute; bottom: 0; right: 0; margin: 8px; background: #fff; box-shadow: 0 0 2px 0 #666;',
      innerHTML: [
        '<div style="overflow-x: auto; display: flex; flex-flow: row nowrap; box-shadow: 0 0 12px 0 #666;">',
        ...[
          '<button class="edit">Upload</button>',
          '<button class="edit">Clear</button>',
          '<div style="flex: 1;"></div>',
          '<button class="edit" style="align-self: flex-end;">❌</button>'
        ],
        '</div>',
        '<label>Select file: <input type="file" multiple/></label>',
        '<pre style="overflow: auto; padding: 8px 4px; max-width: 80vw; max-height: 60vh; min-height: 64px; color: #666;"></pre>'
      ].join('<br />')
    }))

    uploadBlockDiv.querySelector('pre').innerText = [
      ...uploadFileList.map(({ key, fileBlob: { size } }) =>
        `[${Format.percent(uploadProgress[ key ] || 0).padStart(7, ' ')}] - ${key} (${Format.binary(size)}B)`
      ),
      uploadStatus
    ].filter(Boolean).join('\n') || 'or drop file here'

    const [ uploadButton, clearButton, removeBlockButton ] = uploadBlockDiv.querySelectorAll('button')
    uploadButton.addEventListener('click', uploadFile)
    clearButton.addEventListener('click', () => uploaderStore.setState({ ...initialUploaderState, isActive: true }))
    removeBlockButton.addEventListener('click', () => uploaderStore.setState({ isActive: false }))

    const uploadFileListInput = uploadBlockDiv.querySelector('input[type="file"]')
    uploadFileListInput.addEventListener('change', () => appendUploadFileList(uploadFileListInput.files))
  }

  return {
    initialUploaderState,
    getUploadFileAsync,
    getAppendUploadFileList,
    renderUploader
  }
}

export { initFileUpload, initUploader }
