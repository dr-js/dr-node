import { resolve, basename } from 'path'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'

import {
  fromRoot, setupRoot, clearRoot,
  SOURCE_DIRECTORY,
  verifyOutputDirectory
} from './archive.test/function'

import {
  compressAsync, extractAsync
} from './fspTar'

const { describe, it, before, after, info = console.log } = global

const TEST_TEMP = fromRoot(`test-${basename(__filename)}`)
const fromTemp = (...args) => resolve(TEST_TEMP, ...args)

before('prepare', async () => setupRoot('skip-mode-600'))
after('clear', clearRoot)

describe('Node.Module.Software.fspTar', () => {
  it('compressAsync() & extractAsync()', async () => {
    info('compressAsync')
    await createDirectory(fromTemp('compressAsync/'))
    await compressAsync(SOURCE_DIRECTORY, fromTemp('compressAsync/test.fsp'))
    await compressAsync(SOURCE_DIRECTORY, fromTemp('compressAsync/test.fsp.gz'))
    info('extractAsync')
    await createDirectory(fromTemp('extractAsync/test.fsp-extract/'))
    await createDirectory(fromTemp('extractAsync/test.fsp.gz-extract/'))
    await extractAsync(fromTemp('compressAsync/test.fsp'), fromTemp('extractAsync/test.fsp-extract/'))
    await extractAsync(fromTemp('compressAsync/test.fsp.gz'), fromTemp('extractAsync/test.fsp.gz-extract/'))
    info('verifyOutputDirectory')
    await verifyOutputDirectory(fromTemp('extractAsync/test.fsp-extract/'), 'skip-mode-600')
    await verifyOutputDirectory(fromTemp('extractAsync/test.fsp.gz-extract/'), 'skip-mode-600')
  })
})
