import { visibleAsync } from 'dr-js/module/node/file/function'

import { PATH_ACTION_TYPE } from './task/pathAction'

const READ_ONLY = 'READ_ONLY'
const ADD_ONLY = 'ADD_ONLY'
const FULL = 'FULL'
const PERMISSION_TYPE = {
  READ_ONLY,
  ADD_ONLY,
  FULL
}

const PERMISSION_EXPLORER_PATH_ACTION = 'explorer:path-action'
const PERMISSION_EXPLORER_FILE_UPLOAD_START = 'explorer:file-upload:start'

const CREATE_PERMISSION_CHECK_MAP = {
  [ PERMISSION_EXPLORER_PATH_ACTION ]: (getPermissionType) => {
    const {
      PATH_VISIBLE, PATH_STAT, PATH_COPY, PATH_MOVE, PATH_DELETE,
      DIRECTORY_CREATE, DIRECTORY_CONTENT, DIRECTORY_ALL_FILE_LIST
    } = PATH_ACTION_TYPE

    const READ_ONLY_LIST = [ PATH_VISIBLE, PATH_STAT, DIRECTORY_CONTENT, DIRECTORY_ALL_FILE_LIST ]
    const ADD_ONLY_LIST = [ ...READ_ONLY_LIST, PATH_COPY, DIRECTORY_CREATE ]
    const FULL_LIST = [ ...ADD_ONLY_LIST, PATH_MOVE, PATH_DELETE ]

    const PATH_ACTION_PERMISSION = { // Set() in Map()
      [ READ_ONLY ]: new Set(READ_ONLY_LIST),
      [ ADD_ONLY ]: new Set(ADD_ONLY_LIST),
      [ FULL ]: new Set(FULL_LIST)
    }

    return async (type, payload) => {
      const { actionType, IS_READ_ONLY } = payload
      if (IS_READ_ONLY && !PATH_ACTION_PERMISSION[ READ_ONLY ].has(actionType)) return false
      const permissionType = await getPermissionType(type, payload)
      return Boolean(
        PATH_ACTION_PERMISSION[ permissionType ] &&
        PATH_ACTION_PERMISSION[ permissionType ].has(actionType)
      )
    }
  },

  [ PERMISSION_EXPLORER_FILE_UPLOAD_START ]: (getPermissionType) => {
    return async (type, payload) => {
      const { filePath, IS_READ_ONLY } = payload
      if (IS_READ_ONLY) return false
      const permissionType = await getPermissionType(type, payload)
      if (permissionType === FULL) return true
      if (permissionType === ADD_ONLY) return !(await visibleAsync(filePath))
      return false
    }
  }
}

export {
  PERMISSION_TYPE,

  PERMISSION_EXPLORER_PATH_ACTION,
  PERMISSION_EXPLORER_FILE_UPLOAD_START,

  CREATE_PERMISSION_CHECK_MAP
}