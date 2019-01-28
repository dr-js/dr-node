import { dirname } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { withRetryAsync } from 'dr-js/module/common/function'
import { percent, binary, time } from 'dr-js/module/common/format'
import { createStepper } from 'dr-js/module/common/time'
import { generateCheckCode } from 'dr-js/module/common/module/TimedLookup'

import { fetchLikeRequest } from 'dr-js/module/node/net'
import { createDirectory } from 'dr-js/module/node/file/File'

import { loadLookupFile } from 'source/configure/auth'
import { uploadFileByChunk } from 'source/feature/Explorer/task/fileChunkUpload'

// for node client file chunk upload

const DEFAULT_AUTH_KEY = 'auth-check-code'

const getAuthFetch = async (fileAuth, authKey) => {
  const timedLookupData = await loadLookupFile(fileAuth)
  return async (url, config) => {
    const response = await fetchLikeRequest(url, { ...config, headers: { ...config.headers, [ authKey ]: generateCheckCode(timedLookupData) } })
    if (!response.ok) throw new Error(`[Error][AuthFetch] status: ${response.status}`)
    return response
  }
}

const fileUpload = async ({
  fileInputPath,
  fileBuffer = readFileSync(fileInputPath),
  filePath,
  urlFileUpload,
  fileAuth,
  authKey = DEFAULT_AUTH_KEY,
  timeout = 30 * 1000,
  maxRetry = 3,
  wait = 1000,
  log = console.log
}) => {
  const stepper = createStepper()
  const authFetch = await getAuthFetch(fileAuth, authKey)

  log && log(`[Upload] file: ${filePath}, size: ${binary(fileBuffer.length)}B`)

  await uploadFileByChunk({
    fileBuffer,
    filePath,
    onProgress: (uploadedSize, totalSize) => log && log(`[Upload] upload: ${percent(uploadedSize / totalSize)} (+${time(stepper())})`),
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

  log && log(`[Upload] done: ${filePath} (+${time(stepper())})`)
}

const fileDownload = async ({
  fileOutputPath,
  filePath,
  urlFileDownload,
  fileAuth,
  authKey = DEFAULT_AUTH_KEY,
  timeout = 30 * 1000,
  log = console.log
}) => {
  const stepper = createStepper()
  const authFetch = await getAuthFetch(fileAuth, authKey)

  log && log(`[Download] file: ${filePath}`)

  const fileBuffer = await (await authFetch(`${urlFileDownload}/${encodeURIComponent(filePath)}`, { method: 'GET', timeout })).buffer()
  log && log(`[Download] get: ${binary(fileBuffer.length)}B (+${time(stepper())})`)

  if (fileOutputPath) {
    await createDirectory(dirname(fileOutputPath))
    writeFileSync(fileOutputPath, fileBuffer)
    log && log(`[Download] done: ${fileOutputPath} (+${time(stepper())})`)
  }

  return fileBuffer
}

const pathAction = async ({
  nameList = [ '' ],
  actionType,
  key: relativeFrom = '',
  keyTo: relativeTo,
  urlPathAction,
  fileAuth,
  authKey = DEFAULT_AUTH_KEY,
  timeout = 30 * 1000,
  log = console.log
}) => {
  const stepper = createStepper()
  const authFetch = await getAuthFetch(fileAuth, authKey)

  log && log(`[Action|${actionType}] key: ${relativeFrom}, keyTo: ${relativeTo}, nameList: [${nameList}]`)

  const result = await (await authFetch(urlPathAction, { method: 'POST', body: JSON.stringify({ nameList, actionType, relativeFrom, relativeTo }), timeout })).json()

  log && log(`[Action|${actionType}] done (+${time(stepper())})`)

  return result // should check errorList
}

export {
  fileUpload,
  fileDownload,
  pathAction
}
