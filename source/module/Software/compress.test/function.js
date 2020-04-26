import { resolve, relative } from 'path'
import { strictEqual, stringifyEqual } from '@dr-js/core/module/common/verify'
import { readFileAsync, writeFileAsync } from '@dr-js/core/module/node/file/function'
import { PATH_TYPE, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { createDirectory, getDirectoryInfoTree } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'
import { resetDirectory } from '@dr-js/dev/module/node/file'

const TEST_ROOT = resolve(__dirname, 'test-root-gitignore/')
const fromRoot = (...args) => resolve(TEST_ROOT, ...args)

const SOURCE_FILE = fromRoot('source-file')
const SOURCE_DIRECTORY = fromRoot('source-directory/')

const EXPECT_FILE_CONTENT = 'console.log([ { 1: 2 } ])\n'.repeat(64)
const EXPECT_INFO_LIST = [
  [ '', [ { 'name': '1', 'type': 'Directory', 'size': null }, { 'name': 'file-empty', 'type': 'File', 'size': 0 }, { 'name': 'file.js', 'type': 'File', 'size': Buffer.byteLength(EXPECT_FILE_CONTENT) } ] ],
  [ '1', [ { 'name': '2', 'type': 'Directory', 'size': null } ] ],
  [ '1/2', [ { 'name': '3', 'type': 'Directory', 'size': null } ] ],
  [ '1/2/3', [ { 'name': '4', 'type': 'Directory', 'size': null } ] ],
  [ '1/2/3/4', [ { 'name': '5', 'type': 'Directory', 'size': null } ] ],
  [ '1/2/3/4/5', [] ]
]

const setupRoot = async () => {
  await resetDirectory(SOURCE_DIRECTORY)

  await writeFileAsync(SOURCE_FILE, EXPECT_FILE_CONTENT)

  await createDirectory(fromRoot(SOURCE_DIRECTORY, '1/2/3/4/5'))
  await writeFileAsync(fromRoot(SOURCE_DIRECTORY, 'file-empty'), '')
  await writeFileAsync(fromRoot(SOURCE_DIRECTORY, 'file.js'), EXPECT_FILE_CONTENT)
}

const clearRoot = async () => {
  await modifyDelete(TEST_ROOT)
}

const verifyOutputFile = async (path) => {
  strictEqual(String(await readFileAsync(path)), EXPECT_FILE_CONTENT)
}

const verifyOutputDirectory = async (path) => {
  const infoTree = await getDirectoryInfoTree(path)
  const infoList = Object.entries(infoTree.subInfoListMap).map(([ key, subInfoList ]) => [ toPosixPath(relative(path, key)), subInfoList.map(({ name, type, stat }) => ({ name, type, size: type === PATH_TYPE.Directory ? null : stat.size })) ])
  // console.log('verifyOutputDirectory', infoList.map((v) => JSON.stringify(v)))
  // console.log('EXPECT_INFO_LIST', EXPECT_INFO_LIST.map((v) => JSON.stringify(v)))
  stringifyEqual(infoList, EXPECT_INFO_LIST)
}

export {
  fromRoot, setupRoot, clearRoot,
  SOURCE_FILE, SOURCE_DIRECTORY,
  verifyOutputFile, verifyOutputDirectory
}
