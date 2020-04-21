import { resolve } from 'path'

import { createCommandWrap, createDetect } from './function'

const { getCommand, setCommand } = createCommandWrap('tar')

// $ tar --version
//   tar (GNU tar) 1.28
const detect = createDetect(
  'tar',
  'expect "tar" in PATH',
  getCommand, '--version'
)

const compressConfig = (sourceDirectory, outputFile) => ({
  command: getCommand(),
  argList: [
    '-zcf', resolve(outputFile), // should ends with `.tgz`
    '-C', resolve(sourceDirectory),
    '.'
  ]
})

const extractConfig = (sourceFile, outputPath) => ({
  command: getCommand(),
  argList: [
    '--strip-components', '1',
    '-xf', sourceFile, // use '-xf' for both gzip/xz, check: https://unix.stackexchange.com/questions/253596/tar-extraction-also-automatically-decompresses
    '-C', outputPath
  ]
})

export {
  getCommand, setCommand, detect,

  compressConfig,
  extractConfig
}
