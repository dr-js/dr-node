import { resolve, basename } from 'path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import {
  fromRoot, setupRoot, clearRoot,
  SOURCE_FILE, SOURCE_DIRECTORY,
  verifyOutputFile, verifyOutputDirectory
} from './compress.test/function'

import {
  detect,

  compressConfig, compressFileConfig,
  extractConfig,

  compressTgzAsync, extractTgzAsync
} from './7z'

const { describe, it, before, after, info = console.log } = global

const TEST_TEMP = fromRoot(`test-${basename(__filename)}`)
const fromTemp = (...args) => resolve(TEST_TEMP, ...args)

before('prepare', setupRoot)
after('clear', clearRoot)

describe('Node.Module.Software.7z', () => {
  it('detect()', detect)

  it('compressConfig() & extractConfig()', async () => {
    info('compressConfig')
    await Promise.all([
      run(compressConfig(SOURCE_DIRECTORY, fromTemp('compressConfig/test.7z'))).promise,
      run(compressConfig(SOURCE_DIRECTORY, fromTemp('compressConfig/test.zip'))).promise
    ])
    info('extractConfig')
    await Promise.all([
      run(extractConfig(fromTemp('compressConfig/test.7z'), fromTemp('extractConfig/test.7z-extract/'))).promise,
      run(extractConfig(fromTemp('compressConfig/test.zip'), fromTemp('extractConfig/test.zip-extract/'))).promise
    ])
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractConfig/test.7z-extract/'))
    await verifyOutputDirectory(fromTemp('extractConfig/test.zip-extract/'))
  })

  it('compressFileConfig()', async () => {
    info('compressFileConfig')
    await Promise.all([
      run(compressFileConfig(SOURCE_FILE, fromTemp('compressFileConfig/test-file.7z'))).promise,
      run(compressFileConfig(SOURCE_FILE, fromTemp('compressFileConfig/test-file.zip'))).promise
    ])
    info('extractConfig')
    await Promise.all([
      run(extractConfig(fromTemp('compressFileConfig/test-file.7z'), fromTemp('extractConfig/test-file.7z-extract'))).promise,
      run(extractConfig(fromTemp('compressFileConfig/test-file.zip'), fromTemp('extractConfig/test-file.zip-extract'))).promise
    ])
    info('verifyOutputFile')
    await verifyOutputFile(fromTemp('extractConfig/test-file.7z-extract', basename(SOURCE_FILE)))
    await verifyOutputFile(fromTemp('extractConfig/test-file.zip-extract', basename(SOURCE_FILE)))
  })

  it('compressTgzAsync() & extractTgzAsync()', async () => {
    info('compressTgzAsync')
    await createDirectory(fromTemp('compressTgzAsync/'))
    await compressTgzAsync(SOURCE_DIRECTORY, fromTemp('compressTgzAsync/test.tgz'))
    info('extractTgzAsync')
    await extractTgzAsync(fromTemp('compressTgzAsync/test.tgz'), fromTemp('extractTgzAsync/test.tgz-extract/'))
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractTgzAsync/test.tgz-extract/'))
  })
})
