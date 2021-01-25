import { resolve, basename } from 'path'
import { strictEqual } from '@dr-js/core/module/common/verify'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { run } from '@dr-js/core/module/node/run'

import {
  fromRoot, setupRoot, clearRoot,
  SOURCE_DIRECTORY,
  verifyOutputDirectory
} from './archive.test/function'

import {
  check, verify,
  compressArgs, extractArgs
} from './tar'

const { describe, it, before, after, info = console.log } = global

const TEST_TEMP = fromRoot(`test-${basename(__filename)}`)
const fromTemp = (...args) => resolve(TEST_TEMP, ...args)

before(setupRoot)
after(clearRoot)

describe('Node.Module.Software.tar', () => {
  it('check()', () => strictEqual(check(), true))
  it('verify()', verify)

  it('compressArgs() & extractArgs()', async () => {
    info('compressArgs')
    await createDirectory(fromTemp('compressArgs/'))
    await run(compressArgs(SOURCE_DIRECTORY, fromTemp('compressArgs/test.tar'))).promise
    await run(compressArgs(SOURCE_DIRECTORY, fromTemp('compressArgs/test.tgz'))).promise
    await run(compressArgs(SOURCE_DIRECTORY, fromTemp('compressArgs/test.tar.gz'))).promise
    info('extractArgs')
    await createDirectory(fromTemp('extractArgs/test.tar-extract/'))
    await createDirectory(fromTemp('extractArgs/test.tgz-extract/'))
    await createDirectory(fromTemp('extractArgs/test.tar.gz-extract/'))
    await run(extractArgs(fromTemp('compressArgs/test.tar'), fromTemp('extractArgs/test.tar-extract/'))).promise
    await run(extractArgs(fromTemp('compressArgs/test.tgz'), fromTemp('extractArgs/test.tgz-extract/'))).promise
    await run(extractArgs(fromTemp('compressArgs/test.tar.gz'), fromTemp('extractArgs/test.tar.gz-extract/'))).promise
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractArgs/test.tar-extract/'))
    await verifyOutputDirectory(fromTemp('extractArgs/test.tgz-extract/'))
    await verifyOutputDirectory(fromTemp('extractArgs/test.tar.gz-extract/'))
  })
})
