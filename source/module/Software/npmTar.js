import { resolve } from 'path'
import { createReadStream, createWriteStream, promises as fsAsync } from 'fs'
import { tryRequire } from '@dr-js/core/module/env/tryRequire'
import { setupStreamPipe, waitStreamStopAsync } from '@dr-js/core/module/node/data/Stream'
import { fromNpmNodeModules } from './npm'

const REGEXP_TGZ = /\.t(?:ar\.)?gz$/

let cacheNpmTar
const getNpmTar = () => {
  if (cacheNpmTar === undefined) cacheNpmTar = tryRequire(fromNpmNodeModules('tar')) || null // https://npm.im/tar
  return cacheNpmTar
}

const detect = (checkOnly) => {
  const isDetected = Boolean(getNpmTar())
  if (checkOnly) return isDetected
  if (!isDetected) throw new Error('expect "npm" in PATH')
}

// TODO: NOTE: there'll be an empty `.` folder in the output tar for the default nameList, but will disappear after extract, replacing the file list to the output of readdirSync may solve this
const createCompressStream = (sourceDirectory, option = { gzip: true }, nameList = [ './' ]) => {
  sourceDirectory = resolve(sourceDirectory)
  return getNpmTar().create({ cwd: sourceDirectory, ...option }, nameList)
}
const createExtractStream = (outputPath, option) => {
  outputPath = resolve(outputPath)
  return getNpmTar().extract({ cwd: outputPath, ...option })
}

// for `.tar|.tgz|.tar.gz`
const compressAsync = async (sourceDirectory, outputFile) => waitStreamStopAsync(setupStreamPipe(
  createCompressStream(sourceDirectory, { gzip: REGEXP_TGZ.test(outputFile) }, await fsAsync.readdir(sourceDirectory)),
  createWriteStream(resolve(outputFile))
))
const extractAsync = async (sourceFile, outputPath) => waitStreamStopAsync(setupStreamPipe(
  createReadStream(resolve(sourceFile)),
  createExtractStream(outputPath)
))

export {
  REGEXP_TGZ, getNpmTar, detect,
  createCompressStream, createExtractStream,
  compressAsync, extractAsync // NOTE: will not auto create output path
}
