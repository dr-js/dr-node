import { resolve, dirname } from 'path'
import { createGzip, createGunzip } from 'zlib'
import { setupStreamPipe, waitStreamStopAsync } from '@dr-js/core/module/node/data/Stream'
import { createReadStream, createWriteStream } from '@dr-js/core/module/node/file/function'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import { createCommandWrap, createDetect } from './function'

// NOTE: require 7z@>=16.00 for `-bs` switch

const { getCommand, setCommand } = createCommandWrap('7z')

// $ 7z
//   7-Zip 18.06 (x64) : Copyright (c) 1999-2018 Igor Pavlov : 2018-12-30
const detect = createDetect( // test for: `-bs{o|e|p}{0|1|2} : set output stream for output/error/progress line`
  '-bs{o|e|p}{0|1|2}',
  'expect "7z" in PATH with "-bs{o|e|p}{0|1|2}" support',
  getCommand
)

const compressConfig = (sourceDirectory, outputFile) => ({
  command: getCommand(),
  argList: [
    'a', resolve(outputFile), // can ends with `.7z|.zip|.tar|.gz|...`
    resolve(sourceDirectory, '*'),
    '-bso0', '-bsp0' // mute extra output
  ]
})

const extractConfig = (sourceFile, outputPath) => ({
  command: getCommand(),
  argList: [
    'x', resolve(sourceFile),
    `-o${resolve(outputPath)}`,
    '-aoa', // for overwrite existing
    '-bso0', '-bsp0' // mute extra output
  ]
})

// require manual setup piping: https://stackoverflow.com/questions/1359793/programmatically-extract-tar-gz-in-a-single-step-on-windows-with-7-zip/14699663#14699663
const compressTgzAsync = async (sourceDirectory, outputFile) => { // for `.tgz` or `.tar.gz`
  const outputStream = createWriteStream(resolve(outputFile))
  const { promise, subProcess } = run({
    command: getCommand(),
    argList: [
      'a', 'placeholder-name',
      resolve(sourceDirectory, '*'),
      '-ttar', '-so' // mark archive type and output to stdout
    ],
    option: { stdio: [ 'ignore', 'pipe', 'ignore' ] }
  })
  await Promise.all([
    waitStreamStopAsync(setupStreamPipe(subProcess.stdout, createGzip(), outputStream)),
    promise
  ]).catch((error) => {
    subProcess.kill()
    outputStream.destroy()
    throw error
  })
}

const extractTgzAsync = async (sourceFile, outputPath) => { // for `.tgz` or `.tar.gz`
  const inputStream = createReadStream(resolve(sourceFile))
  const { promise, subProcess } = run({
    command: getCommand(),
    argList: [
      'x',
      `-o${resolve(outputPath)}`,
      '-aoa', // for overwrite existing
      '-ttar', '-si' // mark archive type and input from stdin
    ],
    option: { stdio: [ 'pipe', 'ignore', 'ignore' ] }
  })
  await Promise.all([
    waitStreamStopAsync(setupStreamPipe(inputStream, createGunzip(), subProcess.stdin)),
    promise
  ]).catch((error) => {
    subProcess.kill()
    inputStream.destroy()
    throw error
  })
}

const compressAutoAsync = async (sourceDirectory, outputFile) => (outputFile.endsWith('.tgz') || outputFile.endsWith('.tar.gz'))
  ? createDirectory(dirname(outputFile)).then(() => compressTgzAsync(sourceDirectory, outputFile))
  : run(compressConfig(sourceDirectory, outputFile)).promise

const extractAutoAsync = async (sourceFile, outputPath) => (sourceFile.endsWith('.tgz') || sourceFile.endsWith('.tar.gz'))
  ? extractTgzAsync(sourceFile, outputPath)
  : run(extractConfig(sourceFile, outputPath)).promise

export {
  getCommand, setCommand, detect,
  compressConfig, extractConfig,
  compressTgzAsync, extractTgzAsync,
  compressAutoAsync, extractAutoAsync
}
