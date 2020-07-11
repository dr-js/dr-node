import { resolve } from 'path'
import { createReadStream, createWriteStream } from 'fs'
import { createGzip, createGunzip } from 'zlib'
import { quickRunletFromStream } from '@dr-js/core/module/node/data/Stream'

import { initFsPack, saveFsPack, loadFsPack, appendFromPath, unpackToPath } from 'source/module/FsPack'
import { withTempPath } from './function'

const REGEXP_FSP_TAR = /\.(?:fsp|fsp\.gz)$/

const compressFspAsync = async (sourceDirectory, outputFile) => {
  const fsPack = await initFsPack({ packPath: outputFile, packRoot: sourceDirectory })
  await appendFromPath(fsPack, sourceDirectory)
  await saveFsPack(fsPack)
}
const extractFspAsync = async (sourceFile, outputPath) => {
  const fsPack = await loadFsPack({ packPath: sourceFile })
  await unpackToPath(fsPack, outputPath)
}

const compressFspGzAsync = async (sourceDirectory, outputFile, pathTemp) => withTempPath(pathTemp, __compressFspGzAsync, sourceDirectory, outputFile)
const __compressFspGzAsync = async (sourceDirectory, outputFile, pathTemp) => {
  await compressFspAsync(sourceDirectory, resolve(pathTemp, 'archive.fsp'))
  await quickRunletFromStream(createReadStream(resolve(pathTemp, 'archive.fsp')), createGzip(), createWriteStream(outputFile))
}
const extractFspGzAsync = async (sourceFile, outputPath, pathTemp) => withTempPath(pathTemp, __extractFspGzAsync, sourceFile, outputPath)
const __extractFspGzAsync = async (sourceFile, outputPath, pathTemp) => {
  await quickRunletFromStream(createReadStream(sourceFile), createGunzip(), createWriteStream(resolve(pathTemp, 'archive.fsp')))
  await extractFspAsync(resolve(pathTemp, 'archive.fsp'), outputPath)
}

// for `.fsp|.fsp.gz`
const compressAsync = async (sourceDirectory, outputFile, pathTemp) => (outputFile.endsWith('.gz') ? compressFspGzAsync : compressFspAsync)(sourceDirectory, outputFile, pathTemp)
const extractAsync = async (sourceFile, outputPath, pathTemp) => (sourceFile.endsWith('.gz') ? extractFspGzAsync : extractFspAsync)(sourceFile, outputPath, pathTemp)

export {
  REGEXP_FSP_TAR,
  compressFspAsync, extractFspAsync,
  compressFspGzAsync, extractFspGzAsync,
  compressAsync, extractAsync // NOTE: will not auto create output path
}
