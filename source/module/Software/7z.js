import { resolve } from 'path'

import { createDetect } from './function'

// NOTE: require 7z@>=16.00 for `-bs` switch
// $ 7z
//   7-Zip 18.06 (x64) : Copyright (c) 1999-2018 Igor Pavlov : 2018-12-30

const command = '7z'

const detect = createDetect( // test for: `-bs{o|e|p}{0|1|2} : set output stream for output/error/progress line`
  '-bs{o|e|p}{0|1|2}',
  'expect "7z" in PATH with "-bs{o|e|p}{0|1|2}" support',
  command
)

const compressConfig = (sourceDirectory, outputFile) => ({
  command,
  argList: [
    'a', resolve(outputFile), // can ends with `.7z` or `.zip`
    resolve(sourceDirectory, '*'),
    '-bso0', '-bsp0' // mute extra output
  ]
})

const compressFileConfig = (sourceFile, outputFile) => ({
  command,
  argList: [
    'a', resolve(outputFile), // can ends with `.7z` or `.zip`
    resolve(sourceFile),
    '-bso0', '-bsp0' // mute extra output
  ]
})

const extractConfig = (sourceFile, outputPath) => ({
  command,
  argList: [
    'x', resolve(sourceFile),
    `-o${resolve(outputPath)}`,
    '-y', // for overwrite existing
    '-bso0', '-bsp0' // mute extra output
  ]
})

export {
  detect,

  compressConfig, compressFileConfig,
  extractConfig
}
