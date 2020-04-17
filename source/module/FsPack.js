import { resolve, relative, /* isAbsolute, */ dirname } from 'path'
import { catchAsync } from '@dr-js/core/module/common/error'
import { setupStreamPipe, waitStreamStopAsync, bufferToReadableStream } from '@dr-js/core/module/node/data/Stream'
import {
  createReadStream, createWriteStream,
  openAsync, closeAsync, readAsync, writeAsync, /* readlinkAsync, symlinkAsync, */
  writeFileAsync,
  statAsync
} from '@dr-js/core/module/node/file/function'
import { PATH_TYPE, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { getDirectoryInfoTree, walkDirectoryInfoTree, createDirectory } from '@dr-js/core/module/node/file/Directory'

// TODO: no symlink support, since getDirectoryInfoTree will follow link to target

/** fsPack
 * feature
 *   support file mode, currently record executable only
 *   // TODO: support symbolic link (on *nux)
 *   // TODO: the compact form for headerJSON do not support route with `\r` or `\n`
 *   // TODO: consider support reorder with http://man7.org/linux/man-pages/man2/copy_file_range.2.html
 *
 * structure
 *   binary layout
 *     "FSP" + versionByte (3+1byte) for fast version test
 *     headerOffset (4byte|number) point to headerLength
 *     fileBuffer#0
 *     fileBuffer#1
 *     fileBuffer#2
 *     ...
 *     headerLength (4byte|number) this allows pack to easily append
 *     headerJSON (string)
 *
 *   headerJSON
 *     {
 *       contentList: [ // ordered
 *         { type: TYPE_FILE, route: 'a/b/c', size: 10, isExecutable: false }, // offset start can be calc from size
 *         { type: TYPE_DIRECTORY, route: 'a/b/d' },
 *         // TODO: { type: TYPE_SYMLINK, route: 'a/b/s', target: 'relative/or/absolute/path' },
 *       ]
 *     }
 */

const UINT32_MAX = 0xffffffff // 4GiB
const UINT32_BYTE_SIZE = 4 // Math.ceil(Math.log2(UINT32_MAX) / 8)

const HEADER_VERSION_UINT32 = 0x46535000 // `0x${Buffer.from('FSP\x00').readUInt32BE(0).toString(16)}`

const KEY_CONTENT_COMPACT = 'cc'

const TYPE_FILE = 'f'
const TYPE_DIRECTORY = 'd'
// const TYPE_SYMLINK = 's'

const FILE_FLAG_READ_ONLY = 'r'
const FILE_FLAG_EDIT = 'r+' // fail if not exist
const FILE_FLAG_CREATE = 'w+' // will reset existing

const fileModeToIsExecutable = (mode) => Boolean(mode & 0o111)
const isExecutableToFileMode = (isExecutable) => isExecutable ? 0x755 : 0x644 // same as git

const toRoute = (packRoot, path) => toPosixPath(relative(packRoot, path))

const autoOpenFsPack = async (asyncFunc, fsPack, openFlag, extra) => {
  const { packPath, packFd } = fsPack
  if (packFd) return asyncFunc(packFd, fsPack, extra)
  const packFdAuto = await openAsync(packPath, openFlag)
  const { result, error } = await catchAsync(asyncFunc, packFdAuto, fsPack, extra)
  await closeAsync(packFdAuto)
  if (error) throw error
  return result
}

const readBuffer = async (packFd, offset, size, buffer = Buffer.allocUnsafe(size)) => {
  await readAsync(packFd, buffer, 0, size, offset)
  return buffer
}
const readHeaderNumberList = async (packFd, offset, count = 1) => {
  const buffer = await readBuffer(packFd, offset, count * UINT32_BYTE_SIZE)
  const numberList = []
  for (let index = 0; index < count; index++) numberList.push(buffer.readUInt32BE(index * UINT32_BYTE_SIZE))
  return numberList
}

const writeBuffer = async (packFd, offset, buffer) => writeAsync(packFd, buffer, 0, buffer.length, offset)
const writeHeaderNumberList = async (packFd, offset, numberList) => {
  const buffer = Buffer.allocUnsafe(numberList.length * UINT32_BYTE_SIZE)
  for (let index = 0; index < numberList.length; index++) buffer.writeUInt32BE(numberList[ index ], index * UINT32_BYTE_SIZE)
  return writeBuffer(packFd, offset, buffer)
}

const parseHeaderJSON = (buffer) => {
  const { [ KEY_CONTENT_COMPACT ]: contentCompact = '' } = JSON.parse(String(buffer))
  const contentList = !contentCompact ? [] : contentCompact.split('\r').map((contentCompact) => {
    const contentCompactList = contentCompact.split('\n')
    const typeCompactList = contentCompactList[ 0 ].split(' ')
    switch (typeCompactList[ 0 ]) {
      case TYPE_FILE: {
        const [ , route ] = contentCompactList
        const [ type, size, isExecutable ] = typeCompactList
        return { type, route, size: parseInt(size, 36), isExecutable: isExecutable === 'E' }
      }
      case TYPE_DIRECTORY: {
        const [ , route ] = contentCompactList
        const [ type ] = typeCompactList
        return { type, route }
      }
      // case TYPE_SYMLINK: {
      //   const [ , route, target ] = contentCompactList
      //   const [ type ] = typeCompactList
      //   return { type, route, target }
      // }
      default:
        throw new Error(`unsupported content type: ${typeCompactList[ 0 ]} ${JSON.stringify({ contentCompactList, typeCompactList })}`)
    }
  })
  return { contentList }
}

const packHeaderJSON = (headerJSON) => {
  const { contentList } = headerJSON
  const contentCompact = contentList.map((content) => {
    switch (content.type) {
      case TYPE_FILE: {
        const { type, route, size, isExecutable } = content
        return [ [ type, Number(size).toString(36), isExecutable ? 'E' : '' ].join(' ').trim(), route ].join('\n')
      }
      case TYPE_DIRECTORY: {
        const { type, route } = content
        return [ type, route ].join('\n')
      }
      // case TYPE_SYMLINK: {
      //   const { type, route, target } = content
      //   return [ type, route, target ].join('\n')
      // }
      default:
        throw new Error(`unsupported content type: ${content.type}`)
    }
  }).join('\r')
  __DEV__ && console.log(JSON.stringify({ [ KEY_CONTENT_COMPACT ]: contentCompact }))
  return Buffer.from(JSON.stringify({ [ KEY_CONTENT_COMPACT ]: contentCompact }))
}

const readFsPackHeader = async (packFd, fsPack) => {
  const { offset } = fsPack
  const [ headerVersion, headerOffset ] = await readHeaderNumberList(packFd, offset, 2)
  if (headerVersion >> 8 !== HEADER_VERSION_UINT32 >> 8) throw new Error(`not fsPack: ${headerVersion.toString(36)}, expect: ${HEADER_VERSION_UINT32.toString(36)}`)
  if ((headerVersion & 0xff) !== (HEADER_VERSION_UINT32 & 0xff)) throw new Error(`mismatch version: ${headerVersion & 0xff}`)
  if (!(headerOffset >= 2 * UINT32_BYTE_SIZE && headerOffset <= UINT32_MAX)) throw new Error(`invalid headerOffset: ${headerOffset}`)
  const [ headerLength ] = await readHeaderNumberList(packFd, offset + headerOffset, 1)
  const headerJSON = parseHeaderJSON(await readBuffer(packFd, offset + headerOffset + UINT32_BYTE_SIZE, headerLength))
  fsPack.headerOffset = headerOffset
  fsPack.headerJSON = headerJSON
}
const writeFsPackHeader = async (packFd, fsPack) => {
  const { offset, headerOffset, headerJSON } = fsPack
  await writeHeaderNumberList(packFd, offset, [ HEADER_VERSION_UINT32, headerOffset ])
  const headerJSONBuffer = packHeaderJSON(headerJSON)
  await writeHeaderNumberList(packFd, offset + headerOffset, [ headerJSONBuffer.length ])
  await writeBuffer(packFd, offset + headerOffset + UINT32_BYTE_SIZE, headerJSONBuffer)
}
const writeFsPackAppendFile = async (packFd, fsPack, {
  path, route = toRoute(fsPack.packRoot, path), size, isExecutable,
  stat, buffer, readStream // optional
}) => {
  if (!size || !isExecutable) {
    if (!stat) stat = await statAsync(path)
    if (!size) size = stat.size
    if (!isExecutable) isExecutable = fileModeToIsExecutable(stat.mode)
  }
  if (!readStream) readStream = buffer ? bufferToReadableStream(buffer) : createReadStream(path)
  const writeStream = createWriteStream(fsPack.packPath, { fd: packFd, start: fsPack.offset + fsPack.headerOffset, autoClose: false })
  await waitStreamStopAsync(setupStreamPipe(readStream, writeStream))
  fsPack.headerOffset += size
  fsPack.headerJSON.contentList.push({ type: TYPE_FILE, route, size, isExecutable })
}
const editFsPackAppendDirectory = async (fsPack, { path, route = toRoute(fsPack.packRoot, path) }) => { fsPack.headerJSON.contentList.push({ type: TYPE_DIRECTORY, route }) }
// const editFsPackAppendSymlink = async (fsPack, { path, route = toRoute(fsPack.packRoot, path), target }) => {
//   if (!target) target = await readlinkAsync(path)
//   fsPack.headerJSON.contentList.push({ type: TYPE_SYMLINK, route, target })
// }

const unpackFsPackFile = async (packFd, fsPack, {
  route, size, isExecutable,
  buffer, writeStream // optional
}) => {
  const { packPath, unpackPath, fastCache } = fsPack
  const { offsetSum } = fastCache.contentMap[ route ]
  const path = resolve(unpackPath, route)
  await createDirectory(dirname(path))
  if (buffer) await readBuffer(packFd, offsetSum, size, buffer)
  else if (writeStream || size >= 64 * 1024) {
    const readStream = createReadStream(packPath, { fd: packFd, start: offsetSum, end: offsetSum + size - 1, autoClose: false })
    if (!writeStream) writeStream = createWriteStream(path, { mode: isExecutableToFileMode(isExecutable) })
    await waitStreamStopAsync(setupStreamPipe(readStream, writeStream))
  } else if (size > 0) await writeFileAsync(path, await readBuffer(packFd, offsetSum, size))
  else await writeFileAsync(path, '')
}
const unpackFsPackDirectory = async (packFd, fsPack, { route }) => {
  const { unpackPath } = fsPack
  const path = resolve(unpackPath, route)
  await createDirectory(path)
}
// const unpackFsPackSymlink = async (packFd, fsPack, { route, target }) => {
//   const { unpackPath } = fsPack
//   const path = resolve(unpackPath, route)
//   const targetPath = isAbsolute(target) ? target : resolve(unpackPath, target)
//   await createDirectory(dirname(path))
//   await symlinkAsync(targetPath, path)
// }

const collectContentListFromPath = async (inputPath) => {
  const contentList = []
  const directoryPathList = []
  const fileDirectorySet = new Set()
  await walkDirectoryInfoTree(await getDirectoryInfoTree(inputPath), ({ path, stat, type }) => {
    switch (type) {
      case PATH_TYPE.File:
        contentList.push({ type: TYPE_FILE, path, stat })
        fileDirectorySet.add(dirname(path))
        break
      case PATH_TYPE.Directory:
        directoryPathList.push(path)
        break
      default:
        throw new Error(`unsupported content type: ${type}, from: ${path}`)
    }
  })
  const skipDirectorySet = new Set()
  for (let fileDirectory of fileDirectorySet) {
    let prevFileDirectory = ''
    while (fileDirectory !== prevFileDirectory) {
      skipDirectorySet.add(fileDirectory)
      prevFileDirectory = fileDirectory
      fileDirectory = dirname(fileDirectory)
    }
  }
  for (const path of directoryPathList) if (!skipDirectorySet.has(path)) contentList.push({ type: TYPE_DIRECTORY, path })
  return contentList
}

const resetFastCache = (fsPack) => { fsPack.fastCache = null }
const autoFastCache = (fsPack) => {
  if (fsPack.fastCache) return
  const contentMap = {}
  let offsetSum = fsPack.offset + 2 * UINT32_BYTE_SIZE
  fsPack.headerJSON.contentList.forEach((content) => {
    contentMap[ content.route ] = { content, offsetSum }
    offsetSum += content.size || 0
  })
  fsPack.fastCache = { contentMap, offsetSum }
}

const verifyEdit = (fsPack) => {
  if (fsPack.isReadOnly) throw new Error('no edit readOnly fsPack')
  resetFastCache(fsPack)
}
const verifyUnpack = (fsPack) => {
  if (!fsPack.unpackPath) throw new Error('expect unpackPath')
  autoFastCache(fsPack)
}

const initFsPack = async ({ packPath, packRoot = dirname(packPath), packFd = null, offset = 0 }) => {
  const fsPack = {
    packPath, packRoot, packFd, offset, isReadOnly: false,
    headerOffset: 2 * UINT32_BYTE_SIZE, headerJSON: { contentList: [] },
    unpackPath: '', fastCache: null
  }
  await autoOpenFsPack(writeFsPackHeader, fsPack, FILE_FLAG_CREATE)
  return fsPack
}

const saveFsPack = async (fsPack) => {
  verifyEdit(fsPack)
  await autoOpenFsPack(writeFsPackHeader, fsPack, FILE_FLAG_EDIT)
}

const loadFsPack = async ({
  packPath, packRoot = dirname(packPath), packFd = null, offset = 0, isReadOnly = false,
  unpackPath = ''
}) => {
  const fsPack = {
    packPath, packRoot, packFd, offset, isReadOnly,
    headerOffset: 0, headerJSON: null,
    unpackPath, fastCache: null
  }
  await autoOpenFsPack(readFsPackHeader, fsPack, isReadOnly ? FILE_FLAG_READ_ONLY : FILE_FLAG_EDIT)
  return fsPack
}

const setFsPackPackRoot = (fsPack, packRoot) => { fsPack.packRoot = packRoot }
const setFsPackUnpackPath = (fsPack, unpackPath) => { fsPack.unpackPath = unpackPath }

const appendFile = async (fsPack, content) => {
  verifyEdit(fsPack)
  await autoOpenFsPack(writeFsPackAppendFile, fsPack, FILE_FLAG_EDIT, content)
}
const appendDirectory = async (fsPack, content) => {
  verifyEdit(fsPack)
  await editFsPackAppendDirectory(fsPack, content)
}
// const appendSymlink = async (fsPack, content) => {
//   verifyEdit(fsPack)
//   await editFsPackAppendSymlink(fsPack, content)
// }
const append = async (fsPack, content) => {
  switch (content.type) {
    case TYPE_FILE:
      return appendFile(fsPack, content)
    case TYPE_DIRECTORY:
      return appendDirectory(fsPack, content)
    // case TYPE_SYMLINK:
    //   return appendSymlink(fsPack, content)
    default:
      throw new Error(`invalid content type: ${content.type}`)
  }
}
const appendContentList = async (fsPack, contentList) => {
  verifyEdit(fsPack)
  await autoOpenFsPack(async (packFd, fsPack) => {
    for (const content of contentList) {
      // __DEV__ && console.log(`++ ${content.type} | ${content.route}`)
      switch (content.type) {
        case TYPE_FILE:
          await writeFsPackAppendFile(packFd, fsPack, content)
          break
        case TYPE_DIRECTORY:
          await editFsPackAppendDirectory(fsPack, content)
          break
        // case TYPE_SYMLINK:
        //   await editFsPackAppendSymlink(fsPack, content)
        //   break
        default:
          throw new Error(`invalid content type: ${content.type}`)
      }
    }
  }, fsPack, FILE_FLAG_EDIT)
}
const appendFromPath = async (fsPack, inputPath) => {
  verifyEdit(fsPack)
  await appendContentList(fsPack, await collectContentListFromPath(inputPath))
}

const unpackFile = async (fsPack, content) => { // TODO: allow get buffer or stream
  verifyUnpack(fsPack)
  await autoOpenFsPack(unpackFsPackFile, fsPack, FILE_FLAG_EDIT, content)
}
const unpackDirectory = async (fsPack, content) => {
  verifyUnpack(fsPack)
  await autoOpenFsPack(unpackFsPackDirectory, fsPack, FILE_FLAG_EDIT, content)
}
// const unpackSymlink = async (fsPack, content) => {
//   verifyUnpack(fsPack)
//   await autoOpenFsPack(unpackFsPackSymlink, fsPack, FILE_FLAG_EDIT, content)
// }
const unpack = async (fsPack, content) => {
  switch (content.type) {
    case TYPE_FILE:
      return unpackFile(fsPack, content)
    case TYPE_DIRECTORY:
      return unpackDirectory(fsPack, content)
    // case TYPE_SYMLINK:
    //   return unpackSymlink(fsPack, content)
    default:
      throw new Error(`invalid content type: ${content.type}`)
  }
}
const unpackContentList = async (fsPack, contentList) => {
  verifyUnpack(fsPack)
  await autoOpenFsPack(async (packFd, fsPack) => {
    for (const content of contentList) {
      // __DEV__ && console.log(`-- ${content.type} | ${content.route}`)
      switch (content.type) {
        case TYPE_FILE:
          await unpackFsPackFile(packFd, fsPack, content)
          break
        case TYPE_DIRECTORY:
          await unpackFsPackDirectory(packFd, fsPack, content)
          break
        // case TYPE_SYMLINK:
        //   await unpackFsPackSymlink(packFd, fsPack, content)
        //   break
        default:
          throw new Error(`invalid content type: ${content.type}`)
      }
    }
  }, fsPack, FILE_FLAG_EDIT)
}
const unpackToPath = async (fsPack, unpackPath) => {
  unpackPath && setFsPackUnpackPath(fsPack, unpackPath)
  await unpackContentList(fsPack, fsPack.headerJSON.contentList)
}

export {
  TYPE_FILE, TYPE_DIRECTORY, /* TYPE_SYMLINK, */
  initFsPack, saveFsPack, loadFsPack,
  setFsPackPackRoot, setFsPackUnpackPath,
  appendFile, appendDirectory, /* appendSymlink, */ append, appendContentList, appendFromPath,
  unpackFile, unpackDirectory, /* unpackSymlink, */ unpack, unpackContentList, unpackToPath
}
