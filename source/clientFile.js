import { dirname } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { withRetryAsync } from 'dr-js/module/common/function'
import { percent, binary, time } from 'dr-js/module/common/format'
import { clock } from 'dr-js/module/common/time'
import { generateCheckCode } from 'dr-js/module/common/module/TimedLookup'

import { fetch } from 'dr-js/module/node/net'
import { createDirectory } from 'dr-js/module/node/file/File'

import { loadLookupFile } from 'source/configure/auth'
import { uploadFileByChunk } from 'source/task/getFileChunkUpload'

const getAuthFetch = async (fileAuthConfig) => {
  const timedLookupData = await loadLookupFile(fileAuthConfig)
  return async (url, config) => {
    const response = await fetch(url, { ...config, headers: { ...config.headers, 'auth-check-code': generateCheckCode(timedLookupData) } })
    if (!response.ok) throw new Error(`[Error][AuthFetch] status: ${response.status}`)
    return response
  }
}

const clientFileUpload = async ({
  fileInputPath,
  fileBuffer = readFileSync(fileInputPath),
  filePath,
  urlFileUpload,
  fileAuthConfig
}) => {
  const startTime = clock()
  const authFetch = await getAuthFetch(fileAuthConfig)

  console.log(`[clientFileUpload] file: ${filePath}, size: ${binary(fileBuffer.length)}B`)

  await uploadFileByChunk({
    fileBuffer,
    filePath,
    onProgress: (uploadedSize, totalSize) => console.log(`[clientFileUpload] uploading ${percent(uploadedSize / totalSize)} (${time(clock() - startTime)})`),
    uploadFileChunkBuffer: async (chainBufferPacket, { chunkIndex }) => withRetryAsync(
      async () => authFetch(urlFileUpload, { method: 'POST', body: chainBufferPacket }).catch((error) => {
        console.warn(error)
        throw new Error(`[clientFileUpload] error upload chunk ${chunkIndex} of ${filePath}`)
      }),
      3,
      50
    )
  })

  console.log(`[clientFileUpload] done: ${filePath} (${time(clock() - startTime)})`)
}

const clientFileDownload = async ({
  fileOutputPath,
  filePath,
  urlFileDownload,
  fileAuthConfig
}) => {
  const startTime = clock()
  const authFetch = await getAuthFetch(fileAuthConfig)

  console.log(`[clientFileDownload] file: ${filePath}`)

  const { buffer } = await authFetch(`${urlFileDownload}/${encodeURIComponent(filePath)}`, { method: 'GET' })
  const fileBuffer = await buffer()
  console.log(`[clientFileDownload] get file: ${binary(fileBuffer.length)}B (${time(clock() - startTime)})`)

  if (fileOutputPath) {
    await createDirectory(dirname(fileOutputPath))
    writeFileSync(fileOutputPath, fileBuffer)
    console.log(`[clientFileDownload] done: ${fileOutputPath} (${time(clock() - startTime)})`)
  }

  return fileBuffer
}

const clientFileModify = async ({
  modifyType,
  filePath: relativePathFrom = '',
  filePathTo: relativePathTo,
  urlFileModify,
  fileAuthConfig
}) => {
  const startTime = clock()
  const authFetch = await getAuthFetch(fileAuthConfig)

  console.log(`[clientFileModify] modify: ${modifyType}, file: ${relativePathFrom}, fileTo: ${relativePathTo}`)

  const result = await (await authFetch(urlFileModify, { method: 'POST', body: JSON.stringify({ modifyType, relativePathFrom, relativePathTo }) })).json()

  console.log(`[clientFileModify] modify: ${modifyType} (${time(clock() - startTime)})`)

  return result
}

export { clientFileUpload, clientFileDownload, clientFileModify }
