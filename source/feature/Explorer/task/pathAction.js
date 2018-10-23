import { relative } from 'path'

import { catchAsync } from 'dr-js/module/common/error'
import { createPathPrefixLock, toPosixPath } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { getDirectorySubInfoList, getDirectoryInfoTree, walkDirectoryInfoTree } from 'dr-js/module/node/file/Directory'
import { modify } from 'dr-js/module/node/file/Modify'

const pathReadActionMap = {
  'path-content': async (absolutePath) => { // single level, both file & directory
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
  'list-file-recursive': async (absolutePath) => { // recursive, file only
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

const pathEditActionMap = {
  ...modify,
  'create-directory': (absolutePath) => createDirectory(absolutePath)
}

// relativePath should be under rootPath
const createGetPathAction = (rootPath, isReadOnly) => {
  __DEV__ && console.log('[PathAction]', { rootPath, isReadOnly })
  const getPath = createPathPrefixLock(rootPath)

  const pathActionMap = {
    ...pathReadActionMap,
    ...(isReadOnly ? {} : pathEditActionMap)
  }

  return async (actionType, relativeFrom, relativeTo) => {
    __DEV__ && console.log('[PathAction]', actionType, relativeFrom, relativeTo)
    const absolutePathFrom = getPath(relativeFrom)
    const absolutePathTo = relativeTo && getPath(relativeTo)
    return pathActionMap[ actionType ](absolutePathFrom, absolutePathTo)
  }
}

export { createGetPathAction }
