import { resolve } from 'path'
import { createCommandWrap, createDetect } from './function'

// NOTE: require 7z@>=16.00 for `-bs` switch
// TODO: NOTE:
//   p7zip seems to stop update at 2016 (p7zip Version 16.02)
//   using p7zip pack/unpack to `.tar` do not preserve file permission, but with `.7z|.zip` do, check: https://sourceforge.net/p/p7zip/discussion/383044/thread/d9d522d2/

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
// const runCompressStream = async (sourceDirectory, type = '7z') => run({ // subProcess.stdout will be readableStream
//   command: getCommand(),
//   argList: [
//     'a', 'placeholder-name',
//     resolve(sourceDirectory, '*'),
//     `-t${type}`, '-so' // mark archive type and output to stdout
//   ],
//   option: { stdio: [ 'ignore', 'pipe', 'ignore' ] }
// })
// const runExtractStream = async (outputPath, type = '7z') => run({ // subProcess.stdin writableStream
//   command: getCommand(),
//   argList: [
//     'x',
//     `-o${resolve(outputPath)}`,
//     '-aoa', // for overwrite existing
//     `-t${type}`, '-si' // mark archive type and input from stdin
//   ],
//   option: { stdio: [ 'pipe', 'ignore', 'ignore' ] }
// })

export {
  getCommand, setCommand, detect,
  compressConfig, extractConfig
}
