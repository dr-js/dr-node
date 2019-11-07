import { resolve } from 'path'

import { createDetect } from './function'

const command = 'tar'

// $ tar --version
//   tar (GNU tar) 1.28
const detect = createDetect(
  'tar',
  'expect "tar" in PATH',
  command, '--version'
)

const compressConfig = (sourceDirectory, outputFile) => ({
  command,
  argList: [
    '-zcf', resolve(outputFile), // should ends with `.tgz`
    '-C', resolve(sourceDirectory),
    '.'
  ]
})

const extractConfig = (sourceFile, outputPath) => ({
  command,
  argList: [
    '--strip-components', '1',
    '-xf', sourceFile, // use '-xf' for both gzip/xz
    '-C', outputPath
  ]
})

export {
  detect,

  compressConfig,
  extractConfig
}
