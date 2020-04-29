import { dirname } from 'path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import { detect as detect7z, compressConfig as compressConfig7z, extractConfig as extractConfig7z, compressAutoAsync, extractAutoAsync } from 'source/module/Software/7z'
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

const PATH_ACTION_MAP = { // filled based on detect result
  ...(detectTar(true) && { // support `.tar`
    [ EXTRA_COMPRESS_TAR ]: async (sourceDirectory, outputFile) => {
      await createDirectory(dirname(outputFile))
      return run(compressConfigTar(sourceDirectory, outputFile)).promise
    },
    [ EXTRA_EXTRACT_TAR ]: async (sourceFile, outputPath) => {
      await createDirectory(outputPath)
      return run(extractConfigTar(sourceFile, outputPath)).promise
    }
  }),
  ...(detect7z(true) && { // support `.7z|.zip|...`, and prefer `.tar` with 7zip
    [ EXTRA_COMPRESS_7Z ]: async (sourceDirectory, outputFile) => run(compressConfig7z(sourceDirectory, outputFile)).promise,
    [ EXTRA_EXTRACT_7Z ]: async (sourceFile, outputPath) => run(extractConfig7z(sourceFile, outputPath)).promise,
    [ EXTRA_COMPRESS_TAR ]: async (sourceDirectory, outputFile) => {
      await createDirectory(dirname(outputFile))
      return compressAutoAsync(sourceDirectory, outputFile)
    },
    [ EXTRA_EXTRACT_TAR ]: async (sourceFile, outputPath) => {
      await createDirectory(outputPath)
      return extractAutoAsync(sourceFile, outputPath)
    }
  })
}

export {
  PATH_ACTION_TYPE,
  PATH_ACTION_MAP
}
