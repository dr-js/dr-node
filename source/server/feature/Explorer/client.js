import { dirname } from 'path'
import { promises as fsAsync } from 'fs'

import { withRetryAsync } from '@dr-js/core/module/common/function'
import { percent, binary } from '@dr-js/core/module/common/format'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'

import { uploadFileByChunk } from 'source/module/FileChunkUpload'

const DEFAULT_TIMEOUT = 30 * 1000

const fileUpload = async ({
  fileInputPath,
  fileBuffer, // optional, will load from fileInputPath
  key,
  urlFileUpload,

  timeout = DEFAULT_TIMEOUT, maxRetry = 3, wait = 1000,
  authFetch, // from `module/Auth`
  log
}) => {
  if (fileBuffer === undefined) fileBuffer = await fsAsync.readFile(fileInputPath)

  log && log(`[Upload] key: ${key}, size: ${binary(fileBuffer.length)}B`)

  await uploadFileByChunk({
    fileBuffer,
    key,
    onProgress: (uploadedSize, totalSize) => log && log(`[Upload] upload: ${percent(uploadedSize / totalSize)}`),
    uploadFileChunkBuffer: async (chainBufferPacket, { chunkIndex }) => withRetryAsync(
      async () => authFetch(urlFileUpload, { method: 'POST', body: chainBufferPacket, timeout }).catch((error) => {
        const message = `[ERROR][Upload] upload chunk ${chunkIndex} of ${key}`
        log && log(message, error)
        throw new Error(message)
      }),
      maxRetry,
      wait
    )
  })

  log && log(`[Upload] done: ${key}`)
}

const fileDownload = async ({
  fileOutputPath, // optional // TODO: confusing
  key,
  urlFileDownload,

  timeout = DEFAULT_TIMEOUT,
  authFetch, // from `module/Auth`
  log
}) => {
  log && log(`[Download] key: ${key}`)

  const fileBuffer = await (await authFetch(`${urlFileDownload}/${encodeURIComponent(key)}`, { method: 'GET', timeout })).buffer()
  log && log(`[Download] get: ${binary(fileBuffer.length)}B`)

  if (fileOutputPath) {
    await createDirectory(dirname(fileOutputPath))
    await fsAsync.writeFile(fileOutputPath, fileBuffer)
    log && log(`[Download] done: ${fileOutputPath}`)
  }

  return fileBuffer
}

const pathAction = async ({
  nameList = [ '' ],
  actionType,
  key = '',
  keyTo,
  urlPathAction,

  timeout = DEFAULT_TIMEOUT,
  authFetch, // from `module/Auth`
  log
}) => {
  log && log(`[Action|${actionType}] key: ${key}, keyTo: ${keyTo}, nameList: [${nameList}]`)

  const body = JSON.stringify({ nameList, actionType, key, keyTo })
  const result = await (await authFetch(urlPathAction, { method: 'POST', body, timeout })).json()

  log && log(`[Action|${actionType}] done`)

  return result // should check errorList
}

export {
  fileUpload,
  fileDownload,
  pathAction
}
