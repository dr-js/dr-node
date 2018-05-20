import {
  COMMON_LAYOUT,
  COMMON_STYLE,
  COMMON_SCRIPT,
  INJECT_GLOBAL_ENV_SCRIPT,
  DR_BROWSER_SCRIPT,
  AUTH_MASK_SCRIPT
} from 'source/resource/commonHTML'

const getHTML = (envObject) => COMMON_LAYOUT([
  COMMON_STYLE()
], [
  `<div id="control-panel" style="overflow-x: auto; display: flex; flex-flow: row nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="upload-panel" style="overflow: auto; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT(),
  mainScript,
  INJECT_GLOBAL_ENV_SCRIPT(envObject),
  AUTH_MASK_SCRIPT(),
  DR_BROWSER_SCRIPT()
])

const mainScript = `<script>window.onload = () => {
  const {
    qS,
    cT,
    initAuthMask,
    Dr: {
      Common: { Time: { clock }, Function: { withRetryAsync }, Data: { ArrayBuffer: { packBufferString } }, Module: { TimedLookup: { generateCheckCode } }, Format },
      Browser: { DOM: { applyDragFileListListener }, Data: { Blob: { parseBlobAsArrayBuffer }, BlobPacket: { packBlobPacket } } }
    },
    FILE_UPLOAD_URL,
    AUTH_CHECK_URL
  } = window

  const calcBlobHashBufferString = async (blob) => packBufferString(await window.crypto.subtle.digest('SHA-256', await parseBlobAsArrayBuffer(blob)))

  const CHUNK_SIZE_MAX = 1024 * 1024 // 1MB max
  const uploadFileByChunk = async (fileBlob, pathPrefix, onProgress, getAuthCheckCode) => {
    const filePath = String(pathPrefix) + fileBlob.name
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
      const chunkHashBufferString = window.isSecureContext ? await calcBlobHashBufferString(chunkBlob) : ''
      const blobPacket = packBlobPacket(JSON.stringify({ filePath, chunkByteLength, chunkHashBufferString, chunkIndex, chunkTotal }), chunkBlob)
      onProgress(chunkIndex * CHUNK_SIZE_MAX, fileBlobSize)
      await withRetryAsync(async () => { 
        const { ok } = await fetch(FILE_UPLOAD_URL, { method: 'POST', headers: { 'auth-check-code': getAuthCheckCode() }, body: blobPacket })
        if (!ok) throw new Error('[uploadFileByChunk] error uploading chunk ' + chunkIndex + ' of ' + filePath)
      }, 3, 50)
      chunkIndex += 1
    }
    onProgress(fileBlobSize, fileBlobSize)
  }

  const initUploader = (timedLookupData) => {
    const getAuthCheckCode = () => generateCheckCode(timedLookupData)
    const appendUploadBlock = () => {
      const uploadBlockDiv = qS('#upload-panel').appendChild(cT('div', {
        style: 'margin: 8px; padding: 2px; box-shadow: 0 0 2px 0 #666;',
        innerHTML: [
          '<button>Upload</button><button>Remove Block</button>',
          '<label>Path Prefix: <input type="text" placeholder="path-prefix"/></label>',
          '<label>Select file: <input type="file" multiple/></label>',
          '<pre>or drop file here</pre>'
        ].join('<br />')
      }))

      const pathPrefixInput = uploadBlockDiv.querySelector('input[type="text"]')
      const uploadFileListInput = uploadBlockDiv.querySelector('input[type="file"]')
      const uploadInfoPre = uploadBlockDiv.querySelector('pre')
      const [ uploadButton, removeBlockButton ] = uploadBlockDiv.querySelectorAll('button')

      const updateInfo = () => {
        const pathPrefix = pathPrefixInput.value || ''
        const uploadFileList = Array.from(uploadFileListInput.files)
        uploadInfoPre.innerHTML = uploadFileList
          .map(({ name, size }) => pathPrefix + name + ' (' + Format.binary(size) + 'B)')
          .join('\\n')
        return { pathPrefix, uploadFileList }
      }
      const updateUploadInfo = (progressInfo) => {
        const pathPrefix = pathPrefixInput.value
        const uploadFileList = Array.from(uploadFileListInput.files)
        uploadInfoPre.innerHTML = uploadFileList
          .map(({ name, size }) => '[' + Format.percent(progressInfo[ name ] || 0).padStart(7, ' ') + '] - ' + pathPrefix + name + ' (' + Format.binary(size) + 'B)')
          .join('\\n')
        return { pathPrefix, uploadFileList }
      }

      pathPrefixInput.addEventListener('keyup', updateInfo)
      pathPrefixInput.addEventListener('change', updateInfo)
      uploadFileListInput.addEventListener('change', updateInfo)
      uploadButton.addEventListener('click', () => {
        const { pathPrefix, uploadFileList } = updateInfo()
        const timeStart = clock()
        const progressInfo = {}
        Promise.resolve((async () => {
          for (const fileBlob of uploadFileList) {
            const onProgress = (current, total) => { // console.log('onProgress', fileBlob.name, current, total)
              progressInfo[ fileBlob.name ] = total ? (current / total) : 1
              updateUploadInfo(progressInfo)
            }
            await uploadFileByChunk(fileBlob, pathPrefix, onProgress, getAuthCheckCode)
          }
        })()).then(
          () => { uploadInfoPre.innerHTML += '\\nDone in ' + Format.time(clock() - timeStart) },
          (error) => { uploadInfoPre.innerHTML += '\\nFailed with ' + error }
        )
      })
      removeBlockButton.addEventListener('click', () => uploadBlockDiv.remove())
      applyDragFileListListener(uploadBlockDiv, (fileList) => { uploadFileListInput.files = fileList })
    }

    qS('#control-panel').appendChild(cT('button', { innerText: 'Append Upload Block', onclick: appendUploadBlock }))
    appendUploadBlock()
  }

  initAuthMask(AUTH_CHECK_URL, initUploader)
}</script>`

export { getHTML }
