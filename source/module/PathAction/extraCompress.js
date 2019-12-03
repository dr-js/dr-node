import { dirname } from 'path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import { detect as detect7z, compressConfig as compressConfig7z, extractConfig as extractConfig7z } from 'source/module/Software/7z'
import { detect as detectTar, compressConfig as compressConfigTar, extractConfig as extractConfigTar } from 'source/module/Software/tar'

const EXTRA_COMPRESS_7Z = 'extra:compress:7z'
const EXTRA_EXTRACT_7Z = 'extra:extract:7z'
const EXTRA_COMPRESS_TAR = 'extra:compress:tar'
const EXTRA_EXTRACT_TAR = 'extra:extract:tar'

const PATH_ACTION_TYPE = {
  EXTRA_COMPRESS_7Z,
  EXTRA_EXTRACT_7Z,
  EXTRA_COMPRESS_TAR,
  EXTRA_EXTRACT_TAR
}
const PATH_ACTION_MAP = {} // filled after detect

detect7z(true) && Object.assign(PATH_ACTION_MAP, {
  [ EXTRA_COMPRESS_7Z ]: async (sourceDirectory, outputFile) => {
    await createDirectory(dirname(outputFile))
    return run(compressConfig7z(sourceDirectory, outputFile)).promise
  },
  [ EXTRA_EXTRACT_7Z ]: async (sourceFile, outputPath) => {
    __DEV__ && console.log({
      sourceFile,
      outputPath
    })
    await createDirectory(outputPath)
    return run(extractConfig7z(sourceFile, outputPath)).promise
  }
})

detectTar(true) && Object.assign(PATH_ACTION_MAP, {
  [ EXTRA_COMPRESS_TAR ]: async (sourceDirectory, outputFile) => {
    await createDirectory(dirname(outputFile))
    return run(compressConfigTar(sourceDirectory, outputFile)).promise
  },
  [ EXTRA_EXTRACT_TAR ]: async (sourceFile, outputPath) => {
    await createDirectory(outputPath)
    return run(extractConfigTar(sourceFile, outputPath)).promise
  }
})

export {
  PATH_ACTION_TYPE,
  PATH_ACTION_MAP
}
