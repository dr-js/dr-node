import { relative } from 'path'

import { catchAsync } from 'dr-js/module/common/error'
import { createPathPrefixLock, toPosixPath } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { getDirectorySubInfoList, getDirectoryInfoTree, walkDirectoryInfoTree } from 'dr-js/module/node/file/Directory'
import { modify } from 'dr-js/module/node/file/Modify'

// relativePath should be under rootPath
const createGetPathModify = (rootPath) => {
  __DEV__ && console.log('[PathModify]', { rootPath })
  const getPath = createPathPrefixLock(rootPath)

  const pathModify = {
    ...modify,
    'create-directory': (absolutePath) => createDirectory(absolutePath),
    'path-content': async (absolutePath) => { // single level
      const { result: subInfoList, error } = await catchAsync(getDirectorySubInfoList, absolutePath)
      __DEV__ && error && console.warn('[path-content] error:', error)
      const directoryList = [] // name only
      const fileList = [] // [ name, size, mtimeMs ]
      subInfoList && subInfoList.forEach(({ name, stat }) => stat.isDirectory()
        ? directoryList.push(name)
        : fileList.push([ name, stat.size, Math.round(stat.mtimeMs) ])
      )
      return { directoryList, fileList }
    },
    'list-file-recursive': async (absolutePath) => {
      const fileList = [] // [ name, size, mtimeMs ]
      const { error } = await catchAsync(async () => walkDirectoryInfoTree(
        await getDirectoryInfoTree(absolutePath),
        ({ path, stat }) => !stat.isDirectory() && fileList.push([ toPosixPath(relative(absolutePath, path)), stat.size, Math.round(stat.mtimeMs) ])
      ))
      __DEV__ && console.log('[list-file-recursive] fileList:', fileList)
      __DEV__ && error && console.warn('[list-file-recursive] error:', error)
      return { fileList }
    }
  }

  return async (modifyType, relativePathFrom, relativePathTo) => {
    __DEV__ && console.log('[PathModify]', modifyType, relativePathFrom, relativePathTo)
    const absolutePathFrom = getPath(relativePathFrom)
    const absolutePathTo = relativePathTo && getPath(relativePathTo)
    const extraData = await pathModify[ modifyType ](absolutePathFrom, absolutePathTo)
    return { modifyType, relativePathFrom, relativePathTo, ...extraData }
  }
}

export { createGetPathModify }
