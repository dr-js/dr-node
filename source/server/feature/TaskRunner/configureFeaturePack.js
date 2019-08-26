import { BASIC_EXTENSION_MAP } from '@dr-js/core/module/common/module/MIME'
import { responderSendBufferCompress, prepareBufferDataAsync } from '@dr-js/core/module/node/server/Responder/Send'

import { AUTH_SKIP } from 'source/server/feature/Auth/configure'

import { TASK_ACTION_TYPE } from './task/taskAction'
import { getHTML } from './HTML/main'
import { createResponderTaskAction } from './responder'
import { PERMISSION_TASK_RUNNER_TASK_ACTION } from './permission'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',
  featureAuth: { authPack: { authMode }, createResponderCheckAuth, URL_AUTH_CHECK },
  featurePermission: { permissionPack: { checkPermission = (type, payload) => true } }, // async (type, { store, ... }) => true/false

  taskRunnerRootPath
}) => {
  const URL_HTML = `${routePrefix}/task-runner`
  const URL_TASK_ACTION = `${routePrefix}/task-action`

  const IS_SKIP_AUTH = authMode === AUTH_SKIP

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    URL_AUTH_CHECK,
    URL_TASK_ACTION,
    IS_SKIP_AUTH,
    TASK_ACTION_TYPE
  })), BASIC_EXTENSION_MAP.html)

  const responderTaskAction = createResponderTaskAction({ rootPath: taskRunnerRootPath, logger })

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_TASK_ACTION, 'POST', createResponderCheckAuth({
      responderNext: async (store) => {
        const { type, payload } = await store.requestJSON()
        if (IS_SKIP_AUTH || await checkPermission(PERMISSION_TASK_RUNNER_TASK_ACTION, { store, actionType: type, actionPayload: payload })) { // else ends with 400
          return responderTaskAction(store, type, payload)
        }
      }
    }) ]
  ].filter(Boolean)

  return {
    URL_HTML,
    URL_TASK_ACTION,
    routeList
  }
}

export { configureFeaturePack }
