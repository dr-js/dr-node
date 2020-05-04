import { dirname } from 'path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import { detect as detectAuto, compressAutoAsync, extractAutoAsync } from 'source/module/Software/archive'
import { detect as detectNpmTar, compressAsync, extractAsync } from 'source/module/Software/npmTar'
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
  ...(
    (detectNpmTar(true) && { // support `.tar|.tgz` with npm/tar
      [ EXTRA_COMPRESS_TAR ]: compressAsync,
      [ EXTRA_EXTRACT_TAR ]: extractAsync
    }) || (detectTar(true) && { // support `.tar|.tgz` with tar
      [ EXTRA_COMPRESS_TAR ]: async (sourceDirectory, outputFile) => {
        await createDirectory(dirname(outputFile))
        return run(compressConfigTar(sourceDirectory, outputFile)).promise
      },
      [ EXTRA_EXTRACT_TAR ]: async (sourceFile, outputPath) => {
        await createDirectory(outputPath)
        return run(extractConfigTar(sourceFile, outputPath)).promise
      }
    })
  ),
  ...(detectAuto(true) && { // support `.7z|.zip|...`, and prefer `.tar` with 7zip
    [ EXTRA_COMPRESS_7Z ]: compressAutoAsync,
    [ EXTRA_EXTRACT_7Z ]: extractAutoAsync,
    [ EXTRA_COMPRESS_TAR ]: compressAutoAsync,
    [ EXTRA_EXTRACT_TAR ]: extractAutoAsync
  })
}

export {
  PATH_ACTION_TYPE,
  PATH_ACTION_MAP
}
