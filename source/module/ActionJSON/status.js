import { getTimestamp } from '@dr-js/core/module/common/time'
import { indentLine } from '@dr-js/core/module/common/string'
import { catchAsync } from '@dr-js/core/module/common/error'
import { objectMap } from '@dr-js/core/module/common/immutable/Object'

import { COMMON_SERVER_STATUS_COMMAND_LIST, getCommonServerStatus } from 'source/module/ServerStatus'

const STATUS_TIMESTAMP = 'status.timestamp'
const STATUS_TIME_ISO = 'status.time-iso'
const STATUS_SERVER_COMMON = 'status.server-common'

const ACTION_TYPE = { // NOTE: should always refer action type form here
  STATUS_TIMESTAMP,
  STATUS_TIME_ISO,
  STATUS_SERVER_COMMON
}

const ACTION_CORE_MAP = { // all async
  [ STATUS_TIMESTAMP ]: async () => ({ status: getTimestamp() }),
  [ STATUS_TIME_ISO ]: async () => ({ status: new Date().toISOString() }),
  [ STATUS_SERVER_COMMON ]: async ({ rootPath, statusCommandList }) => ({
    status: (await getCommonServerStatus(rootPath, statusCommandList))
      .map(([ title, output ]) => output && `${`[${title}] `.padEnd(80, '=')}\n${indentLine(output, '  ')}`)
      .filter(Boolean).join('\n')
  })
}

const setupActionMap = ({
  actionCoreMap = ACTION_CORE_MAP,
  statusCommandList = COMMON_SERVER_STATUS_COMMAND_LIST,
  rootPath,
  loggerExot
}) => {
  const option = { rootPath, statusCommandList }

  return objectMap(actionCoreMap, (actionFunc, actionType) => async (store, actionPayload) => {
    loggerExot.add(`[ActionBox|${actionType}]`)
    const { result, error } = await catchAsync(actionFunc, option) // NOTE: the call pattern
    return error ? { actionType, error: String(error) } : { actionType, ...result }
  })
}

export {
  ACTION_TYPE, ACTION_CORE_MAP,
  setupActionMap
}
