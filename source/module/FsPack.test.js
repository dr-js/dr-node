import { resolve } from 'path'
import { stringifyEqual } from '@dr-js/core/module/common/verify'
import { getSampleRange } from '@dr-js/core/module/common/math/sample'
import { writeFileAsync } from '@dr-js/core/module/node/file/function'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'
import { resetDirectory } from '@dr-js/dev/module/node/file'

import {
  TYPE_FILE, TYPE_DIRECTORY, /* TYPE_SYMLINK, */
  initFsPack, saveFsPack, loadFsPack,
  setFsPackPackRoot,
  appendFromPath,
  unpackToPath
} from './FsPack'

const { describe, it, before, after, info = console.log } = global

const TEST_ROOT = resolve(__dirname, './test-fs-pack-gitignore/')
const fromRoot = (...args) => resolve(TEST_ROOT, ...args)

before('prepare', async () => {
  await resetDirectory(TEST_ROOT)
  await createDirectory(fromRoot('input'))
  await writeFileAsync(fromRoot('input/empty'), '')
  await writeFileAsync(fromRoot('input/text'), 'input/text')
  await writeFileAsync(fromRoot('input/binary-small'), Buffer.from(getSampleRange(0, 64 - 1)))
  await writeFileAsync(fromRoot('input/binary-big'), Buffer.from(getSampleRange(0, 128 * 1024 - 1)))
  await createDirectory(fromRoot('input/dir0'))
  await writeFileAsync(fromRoot('input/dir0/empty'), '')
  await writeFileAsync(fromRoot('input/dir0/text'), 'input/dir0/text')
  await writeFileAsync(fromRoot('input/dir0/binary-small'), Buffer.from(getSampleRange(0, 64 - 1)))
  await writeFileAsync(fromRoot('input/dir0/binary-big'), Buffer.from(getSampleRange(0, 128 * 1024 - 1)))
  await createDirectory(fromRoot('input/dir1'))
})
after('clear', async () => {
  await modifyDelete(TEST_ROOT)
})

const HEADER_JSON_INPUT = {
  contentList: [
    { type: TYPE_FILE, route: 'input/binary-big', size: 131072, isExecutable: false },
    { type: TYPE_FILE, route: 'input/binary-small', size: 64, isExecutable: false },
    { type: TYPE_FILE, route: 'input/empty', size: 0, isExecutable: false },
    { type: TYPE_FILE, route: 'input/text', size: 10, isExecutable: false },
    { type: TYPE_FILE, route: 'input/dir0/binary-big', size: 131072, isExecutable: false },
    { type: TYPE_FILE, route: 'input/dir0/binary-small', size: 64, isExecutable: false },
    { type: TYPE_FILE, route: 'input/dir0/empty', size: 0, isExecutable: false },
    { type: TYPE_FILE, route: 'input/dir0/text', size: 15, isExecutable: false },
    { type: TYPE_DIRECTORY, route: 'input/dir1' }
  ]
}

const HEADER_JSON_INPUT_ROOT = {
  contentList: [
    { type: TYPE_FILE, route: 'binary-big', size: 131072, isExecutable: false },
    { type: TYPE_FILE, route: 'binary-small', size: 64, isExecutable: false },
    { type: TYPE_FILE, route: 'empty', size: 0, isExecutable: false },
    { type: TYPE_FILE, route: 'text', size: 10, isExecutable: false },
    { type: TYPE_FILE, route: 'dir0/binary-big', size: 131072, isExecutable: false },
    { type: TYPE_FILE, route: 'dir0/binary-small', size: 64, isExecutable: false },
    { type: TYPE_FILE, route: 'dir0/empty', size: 0, isExecutable: false },
    { type: TYPE_FILE, route: 'dir0/text', size: 15, isExecutable: false },
    { type: TYPE_DIRECTORY, route: 'dir1' }
  ]
}

describe('Node.Module.FsPack', () => {
  it('initFsPack()', async () => {
    const fsPack = await initFsPack({ packPath: fromRoot('test-initFsPack.fsp') })
    info(JSON.stringify(fsPack.headerJSON))
    stringifyEqual(fsPack.headerJSON, { contentList: [] })
  })

  it('saveFsPack()', async () => {
    const fsPack = await initFsPack({ packPath: fromRoot('test-saveFsPack.fsp') })
    await saveFsPack(fsPack)
    stringifyEqual(fsPack.headerJSON, { contentList: [] })
  })

  it('loadFsPack()', async () => {
    const fsPack = await initFsPack({ packPath: fromRoot('test-saveFsPack.fsp') })
    await saveFsPack(fsPack)
    const loadedFsPack = await loadFsPack(fsPack)
    info(JSON.stringify(loadedFsPack.headerJSON))
    stringifyEqual(loadedFsPack.headerJSON, fsPack.headerJSON)
  })

  it('appendFromPath()', async () => {
    const fsPack = await initFsPack({ packPath: fromRoot('test-appendFromPath.fsp') })
    await appendFromPath(fsPack, fromRoot('input'))
    await saveFsPack(fsPack)
    stringifyEqual(fsPack.headerJSON, HEADER_JSON_INPUT)
  })

  it('setFsPackPackRoot()', async () => {
    const fsPack = await initFsPack({ packPath: fromRoot('test-setFsPackPackRoot.fsp') })
    setFsPackPackRoot(fsPack, fromRoot('input'))
    await appendFromPath(fsPack, fromRoot('input'))
    await saveFsPack(fsPack)
    stringifyEqual(fsPack.headerJSON, HEADER_JSON_INPUT_ROOT)
  })

  it('unpackToPath()', async () => {
    const fsPack = await initFsPack({ packPath: fromRoot('test-unpackToPath.fsp') })
    setFsPackPackRoot(fsPack, fromRoot('input'))
    await appendFromPath(fsPack, fromRoot('input'))
    await saveFsPack(fsPack)

    const loadedFsPack = await loadFsPack(fsPack)
    await unpackToPath(loadedFsPack, fromRoot('test-unpack'))
    stringifyEqual(loadedFsPack.headerJSON, HEADER_JSON_INPUT_ROOT)
  })

  it('stressSmall', async () => {
    const fsPack = await initFsPack({ packPath: fromRoot('test-stressSmall.fsp') })
    setFsPackPackRoot(fsPack, fromRoot('../../server'))
    await appendFromPath(fsPack, fromRoot('../../server'))
    await saveFsPack(fsPack)

    const loadedFsPack = await loadFsPack(fsPack)
    await unpackToPath(loadedFsPack, fromRoot('test-stressSmall'))
    // stringifyEqual(loadedFsPack.headerJSON, HEADER_JSON_INPUT_ROOT)
  })

  // __DEV__ && it('stressLarge', async () => {
  //   const fsPack = await initFsPack({ packPath: fromRoot('test-stressLarge.fsp') })
  //   setFsPackPackRoot(fsPack, fromRoot('../../../node_modules'))
  //   await appendFromPath(fsPack, fromRoot('../../../node_modules'))
  //   await saveFsPack(fsPack)
  //
  //   // const loadedFsPack = await loadFsPack(fsPack)
  //   // await unpackToPath(loadedFsPack, fromRoot('test-stressLarge'))
  //   // stringifyEqual(loadedFsPack.headerJSON, HEADER_JSON_INPUT_ROOT)
  // })
})