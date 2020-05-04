import { tmpdir } from 'os'
import { resolve, dirname } from 'path'
import { createGzip } from 'zlib'
import { createReadStream, createWriteStream, promises as fsAsync } from 'fs'
import { getRandomId } from '@dr-js/core/module/common/math/random'
import { setupStreamPipe, waitStreamStopAsync } from '@dr-js/core/module/node/data/Stream'
import { createDirectory, deleteDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import { detect as detect7z, compressConfig, extractConfig } from './7z'
import { REGEXP_TGZ, detect as detectNpmTar, compressAsync as compressNpmTarAsync, extractAsync as extractNpmTarAsync } from './npmTar'

const REGEXP_T7Z = /\.t(?:ar\.)?7z$/
const REGEXP_NPM_TAR = /\.(?:tar|tgz|tar\.gz)$/

const withTempPath = async (
  pathTemp = resolve(tmpdir(), getRandomId()),
  asyncFunc,
  pathFrom, pathTo
) => {
  await createDirectory(pathTemp)
  await asyncFunc(resolve(pathFrom), resolve(pathTo), pathTemp)
  await deleteDirectory(pathTemp)
}

const detect = (checkOnly) => detect7z(checkOnly) && detectNpmTar(checkOnly)

const compress7zAsync = async (sourceDirectory, outputFile) => run(compressConfig(sourceDirectory, outputFile)).promise
const extract7zAsync = async (sourceFile, outputPath) => run(extractConfig(sourceFile, outputPath)).promise

// for `.tar.7z|.t7z`, same idea: https://sourceforge.net/p/sevenzip/discussion/45797/thread/482a529a/
const compressT7zAsync = async (sourceDirectory, outputFile, pathTemp) => withTempPath(pathTemp, __compressT7zAsync, sourceDirectory, outputFile)
const __compressT7zAsync = async (sourceDirectory, outputFile, pathTemp) => {
  await compressNpmTarAsync(sourceDirectory, resolve(pathTemp, 'archive.tar'))
  await compress7zAsync(pathTemp, outputFile)
}
const extractT7zAsync = async (sourceFile, outputPath, pathTemp) => withTempPath(pathTemp, __extractT7zAsync, sourceFile, outputPath)
const __extractT7zAsync = async (sourceFile, outputPath, pathTemp) => {
  await extract7zAsync(sourceFile, pathTemp)
  const nameList = await fsAsync.readdir(pathTemp)
  const tarName = nameList.find((name) => name.endsWith('.tar'))
  if (!tarName) throw new Error(`expect tar in archive, get: ${nameList.join(', ')}`)
  await createDirectory(outputPath)
  await extractNpmTarAsync(resolve(pathTemp, tarName), outputPath)
}

const compressAutoAsync = async (sourceDirectory, outputFile, pathTemp) => REGEXP_T7Z.test(outputFile) ? compressT7zAsync(sourceDirectory, outputFile, pathTemp)
  : REGEXP_NPM_TAR.test(outputFile) ? createDirectory(dirname(outputFile)).then(() => compressNpmTarAsync(sourceDirectory, outputFile))
    : compress7zAsync(sourceDirectory, outputFile)

const extractAutoAsync = async (sourceFile, outputPath, pathTemp) => REGEXP_T7Z.test(sourceFile) ? extractT7zAsync(sourceFile, outputPath, pathTemp)
  : REGEXP_NPM_TAR.test(sourceFile) ? createDirectory(outputPath).then(() => extractNpmTarAsync(sourceFile, outputPath))
    : extract7zAsync(sourceFile, outputPath)

// not all archive info may be preserved, especially when repack on win32
const repackAsync = async (fileFrom, fileTo, pathTemp) => withTempPath(pathTemp, __repackAsync, fileFrom, fileTo)
const __repackAsync = async (fileFrom, fileTo, pathTemp) => {
  await extractAutoAsync(fileFrom, pathTemp)
  await compressAutoAsync(pathTemp, fileTo)
}

// only for repack between `.tgz` <==> `.t7z` but keep the tar, safer but may be less compressed
const repackTarAsync = async (fileFrom, fileTo, pathTemp) => withTempPath(pathTemp, __repackTarAsync, fileFrom, fileTo)
const __repackTarAsync = async (fileFrom, fileTo, pathTemp) => {
  await extract7zAsync(fileFrom, pathTemp) // use 7z for 1 level unpack
  if (REGEXP_TGZ.test(fileTo)) { // use gzip
    const nameList = await fsAsync.readdir(pathTemp)
    const tarName = nameList.find((name) => name.endsWith('.tar'))
    if (!tarName) throw new Error(`expect tar in archive, get: ${nameList.join(', ')}`)
    await waitStreamStopAsync(setupStreamPipe(createReadStream(resolve(pathTemp, tarName)), createGzip(), createWriteStream(fileTo)))
  } else await compress7zAsync(pathTemp, fileTo) // `.t7z|.tar.7z` should cause 7zip to use default 7z type
}

export {
  detect,
  compress7zAsync, extract7zAsync,
  compressT7zAsync, extractT7zAsync,
  compressAutoAsync, extractAutoAsync,
  repackAsync, repackTarAsync
}
