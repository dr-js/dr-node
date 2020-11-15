import { resolve, basename } from 'path'
import { run } from '@dr-js/core/module/node/system/Run'

import {
  fromRoot, setupRoot, clearRoot,
  SOURCE_DIRECTORY, verifyOutputDirectory
} from './archive.test/function'

import {
  detect,
  compressConfig, extractConfig
} from './7z'

const { describe, it, before, after, info = console.log } = global

const TEST_TEMP = fromRoot(`test-${basename(__filename)}`)
const fromTemp = (...args) => resolve(TEST_TEMP, ...args)

before(setupRoot)
after(clearRoot)

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
})
