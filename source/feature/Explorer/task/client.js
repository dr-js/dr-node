import { dirname } from 'path'

import { withRetryAsync } from 'dr-js/module/common/function'
import { percent, binary } from 'dr-js/module/common/format'
import { readFileAsync, writeFileAsync } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'

import { uploadFileByChunk } from './fileChunkUpload'

const DEFAULT_TIMEOUT = 30 * 1000

const fileUpload = async ({
  fileInputPath,
  fileBuffer, // OPTIONAL, will load from fileInputPath
  key,

  urlFileUpload,

  timeout = DEFAULT_TIMEOUT, maxRetry = 3, wait = 1000,
  authFetch, // from `configureAuthFile`
  logger, log = logger && logger.add
}) => {
  if (fileBuffer === undefined) fileBuffer = await readFileAsync(fileInputPath)

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
  authFetch, // from `configureAuthFile`
  logger, log = logger && logger.add
}) => {
  log && log(`[Download] key: ${key}`)

  const fileBuffer = await (await authFetch(`${urlFileDownload}/${encodeURIComponent(key)}`, {
    method: 'GET',
    timeout
  })).buffer()
  log && log(`[Download] get: ${binary(fileBuffer.length)}B`)

  if (fileOutputPath) {
    await createDirectory(dirname(fileOutputPath))
    await writeFileAsync(fileOutputPath, fileBuffer)
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
  authFetch, // from `configureAuthFile`
  logger, log = logger && logger.add
}) => {
  log && log(`[Action|${actionType}] key: ${key}, keyTo: ${keyTo}, nameList: [${nameList}]`)

  const result = await (await authFetch(urlPathAction, {
    method: 'POST',
    body: JSON.stringify({ nameList, actionType, key, keyTo }),
    timeout
  })).json()

  log && log(`[Action|${actionType}] done`)

  return result // should check errorList
}

export {
  fileUpload,
  fileDownload,
  pathAction
}
