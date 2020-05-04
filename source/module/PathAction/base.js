import { relative } from 'path'
import { promises as fsAsync } from 'fs'

import { catchAsync } from '@dr-js/core/module/common/error'
import { PATH_TYPE, getPathStat, createPathPrefixLock, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { getDirInfoList, getDirInfoTree, walkDirInfoTreeAsync, createDirectory } from '@dr-js/core/module/node/file/Directory'
import { modifyRename, modifyCopy, modifyDelete } from '@dr-js/core/module/node/file/Modify'

const PATH_VISIBLE = 'path:visible'
const PATH_STAT = 'path:stat'
const PATH_COPY = 'path:copy'
const PATH_RENAME = 'path:rename'
const PATH_DELETE = 'path:delete'

const DIRECTORY_CREATE = 'directory:create'
const DIRECTORY_CONTENT = 'directory:content'
const DIRECTORY_ALL_FILE_LIST = 'directory:all-file-list'

const PATH_ACTION_TYPE = { // NOTE: should always refer action type form here
  PATH_VISIBLE,
  PATH_STAT,
  PATH_COPY,
  PATH_RENAME,
  PATH_DELETE,

  DIRECTORY_CREATE,
  DIRECTORY_CONTENT,
  DIRECTORY_ALL_FILE_LIST
}

const PATH_ACTION_MAP = { // all async
  [ PATH_VISIBLE ]: (absolutePath) => fsAsync.access(absolutePath).then(() => ({ isVisible: true }), () => ({ isVisible: false })),
  [ PATH_STAT ]: (absolutePath) => fsAsync.stat(absolutePath).then(({ mode, size, mtimeMs }) => ({ mode, size, mtimeMs })),
  [ PATH_COPY ]: modifyCopy, // consider the result is undefined
  [ PATH_RENAME ]: modifyRename, // consider the result is undefined
  [ PATH_DELETE ]: modifyDelete, // consider the result is undefined

  [ DIRECTORY_CREATE ]: (absolutePath) => createDirectory(absolutePath),
  [ DIRECTORY_CONTENT ]: async (absolutePath) => { // single level, both file & directory
    const { result: dirInfoList = [], error } = await catchAsync(getDirInfoList, absolutePath)
    __DEV__ && error && console.warn('[DIRECTORY_CONTENT] error:', error)
    const directoryList = [] // name only
    const fileList = [] // [ name, size, mtimeMs ] // TODO: unify array type?
    for (const { type, name, path } of dirInfoList) {
      const stat = (type === PATH_TYPE.Directory) || await getPathStat(path)
      if (stat === true || stat.isDirectory()) directoryList.push(name)
      else fileList.push([ name, stat.size, Math.round(stat.mtimeMs) ])
    }
    return { directoryList, fileList }
  },
  [ DIRECTORY_ALL_FILE_LIST ]: async (absolutePath) => { // recursive, file only
    const fileList = [] // [ name, size, mtimeMs ]
    const { error } = await catchAsync(async () => walkDirInfoTreeAsync(
      await getDirInfoTree(absolutePath),
      async ({ type, path }) => {
        const stat = (type === PATH_TYPE.Directory) || await getPathStat(path)
        stat !== true && !stat.isDirectory() && fileList.push([ toPosixPath(relative(absolutePath, path)), stat.size, Math.round(stat.mtimeMs) ])
      }
    ))
    __DEV__ && console.log('[DIRECTORY_ALL_FILE_LIST] fileList:', fileList)
    __DEV__ && error && console.warn('[DIRECTORY_ALL_FILE_LIST] error:', error)
    return { fileList }
  }
}

const createPathActionTask = ({
  rootPath,
  getPath = createPathPrefixLock(rootPath),
  pathActionMap = PATH_ACTION_MAP
}) => {
  __DEV__ && console.log('[PathAction]', { rootPath }, Object.keys(PATH_ACTION_MAP))
  return async (actionType, key, keyTo) => { // key/keyTo must be under rootPath
    const absolutePath = getPath(key)
    const absolutePathTo = keyTo && getPath(keyTo)
    __DEV__ && console.log('[PathActionTask]', {
      actionType,
      key, keyTo,
      absolutePath, absolutePathTo
    })
    return pathActionMap[ actionType ](absolutePath, absolutePathTo)
  }
}

export {
  PATH_ACTION_TYPE,
  PATH_ACTION_MAP,
  createPathActionTask
}
