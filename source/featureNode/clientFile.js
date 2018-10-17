import { dirname } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { withRetryAsync } from 'dr-js/module/common/function'
import { percent, binary, time } from 'dr-js/module/common/format'
import { clock } from 'dr-js/module/common/time'
import { generateCheckCode } from 'dr-js/module/common/module/TimedLookup'

import { fetchLikeRequest } from 'dr-js/module/node/net'
import { createDirectory } from 'dr-js/module/node/file/File'

import { loadLookupFile } from 'source/configure/auth'
import { uploadFileByChunk } from 'source/feature/Explorer/task/getFileChunkUpload'

// TODO: handle logging properly

// for node client file chunk upload

const getAuthFetch = async (fileAuth) => {
  const timedLookupData = await loadLookupFile(fileAuth)
  return async (url, config) => {
    const response = await fetchLikeRequest(url, { ...config, headers: { ...config.headers, 'auth-check-code': generateCheckCode(timedLookupData) } })
    if (!response.ok) throw new Error(`[Error][AuthFetch] status: ${response.status}`)
    return response
  }
}

const clientFileUpload = async ({
  fileInputPath,
  fileBuffer = readFileSync(fileInputPath),
  filePath,
  urlFileUpload,
  fileAuth,
  maxRetry = 3,
  wait = 1000,
  log = console.log
}) => {
  const startTime = clock()
  const authFetch = await getAuthFetch(fileAuth)

  log && log(`[clientFileUpload] file: ${filePath}, size: ${binary(fileBuffer.length)}B`)

  await uploadFileByChunk({
    fileBuffer,
    filePath,
    onProgress: (uploadedSize, totalSize) => log && log(`[clientFileUpload] uploading ${percent(uploadedSize / totalSize)} (${time(clock() - startTime)})`),
    uploadFileChunkBuffer: async (chainBufferPacket, { chunkIndex }) => withRetryAsync(
      async () => authFetch(urlFileUpload, { method: 'POST', body: chainBufferPacket }).catch((error) => {
        const message = `[ERROR][clientFileUpload] upload chunk ${chunkIndex} of ${filePath}`
        log && log(message, error)
        throw new Error(message)
      }),
      maxRetry,
      wait
    )
  })

  log && log(`[clientFileUpload] done: ${filePath} (${time(clock() - startTime)})`)
}

const clientFileDownload = async ({
  fileOutputPath,
  filePath,
  urlFileDownload,
  fileAuth,
  log = console.log
}) => {
  const startTime = clock()
  const authFetch = await getAuthFetch(fileAuth)

  log && log(`[clientFileDownload] file: ${filePath}`)

  const fileBuffer = await (await authFetch(`${urlFileDownload}/${encodeURIComponent(filePath)}`, { method: 'GET' })).buffer()
  log && log(`[clientFileDownload] get file: ${binary(fileBuffer.length)}B (${time(clock() - startTime)})`)

  if (fileOutputPath) {
    await createDirectory(dirname(fileOutputPath))
    writeFileSync(fileOutputPath, fileBuffer)
    log && log(`[clientFileDownload] done: ${fileOutputPath} (${time(clock() - startTime)})`)
  }

  return fileBuffer
}

const clientFileModify = async ({
  modifyType,
  filePath: relativePathFrom = '',
  filePathTo: relativePathTo,
  urlFileModify,
  fileAuth,
  log = console.log
}) => {
  const startTime = clock()
  const authFetch = await getAuthFetch(fileAuth)

  log && log(`[clientFileModify] modify: ${modifyType}, file: ${relativePathFrom}, fileTo: ${relativePathTo}`)

  const result = await (await authFetch(urlFileModify, { method: 'POST', body: JSON.stringify({ modifyType, relativePathFrom, relativePathTo }) })).json()

  log && log(`[clientFileModify] modify: ${modifyType} (${time(clock() - startTime)})`)

  return result
}

export { clientFileUpload, clientFileDownload, clientFileModify }
