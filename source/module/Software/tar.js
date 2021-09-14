import { resolve } from 'path'
import { createCommandWrap, createDetect } from './function'

const { getCommand, setCommand } = createCommandWrap('tar') // TODO: DEPRECATE
const detect = createDetect('tar', 'expect "tar" in PATH', getCommand, '--version') // TODO: DEPRECATE
const compressConfig = (sourceDirectory, outputFile) => ({ // TODO: DEPRECATE
  command: getCommand(),
  argList: [
    (outputFile.endsWith('gz') ? '-zcf' : '-cf'), resolve(outputFile),
    '-C', resolve(sourceDirectory),
    '.' // TODO: NOTE: the result tar will have a `./` as root folder, but this will get resolved and disappear after extract
  ]
})
const extractConfig = (sourceFile, outputPath) => ({ // TODO: DEPRECATE
  command: getCommand(),
  argList: [
    '-xf', resolve(sourceFile), // use '-xf' for both gzip/xz, check: https://unix.stackexchange.com/questions/253596/tar-extraction-also-automatically-decompresses
    '-C', resolve(outputPath)
  ]
})

export {
  getArgs, setArgs, check, verify,
  compressArgs, extractArgs
} from '@dr-js/core/module/node/module/Archive/tar.js'
export {
  getCommand, setCommand, detect, compressConfig, extractConfig // TODO: DEPRECATE
}
