import { createPathPrefixLock } from 'dr-js/module/node/file/function'
import { modify } from 'dr-js/module/node/file/Modify'

// relativePath should be under rootPath
const createGetPathModify = (rootPath, extraData = {}) => {
  __DEV__ && console.log('[PathModify]', { rootPath })
  const getPath = createPathPrefixLock(rootPath)
  return async (modifyType, relativePathFrom, relativePathTo) => {
    __DEV__ && console.log('[PathModify]', modifyType, relativePathFrom, relativePathTo)
    const absolutePathFrom = getPath(relativePathFrom)
    const absolutePathTo = relativePathTo && getPath(relativePathTo)
    await modify[ modifyType ](absolutePathFrom, absolutePathTo)
    return { modifyType, relativePathFrom, relativePathTo, ...extraData }
  }
}

export { createGetPathModify }
