import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { responderSendBufferCompress, prepareBufferDataAsync } from 'dr-js/module/node/server/Responder/Send'

import { getHTML } from './HTML/main'
import { createResponderTaskAction } from './responder'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  taskRunnerRootPath,

  urlAuthCheck = '',
  wrapResponderCheckAuthCheckCode = (responder) => responder
}) => {
  const URL_HTML = `${routePrefix}/task-runner`
  const URL_TASK_ACTION = `${routePrefix}/task-action`

  const HTMLBufferData = await prepareBufferDataAsync(Buffer.from(getHTML({
    URL_AUTH_CHECK: urlAuthCheck,
    URL_TASK_ACTION
  })), BASIC_EXTENSION_MAP.html)

  const responderTaskAction = createResponderTaskAction(taskRunnerRootPath, logger)

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ],
    [ URL_TASK_ACTION, 'POST', wrapResponderCheckAuthCheckCode(async (store) => {
      const { type, payload } = JSON.parse(await receiveBufferAsync(store.request))
      return responderTaskAction(store, type, payload)
    }) ]
  ].filter(Boolean)

  return {
    URL_HTML,
    URL_TASK_ACTION,
    routeList
  }
}

export { configureFeaturePack }
