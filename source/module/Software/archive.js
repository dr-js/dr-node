import { resolve, dirname } from 'path'
import { promises as fsAsync } from 'fs'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/run'

import {
  check as check7z, verify as verify7z, compressArgs, extractArgs,
  detect as detect7z // TODO: DEPRECATE
} from './7z'
import {
  REGEXP_NPM_TAR, check as checkNpmTar, verify as verifyNpmTar, compressAsync as compressNpmTarAsync, extractAsync as extractNpmTarAsync,
  detect as detectNpmTar // TODO: DEPRECATE
} from './npmTar'
import { REGEXP_FSP, compressAsync as compressFspAsync, extractAsync as extractFspAsync } from './fsp'
import { REGEXP_TGZ, REGEXP_TBR, REGEXP_T7Z, REGEXP_TXZ, compressGzBrFileAsync, extractGzBrFileAsync, withTempPath } from './function'

const REGEXP_AUTO = /\.(?:tar|tgz|tar\.gz|tbr|tar\.br|t7z|tar\.7z|txz|tar\.xz|7z|zip|fsp|fsp\.gz|fsp\.br)$/ // common supported extension

const check = () => Boolean(check7z() && checkNpmTar())
const verify = () => verify7z() && verifyNpmTar() && true

const compress7zAsync = async (sourceDirectory, outputFile) => run(compressArgs(sourceDirectory, outputFile)).promise
const extract7zAsync = async (sourceFile, outputPath) => run(extractArgs(sourceFile, outputPath)).promise

// for `.tar.xz|.txz|.tar.7z|.t7z` with 7z, same idea: https://sourceforge.net/p/sevenzip/discussion/45797/thread/482a529a/
// NOTE: for small files, `.txz` is smaller than `.t7z`, though repack to `.7z` is normally the smallest
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

const compressAutoAsync = async (sourceDirectory, outputFile, pathTemp) => (REGEXP_T7Z.test(outputFile) || REGEXP_TXZ.test(outputFile)) ? compressT7zAsync(sourceDirectory, outputFile, pathTemp)
  : REGEXP_NPM_TAR.test(outputFile) ? createDirectory(dirname(outputFile)).then(() => compressNpmTarAsync(sourceDirectory, outputFile))
    : REGEXP_FSP.test(outputFile) ? createDirectory(dirname(outputFile)).then(() => compressFspAsync(sourceDirectory, outputFile))
      : compress7zAsync(sourceDirectory, outputFile)

const extractAutoAsync = async (sourceFile, outputPath, pathTemp) => (REGEXP_T7Z.test(sourceFile) || REGEXP_TXZ.test(sourceFile)) ? extractT7zAsync(sourceFile, outputPath, pathTemp)
  : REGEXP_NPM_TAR.test(sourceFile) ? createDirectory(outputPath).then(() => extractNpmTarAsync(sourceFile, outputPath))
    : REGEXP_FSP.test(sourceFile) ? createDirectory(outputPath).then(() => extractFspAsync(sourceFile, outputPath))
      : extract7zAsync(sourceFile, outputPath)

// not all archive info may be preserved, especially when repack on win32
const repackAsync = async (fileFrom, fileTo, pathTemp) => withTempPath(pathTemp, __repackAsync, fileFrom, fileTo)
const __repackAsync = async (fileFrom, fileTo, pathTemp) => {
  await extractAutoAsync(fileFrom, pathTemp)
  await compressAutoAsync(pathTemp, fileTo)
}

// only for repack between `.tgz|.tbr|.txz|.t7z` but keep the inner tar, safer but may be less compressed than just .7z or .xz
const repackTarAsync = async (fileFrom, fileTo, pathTemp) => withTempPath(pathTemp, __repackTarAsync, fileFrom, fileTo)
const __repackTarAsync = async (fileFrom, fileTo, pathTemp) => {
  if (REGEXP_TGZ.test(fileFrom) || REGEXP_TBR.test(fileFrom)) await extractGzBrFileAsync(fileFrom, resolve(pathTemp, 'file.tar'))
  else await extract7zAsync(fileFrom, pathTemp)
  if (REGEXP_TGZ.test(fileTo) || REGEXP_TBR.test(fileTo)) {
    const nameList = await fsAsync.readdir(pathTemp)
    const tarName = nameList.find((name) => name.endsWith('.tar'))
    if (!tarName) throw new Error(`expect tar in archive, get: ${nameList.join(', ')}`)
    await compressGzBrFileAsync(resolve(pathTemp, tarName), fileTo)
  } else await compress7zAsync(pathTemp, fileTo) // `.t7z|.tar.7z` should cause 7zip to use default 7z type
}

const detect = (checkOnly) => detect7z(checkOnly) && detectNpmTar(checkOnly) // TODO: DEPRECATED

export { // TODO: move related to `module/Archive/`
  REGEXP_AUTO, check, verify,
  compress7zAsync, extract7zAsync,
  compressT7zAsync, extractT7zAsync,
  compressAutoAsync, extractAutoAsync,
  repackAsync, repackTarAsync,

  REGEXP_TGZ, REGEXP_TBR, REGEXP_T7Z, REGEXP_TXZ, detect // TODO: DEPRECATED
}
