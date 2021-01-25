import { resolve, basename } from 'path'
import { strictEqual } from '@dr-js/core/module/common/verify'
import { run } from '@dr-js/core/module/node/run'

import {
  fromRoot, setupRoot, clearRoot,
  SOURCE_DIRECTORY, verifyOutputDirectory
} from './archive.test/function'

import {
  check, verify,
  compressArgs, extractArgs
} from './7z'

const { describe, it, before, after, info = console.log } = global

const TEST_TEMP = fromRoot(`test-${basename(__filename)}`)
const fromTemp = (...args) => resolve(TEST_TEMP, ...args)

before(setupRoot)
after(clearRoot)

describe('Node.Module.Software.7z', () => {
  it('check()', () => strictEqual(check(), true))
  it('verify()', verify)

  it('compressArgs() & extractArgs()', async () => {
    info('compressArgs')
    await Promise.all([
      run(compressArgs(SOURCE_DIRECTORY, fromTemp('compressArgs/test.7z'))).promise,
      run(compressArgs(SOURCE_DIRECTORY, fromTemp('compressArgs/test.zip'))).promise
    ])
    info('extractArgs')
    await Promise.all([
      run(extractArgs(fromTemp('compressArgs/test.7z'), fromTemp('extractArgs/test.7z-extract/'))).promise,
      run(extractArgs(fromTemp('compressArgs/test.zip'), fromTemp('extractArgs/test.zip-extract/'))).promise
    ])
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractArgs/test.7z-extract/'))
    await verifyOutputDirectory(fromTemp('extractArgs/test.zip-extract/'))
  })
})
