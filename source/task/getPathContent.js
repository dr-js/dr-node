import { relative } from 'path'
import { catchAsync } from 'dr-js/module/common/error'
import { createPathPrefixLock, toPosixPath } from 'dr-js/module/node/file/function'
import { FILE_TYPE } from 'dr-js/module/node/file/File'
import { getDirectoryContentShallow } from 'dr-js/module/node/file/Directory'

// single level
// relativePath should be under rootPath
const createGetPathContent = (rootPath, extraData = {}) => {
  __DEV__ && console.log('[getStaticFileList]', { rootPath })
  const getPath = createPathPrefixLock(rootPath)
  return async (relativePath) => {
    const absolutePath = getPath(relativePath)
    relativePath = toPosixPath(relative(rootPath, absolutePath)) // may be '' for root
    const { result: content, error } = await catchAsync(getDirectoryContentShallow, absolutePath)
    __DEV__ && error && console.warn('[getStaticFileList] error:', error)
    if (error) return { relativePath, directoryList: [], fileList: [], ...extraData }
    return {
      relativePath,
      directoryList: Array.from(content[ FILE_TYPE.Directory ].keys()), // name only
      fileList: content[ FILE_TYPE.File ], // name only
      ...extraData
    }
  }
}

export { createGetPathContent }
