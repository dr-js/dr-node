import { responderSendJSON, responderSendStream } from '@dr-js/core/module/node/server/Responder/Send'

import { createTaskAction } from './task/taskAction'

const createResponderTaskAction = ({ rootPath, logger }) => {
  const getTaskAction = createTaskAction(rootPath)
  return async (store, type, payload) => {
    logger.add(`[task-action|${type}]`)
    const { stream, ...result } = await getTaskAction(type, payload)
    return stream
      ? responderSendStream(store, { stream })
      : responderSendJSON(store, { object: result })
  }
}

export { createResponderTaskAction }
