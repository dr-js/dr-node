import { dirname } from 'path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import { detect as detectAuto, compressAutoAsync, extractAutoAsync } from 'source/module/Software/archive'
import { detect as detectNpmTar, compressAsync as compressNpmTarAsync, extractAsync as extractNpmTarAsync } from 'source/module/Software/npmTar'
import { detect as detectTar, compressConfig as compressConfigTar, extractConfig as extractConfigTar } from 'source/module/Software/tar'

const PATH_COMPRESS_TAR = 'path.compress-tar'
const PATH_EXTRACT_TAR = 'path.extract-tar'
const PATH_COMPRESS_AUTO = 'path.compress-auto'
const PATH_EXTRACT_AUTO = 'path.extract-auto'

const ACTION_TYPE = {
  PATH_COMPRESS_TAR,
  PATH_EXTRACT_TAR,
  PATH_COMPRESS_AUTO,
  PATH_EXTRACT_AUTO
}

const ACTION_CORE_MAP = ( // filled based on detect result
  detectAuto(true) && { // support `.7z|.zip|...`, and prefer `.tar` with npm/tar
    [ PATH_COMPRESS_TAR ]: async (sourceDirectory, outputFile) => { await compressAutoAsync(sourceDirectory, outputFile) },
    [ PATH_EXTRACT_TAR ]: async (sourceFile, outputPath) => { await extractAutoAsync(sourceFile, outputPath) },
    [ PATH_COMPRESS_AUTO ]: async (sourceDirectory, outputFile) => { await compressAutoAsync(sourceDirectory, outputFile) },
    [ PATH_EXTRACT_AUTO ]: async (sourceFile, outputPath) => { await extractAutoAsync(sourceFile, outputPath) }
  }
) || (
  detectNpmTar(true) && { // support `.tar|.tgz` with npm/tar
    [ PATH_COMPRESS_TAR ]: async (sourceDirectory, outputFile) => { await compressNpmTarAsync(sourceDirectory, outputFile) }, // sourceDirectory, outputFile
    [ PATH_EXTRACT_TAR ]: async (sourceFile, outputPath) => { await extractNpmTarAsync(sourceFile, outputPath) } // sourceFile, outputPath
  }
) || (
  detectTar(true) && { // support `.tar|.tgz` with tar
    [ PATH_COMPRESS_TAR ]: async (sourceDirectory, outputFile) => {
      await createDirectory(dirname(outputFile))
      await run(compressConfigTar(sourceDirectory, outputFile)).promise
    },
    [ PATH_EXTRACT_TAR ]: async (sourceFile, outputPath) => {
      await createDirectory(outputPath)
      await run(extractConfigTar(sourceFile, outputPath)).promise
    }
  }
) || {} // no support

// use `setupActionMap` from `./path.js`

export { ACTION_TYPE, ACTION_CORE_MAP }
