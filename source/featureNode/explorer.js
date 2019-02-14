import { dirname } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { withRetryAsync } from 'dr-js/module/common/function'
import { percent, binary } from 'dr-js/module/common/format'
import { createDirectory } from 'dr-js/module/node/file/File'

import { loadLookupFile, authFetchTimedLookup } from 'source/configure/auth'
import { uploadFileByChunk } from 'source/feature/Explorer/task/fileChunkUpload'

// for node client file chunk upload

const DEFAULT_TIMEOUT = 30 * 1000

const getAuthFetch = async ({ fileAuth, authKey }) => {
  const timedLookupData = await loadLookupFile(fileAuth)
  return async (url, option) => authFetchTimedLookup(url, option, timedLookupData, authKey)
}

const fileUpload = async ({
  fileInputPath,
  fileBuffer = readFileSync(fileInputPath),
  filePath,

  urlFileUpload,
  timeout = DEFAULT_TIMEOUT,
  maxRetry = 3,
  wait = 1000,

  authFetch,
  log
}) => {
  log && log(`[Upload] file: ${filePath}, size: ${binary(fileBuffer.length)}B`)

  await uploadFileByChunk({
    fileBuffer,
    filePath,
    onProgress: (uploadedSize, totalSize) => log && log(`[Upload] upload: ${percent(uploadedSize / totalSize)}`),
    uploadFileChunkBuffer: async (chainBufferPacket, { chunkIndex }) => withRetryAsync(
      async () => authFetch(urlFileUpload, { method: 'POST', body: chainBufferPacket, timeout }).catch((error) => {
        const message = `[ERROR][Upload] upload chunk ${chunkIndex} of ${filePath}`
        log && log(message, error)
        throw new Error(message)
      }),
      maxRetry,
      wait
    )
  })

  log && log(`[Upload] done: ${filePath}`)
}

const fileDownload = async ({
  fileOutputPath,
  filePath,

  urlFileDownload,
  timeout = DEFAULT_TIMEOUT,

  authFetch,
  log
}) => {
  log && log(`[Download] file: ${filePath}`)

  const fileBuffer = await (await authFetch(`${urlFileDownload}/${encodeURIComponent(filePath)}`, {
    method: 'GET',
    timeout
  })).buffer()
  log && log(`[Download] get: ${binary(fileBuffer.length)}B`)

  if (fileOutputPath) {
    await createDirectory(dirname(fileOutputPath))
    writeFileSync(fileOutputPath, fileBuffer)
    log && log(`[Download] done: ${fileOutputPath}`)
  }

  return fileBuffer
}

const pathAction = async ({
  actionType,
  key = '',
  keyTo,
  nameList = [ '' ],

  urlPathAction,
  timeout = DEFAULT_TIMEOUT,

  authFetch,
  log
}) => {
  log && log(`[Action|${actionType}] key: ${key}, keyTo: ${keyTo}, nameList: [${nameList}]`)

  const result = await (await authFetch(urlPathAction, {
    method: 'POST',
    body: JSON.stringify({ nameList, actionType, relativeFrom: key, relativeTo: keyTo }),
    timeout
  })).json()

  log && log(`[Action|${actionType}] done`)

  return result // should check errorList
}

export {
  getAuthFetch,

  fileUpload,
  fileDownload,
  pathAction
}
