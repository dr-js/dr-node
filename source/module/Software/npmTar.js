import { resolve } from 'path'
import { createReadStream, createWriteStream, promises as fsAsync } from 'fs'
import { tryRequire } from '@dr-js/core/module/env/tryRequire'
import { setupStreamPipe, waitStreamStopAsync } from '@dr-js/core/module/node/data/Stream'
import { fromNpmNodeModules } from './npm'

const REGEXP_TGZ = /\.t(?:ar\.)?gz$/
const REGEXP_NPM_TAR = /\.(?:tar|tgz|tar\.gz)$/

let cacheNpmTar
const getNpmTar = () => {
  if (cacheNpmTar === undefined) cacheNpmTar = tryRequire(fromNpmNodeModules('tar')) || null // https://npm.im/tar
  return cacheNpmTar
}

const detect = (checkOnly) => {
  const isDetected = Boolean(getNpmTar())
  if (checkOnly) return isDetected
  if (!isDetected) throw new Error('expect "npm/node_modules/tar"')
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

const REGEXP_PACKAGE_JSON = /^[^/]+\/package\.json$/
const extractPackageJson = async (sourceFile) => { // https://github.com/npm/node-tar/issues/181#issuecomment-492756116
  const chunkList = []
  await getNpmTar().list({
    file: sourceFile,
    onentry: (entry) => { REGEXP_PACKAGE_JSON.test(entry.path) && entry.on('data', (chunk) => chunkList.push(chunk)) }
  })
  if (!chunkList.length) throw new Error(`expect "${REGEXP_PACKAGE_JSON}" in ".tgz"`)
  return JSON.parse(String(Buffer.concat(chunkList)))
}

export {
  REGEXP_TGZ, REGEXP_NPM_TAR, getNpmTar, detect,
  createCompressStream, createExtractStream,
  compressAsync, extractAsync, // NOTE: will not auto create output path
  extractPackageJson
}
