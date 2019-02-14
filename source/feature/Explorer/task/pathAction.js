import { relative } from 'path'

import { catchAsync } from 'dr-js/module/common/error'
import { visibleAsync, statAsync, createPathPrefixLock, toPosixPath } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { getDirectorySubInfoList, getDirectoryInfoTree, walkDirectoryInfoTree } from 'dr-js/module/node/file/Directory'
import { modify } from 'dr-js/module/node/file/Modify'

const PATH_VISIBLE = 'path:visible'
const PATH_STAT = 'path:stat'
const PATH_COPY = 'path:copy'
const PATH_MOVE = 'path:move'
const PATH_DELETE = 'path:delete'

const DIRECTORY_CREATE = 'directory:create'
const DIRECTORY_CONTENT = 'directory:content'
const DIRECTORY_ALL_FILE_LIST = 'directory:all-file-list'

const PATH_ACTION_TYPE = { // NOTE: should always refer action type form here
  PATH_VISIBLE,
  PATH_STAT,
  PATH_COPY,
  PATH_MOVE,
  PATH_DELETE,

  DIRECTORY_CREATE,
  DIRECTORY_CONTENT,
  DIRECTORY_ALL_FILE_LIST
}

const PATH_ACTION_MAP = {
  [ PATH_VISIBLE ]: (absolutePath) => visibleAsync(absolutePath).then((isVisible) => ({ isVisible })),
  [ PATH_STAT ]: (absolutePath) => statAsync(absolutePath).then(({ mode, size, mtimeMs }) => ({ mode, size, mtimeMs })),
  [ PATH_COPY ]: modify.copy,
  [ PATH_MOVE ]: modify.move,
  [ PATH_DELETE ]: modify.delete,

  [ DIRECTORY_CREATE ]: (absolutePath) => createDirectory(absolutePath),
  [ DIRECTORY_CONTENT ]: async (absolutePath) => { // single level, both file & directory
    const { result: subInfoList, error } = await catchAsync(getDirectorySubInfoList, absolutePath)
    __DEV__ && error && console.warn('[DIRECTORY_CONTENT] error:', error)
    const directoryList = [] // name only
    const fileList = [] // [ name, size, mtimeMs ] // TODO: unify array type?
    subInfoList && subInfoList.forEach(({ name, stat }) => stat.isDirectory()
      ? directoryList.push(name)
      : fileList.push([ name, stat.size, Math.round(stat.mtimeMs) ])
    )
    return { directoryList, fileList }
  },
  [ DIRECTORY_ALL_FILE_LIST ]: async (absolutePath) => { // recursive, file only
    const fileList = [] // [ name, size, mtimeMs ]
    const { error } = await catchAsync(async () => walkDirectoryInfoTree(
      await getDirectoryInfoTree(absolutePath),
      ({ path, stat }) => !stat.isDirectory() && fileList.push([ toPosixPath(relative(absolutePath, path)), stat.size, Math.round(stat.mtimeMs) ])
    ))
    __DEV__ && console.log('[DIRECTORY_ALL_FILE_LIST] fileList:', fileList)
    __DEV__ && error && console.warn('[DIRECTORY_ALL_FILE_LIST] error:', error)
    return { fileList }
  }
}

PATH_ACTION_MAP[ 'stat' ] = PATH_ACTION_MAP[ PATH_STAT ] // TODO: legacy string, remove after 2019/03/31 ?
PATH_ACTION_MAP[ 'copy' ] = PATH_ACTION_MAP[ PATH_COPY ] // TODO: legacy string, remove after 2019/03/31 ?
PATH_ACTION_MAP[ 'move' ] = PATH_ACTION_MAP[ PATH_MOVE ] // TODO: legacy string, remove after 2019/03/31 ?
PATH_ACTION_MAP[ 'delete' ] = PATH_ACTION_MAP[ PATH_DELETE ] // TODO: legacy string, remove after 2019/03/31 ?
PATH_ACTION_MAP[ 'create-directory' ] = PATH_ACTION_MAP[ DIRECTORY_CREATE ] // TODO: legacy string, remove after 2019/03/31 ?
PATH_ACTION_MAP[ 'path-content' ] = PATH_ACTION_MAP[ DIRECTORY_CONTENT ] // TODO: legacy string, remove after 2019/03/31 ?
PATH_ACTION_MAP[ 'list-file-recursive' ] = PATH_ACTION_MAP[ DIRECTORY_ALL_FILE_LIST ] // TODO: legacy string, remove after 2019/03/31 ?

const createGetPathAction = (rootPath) => {
  const getPath = createPathPrefixLock(rootPath)
  __DEV__ && console.log('[PathAction]', { rootPath }, Object.keys(PATH_ACTION_MAP))

  return async (actionType, relativeFrom, relativeTo) => { // relativeFrom/relativeTo should be under rootPath
    __DEV__ && console.log('[PathAction]', actionType, relativeFrom, relativeTo)
    const absolutePathFrom = getPath(relativeFrom)
    const absolutePathTo = relativeTo && getPath(relativeTo)
    return PATH_ACTION_MAP[ actionType ](absolutePathFrom, absolutePathTo)
  }
}

export {
  PATH_ACTION_TYPE,
  createGetPathAction
}
