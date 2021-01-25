import { resolve, dirname } from 'path'
import { createGzip } from 'zlib'
import { createReadStream, createWriteStream, promises as fsAsync } from 'fs'
import { quickRunletFromStream } from '@dr-js/core/module/node/data/Stream'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/run'

import {
  check as check7z, verify as verify7z, compressArgs, extractArgs,
  detect as detect7z // TODO: DEPRECATE
} from './7z'
import {
  REGEXP_TGZ, REGEXP_NPM_TAR, check as checkNpmTar, verify as verifyNpmTar, compressAsync as compressNpmTarAsync, extractAsync as extractNpmTarAsync,
  detect as detectNpmTar // TODO: DEPRECATE
} from './npmTar'
import { REGEXP_FSP_TAR, compressAsync as compressFspTarAsync, extractAsync as extractFspTarAsync } from './fspTar'
import { withTempPath } from './function'

const REGEXP_T7Z = /\.t(?:ar\.)?7z$/
const REGEXP_TXZ = /\.t(?:ar\.)?xz$/
const REGEXP_AUTO = /\.(?:tar|tgz|tar\.gz|t7z|tar\.7z|txz|tar\.xz|7z|zip|fsp|fsp\.gz)$/ // common supported extension

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
    : REGEXP_FSP_TAR.test(outputFile) ? createDirectory(dirname(outputFile)).then(() => compressFspTarAsync(sourceDirectory, outputFile))
      : compress7zAsync(sourceDirectory, outputFile)

const extractAutoAsync = async (sourceFile, outputPath, pathTemp) => (REGEXP_T7Z.test(sourceFile) || REGEXP_TXZ.test(sourceFile)) ? extractT7zAsync(sourceFile, outputPath, pathTemp)
  : REGEXP_NPM_TAR.test(sourceFile) ? createDirectory(outputPath).then(() => extractNpmTarAsync(sourceFile, outputPath))
    : REGEXP_FSP_TAR.test(sourceFile) ? createDirectory(outputPath).then(() => extractFspTarAsync(sourceFile, outputPath))
      : extract7zAsync(sourceFile, outputPath)

// not all archive info may be preserved, especially when repack on win32
const repackAsync = async (fileFrom, fileTo, pathTemp) => withTempPath(pathTemp, __repackAsync, fileFrom, fileTo)
const __repackAsync = async (fileFrom, fileTo, pathTemp) => {
  await extractAutoAsync(fileFrom, pathTemp)
  await compressAutoAsync(pathTemp, fileTo)
}

// only for repack between `.tgz|.txz|.t7z` but keep the inner tar, safer but may be less compressed
const repackTarAsync = async (fileFrom, fileTo, pathTemp) => withTempPath(pathTemp, __repackTarAsync, fileFrom, fileTo)
const __repackTarAsync = async (fileFrom, fileTo, pathTemp) => {
  await extract7zAsync(fileFrom, pathTemp) // use 7z for 1 level unpack
  if (REGEXP_TGZ.test(fileTo)) { // use gzip
    const nameList = await fsAsync.readdir(pathTemp)
    const tarName = nameList.find((name) => name.endsWith('.tar'))
    if (!tarName) throw new Error(`expect tar in archive, get: ${nameList.join(', ')}`)
    await quickRunletFromStream(createReadStream(resolve(pathTemp, tarName)), createGzip(), createWriteStream(fileTo))
  } else await compress7zAsync(pathTemp, fileTo) // `.t7z|.tar.7z` should cause 7zip to use default 7z type
}

const detect = (checkOnly) => detect7z(checkOnly) && detectNpmTar(checkOnly) // TODO: DEPRECATED

export {
  REGEXP_T7Z, REGEXP_TXZ, REGEXP_AUTO, check, verify,
  compress7zAsync, extract7zAsync,
  compressT7zAsync, extractT7zAsync,
  compressAutoAsync, extractAutoAsync,
  repackAsync, repackTarAsync,

  detect // TODO: DEPRECATED
}
