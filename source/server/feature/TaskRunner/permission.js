import { TASK_ACTION_TYPE } from 'source/module/TaskAction'

const READ_ONLY = 'READ_ONLY'
const ADD_ONLY = 'ADD_ONLY'
const FULL = 'FULL'
const PERMISSION_TYPE = {
  READ_ONLY,
  ADD_ONLY,
  FULL
}

const PERMISSION_TASK_RUNNER_TASK_ACTION = 'task-runner:task-action'

const CREATE_PERMISSION_CHECK_MAP = {
  [ PERMISSION_TASK_RUNNER_TASK_ACTION ]: (getPermissionType) => {
    const {
      TASK_CONFIG_SET, TASK_CONFIG_GET,
      TASK_START, TASK_STOP, TASK_DELETE, TASK_LIST,
      TASK_LOG_GET, TASK_LOG_GET_TAIL, TASK_LOG_RESET,
      PROCESS_STATUS
    } = TASK_ACTION_TYPE

    const READ_ONLY_LIST = [ TASK_CONFIG_GET, TASK_LIST, TASK_LOG_GET, TASK_LOG_GET_TAIL, PROCESS_STATUS ]
    const ADD_ONLY_LIST = [ ...READ_ONLY_LIST, TASK_START, TASK_STOP ]
    const FULL_LIST = [ ...ADD_ONLY_LIST, TASK_CONFIG_SET, TASK_DELETE, TASK_LOG_RESET ]

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
  }
}

export {
  PERMISSION_TYPE,

  PERMISSION_TASK_RUNNER_TASK_ACTION,

  CREATE_PERMISSION_CHECK_MAP
}
