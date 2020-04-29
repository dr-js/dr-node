import { resolve, basename } from 'path'
import { doThrowAsync } from '@dr-js/core/module/common/verify'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import {
  fromRoot, setupRoot, clearRoot,
  SOURCE_DIRECTORY, verifyOutputDirectory
} from './compress.test/function'

import {
  detect,
  compressConfig, extractConfig,
  compressTgzAsync, extractTgzAsync,
  compressAutoAsync, extractAutoAsync
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

  it('compressTgzAsync() & extractTgzAsync()', async () => {
    info('compressTgzAsync')
    await createDirectory(fromTemp('compressTgzAsync/'))
    await compressTgzAsync(SOURCE_DIRECTORY, fromTemp('compressTgzAsync/test.tgz'))
    info('extractTgzAsync')
    await extractTgzAsync(fromTemp('compressTgzAsync/test.tgz'), fromTemp('extractTgzAsync/test.tgz-extract/'))
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractTgzAsync/test.tgz-extract/'))
  })

  it('compressAutoAsync() & extractAutoAsync()', async () => {
    info('compressAutoAsync')
    await compressAutoAsync(SOURCE_DIRECTORY, fromTemp('compressAutoAsync/test.tar.gz'))
    await compressAutoAsync(SOURCE_DIRECTORY, fromTemp('compressAutoAsync/test.tgz'))
    await compressAutoAsync(SOURCE_DIRECTORY, fromTemp('compressAutoAsync/test.tar'))
    info('extractAutoAsync')
    await extractAutoAsync(fromTemp('compressAutoAsync/test.tar.gz'), fromTemp('extractAutoAsync/test.tar.gz-extract/'))
    await extractAutoAsync(fromTemp('compressAutoAsync/test.tgz'), fromTemp('extractAutoAsync/test.tgz-extract/'))
    await extractAutoAsync(fromTemp('compressAutoAsync/test.tar'), fromTemp('extractAutoAsync/test.tar-extract/'))
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractAutoAsync/test.tar.gz-extract/'))
    await verifyOutputDirectory(fromTemp('extractAutoAsync/test.tgz-extract/'))
    await verifyOutputDirectory(fromTemp('extractAutoAsync/test.tar-extract/'))

    await doThrowAsync(
      async () => extractTgzAsync(fromTemp('compressAutoAsync/test.tar'), fromTemp('extractAutoAsync/test.tar-extract-fail/')),
      'extractTgzAsync() should throw when not gzip'
    )
  })
})
