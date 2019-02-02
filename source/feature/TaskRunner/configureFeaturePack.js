import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { responderSendBufferCompress, prepareBufferDataAsync } from 'dr-js/module/node/server/Responder/Send'

import { TASK_ACTION_TYPE } from './task/taskAction'
import { getHTML } from './HTML/main'
import { createResponderTaskAction } from './responder'
import { PERMISSION_TASK_RUNNER_TASK_ACTION } from './permission'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  taskRunnerRootPath,

  urlAuthCheck = '',
  createResponderCheckAuth = ({ responderNext }) => responderNext,

  checkPermission = (type, payload) => true // async (type, { store, ... }) => true/false
}) => {
  const URL_HTML = `${routePrefix}/task-runner`
  const URL_TASK_ACTION = `${routePrefix}/task-action`

  const IS_SKIP_AUTH = !urlAuthCheck

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    URL_AUTH_CHECK: urlAuthCheck,
    URL_TASK_ACTION,
    IS_SKIP_AUTH,
    TASK_ACTION_TYPE
  })), BASIC_EXTENSION_MAP.html)

  const responderTaskAction = createResponderTaskAction({ rootPath: taskRunnerRootPath, logger })

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_TASK_ACTION, 'POST', createResponderCheckAuth({
      responderNext: async (store) => {
        const { type, payload } = JSON.parse(await receiveBufferAsync(store.request))
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
