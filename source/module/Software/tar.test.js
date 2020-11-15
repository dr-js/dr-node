import { resolve, basename } from 'path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/system/Run'

import {
  fromRoot, setupRoot, clearRoot,
  SOURCE_DIRECTORY,
  verifyOutputDirectory
} from './archive.test/function'

import {
  detect,
  compressConfig, extractConfig
} from './tar'

const { describe, it, before, after, info = console.log } = global

const TEST_TEMP = fromRoot(`test-${basename(__filename)}`)
const fromTemp = (...args) => resolve(TEST_TEMP, ...args)

before(setupRoot)
after(clearRoot)

describe('Node.Module.Software.tar', () => {
  it('detect()', detect)

  it('compressConfig() & extractConfig()', async () => {
    info('compressConfig')
    await createDirectory(fromTemp('compressConfig/'))
    await run(compressConfig(SOURCE_DIRECTORY, fromTemp('compressConfig/test.tar'))).promise
    await run(compressConfig(SOURCE_DIRECTORY, fromTemp('compressConfig/test.tgz'))).promise
    await run(compressConfig(SOURCE_DIRECTORY, fromTemp('compressConfig/test.tar.gz'))).promise
    info('extractConfig')
    await createDirectory(fromTemp('extractConfig/test.tar-extract/'))
    await createDirectory(fromTemp('extractConfig/test.tgz-extract/'))
    await createDirectory(fromTemp('extractConfig/test.tar.gz-extract/'))
    await run(extractConfig(fromTemp('compressConfig/test.tar'), fromTemp('extractConfig/test.tar-extract/'))).promise
    await run(extractConfig(fromTemp('compressConfig/test.tgz'), fromTemp('extractConfig/test.tgz-extract/'))).promise
    await run(extractConfig(fromTemp('compressConfig/test.tar.gz'), fromTemp('extractConfig/test.tar.gz-extract/'))).promise
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractConfig/test.tar-extract/'))
    await verifyOutputDirectory(fromTemp('extractConfig/test.tgz-extract/'))
    await verifyOutputDirectory(fromTemp('extractConfig/test.tar.gz-extract/'))
  })
})
