import { spawnSync } from 'child_process'
import { tmpdir } from 'os'
import { resolve } from 'path'
import { createReadStream, createWriteStream, promises as fsAsync } from 'fs'
import { constants, createGzip, createGunzip, createBrotliCompress, createBrotliDecompress } from 'zlib'
import { getRandomId } from '@dr-js/core/module/common/math/random'
import { quickRunletFromStream } from '@dr-js/core/module/node/data/Stream'
import { createDirectory, deleteDirectory } from '@dr-js/core/module/node/file/Directory'

const REGEXP_TGZ = /\.t(?:ar\.)?gz$/
const REGEXP_TBR = /\.t(?:ar\.)?br$/
const REGEXP_T7Z = /\.t(?:ar\.)?7z$/
const REGEXP_TXZ = /\.t(?:ar\.)?xz$/

// the `0x1f8b08` check for: containing a magic number (1f 8b), the compression method (08 for DEFLATE)
// https://en.wikipedia.org/wiki/Gzip
// https://github.com/kevva/is-gzip
// https://stackoverflow.com/questions/6059302/how-to-check-if-a-file-is-gzip-compressed
const isBufferGzip = (buffer) => (
  buffer && buffer.length > 3 &&
  buffer[ 0 ] === 0x1f &&
  buffer[ 1 ] === 0x8b &&
  buffer[ 2 ] === 0x08
)
const isFileGzip = async (file) => {
  const buffer = Buffer.allocUnsafe(3)
  await fsAsync.read(file, buffer, 0, 3, 0)
  return isBufferGzip(buffer)
}
const createGzipMax = () => createGzip({
  level: 9, windowBits: 15, memLevel: 9,
  chunkSize: 128 * 1024 // bigger chunk
})
const createBrotliCompressMax = () => createBrotliCompress({
  params: { [ constants.BROTLI_PARAM_QUALITY ]: 11 }, // TODO: NOTE: may be slow, or just use level 9? check: https://paulcalvano.com/2018-07-25-brotli-compression-how-much-will-it-reduce-your-content/
  chunkSize: 128 * 1024 // bigger chunk
})

const REGEXP_GZ = /\.t?gz$/
const REGEXP_BR = /\.t?br$/
const REGEXP_GZBR = /\.t?(?:gz|br)$/
const compressGzBrFileAsync = async (fileFrom, fileTo, isGzip = REGEXP_GZ.test(fileTo)) => quickRunletFromStream(
  createReadStream(fileFrom),
  isGzip ? createGzipMax() : createBrotliCompressMax(),
  createWriteStream(fileTo)
)
const extractGzBrFileAsync = async (fileFrom, fileTo, isGzip = REGEXP_GZ.test(fileFrom)) => quickRunletFromStream(
  createReadStream(fileFrom),
  isGzip ? createGunzip() : createBrotliDecompress(),
  createWriteStream(fileTo)
)

const spawnString = ([ command, ...argList ]) => String(spawnSync(command, argList).stdout || '')
const probeSync = (argList = [], expect) => spawnString(argList).includes(expect)

const createArgListPack = (
  getArgList, // () => [] || undefined // NOTE: return false to deny re-check
  message
) => {
  let args // undefined, or array like [ '7z' ] and [ 'sudo', 'docker' ]
  const check = () => {
    if (args === undefined) args = getArgList()
    return Boolean(args)
  }
  const verify = () => {
    if (args === undefined) args = getArgList()
    if (!args) throw new Error(message)
    return args // array
  }
  return {
    getArgs: () => args, // may get undefined
    setArgs: (...newArgs) => (args = newArgs), // allow change the preset one
    check,
    verify
  }
}

const withTempPath = async (
  pathTemp = resolve(tmpdir(), getRandomId('dr-node-')),
  asyncFunc,
  pathFrom, pathTo
) => {
  await createDirectory(pathTemp)
  await asyncFunc(resolve(pathFrom), resolve(pathTo), pathTemp)
  await deleteDirectory(pathTemp)
}

const createCommandWrap = (command) => ({ // TODO: DEPRECATE
  getCommand: () => command,
  setCommand: (newCommand) => (command = newCommand) // allow set full path command, or change the auto find one
})
const createDetect = (expect, message, getCommand, ...argList) => { // TODO: DEPRECATE
  let isDetected
  return (checkOnly) => {
    if (isDetected === undefined) isDetected = String(spawnSync(getCommand(), argList).stdout || '').includes(expect)
    if (checkOnly) return isDetected
    if (!isDetected) throw new Error(message)
  }
}

export {
  REGEXP_TGZ, REGEXP_TBR, REGEXP_T7Z, REGEXP_TXZ, // TODO: move related to `module/Archive/`
  isBufferGzip, isFileGzip, createGzipMax, createBrotliCompressMax, // TODO: move related to `module/Archive/`
  REGEXP_GZ, REGEXP_BR, REGEXP_GZBR, // TODO: move related to `module/Archive/`
  compressGzBrFileAsync, extractGzBrFileAsync, // TODO: move related to `module/Archive/`

  spawnString, probeSync,
  createArgListPack,
  withTempPath,

  createCommandWrap, createDetect // TODO: DEPRECATE
}
