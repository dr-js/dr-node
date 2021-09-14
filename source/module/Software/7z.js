import { resolve } from 'path'
import { createCommandWrap, createDetect } from './function'

const { getCommand, setCommand } = createCommandWrap('7z') // TODO: DEPRECATE
const detect = createDetect('-bs{o|e|p}{0|1|2}', 'expect "7z" in PATH with "-bs{o|e|p}{0|1|2}" support', getCommand) // TODO: DEPRECATE
const compressConfig = (sourceDirectory, outputFile) => ({ // TODO: DEPRECATE
  command: getCommand(),
  argList: [
    'a', resolve(outputFile), // can ends with `.7z|.zip|.tar|.gz|...`
    resolve(sourceDirectory, '*'),
    '-bso0', '-bsp0' // mute extra output
  ]
})
const extractConfig = (sourceFile, outputPath) => ({ // TODO: DEPRECATE
  command: getCommand(),
  argList: [
    'x', resolve(sourceFile),
    `-o${resolve(outputPath)}`,
    '-aoa', // for overwrite existing
    '-bso0', '-bsp0' // mute extra output
  ]
})

export {
  getArgs, setArgs, check, verify,
  compressArgs, extractArgs
} from '@dr-js/core/module/node/module/Archive/7z.js'
export {
  getCommand, setCommand, detect, compressConfig, extractConfig // TODO: DEPRECATE
}
