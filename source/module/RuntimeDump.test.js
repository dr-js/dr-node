import { resolve } from 'path'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'
import { resetDirectory } from '@dr-js/dev/module/node/file'
import { dumpAsync } from './RuntimeDump'

const TEST_ROOT = resolve(__dirname, 'runtime-dump-gitignore/')

const { describe, it, before, after } = global

before('prepare', () => resetDirectory(TEST_ROOT))
after('clear', () => modifyDelete(TEST_ROOT))

describe('Node.Module.RuntimeDump', () => {
  it('dumpAsync()', async () => {
    await dumpAsync(TEST_ROOT)
  })
})
