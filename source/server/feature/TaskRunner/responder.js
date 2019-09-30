import { responderSendJSON, responderSendStream } from '@dr-js/core/module/node/server/Responder/Send'

import { createTaskAction } from 'source/module/TaskAction'

const createResponderTaskAction = ({ rootPath, logger }) => {
  const getTaskAction = createTaskAction(rootPath)
  return async (store, type, payload) => {
    logger.add(`[task-action|${type}]`)
    const { resultStream, ...result } = await getTaskAction(type, payload)
    return resultStream
      ? responderSendStream(store, { stream: resultStream })
      : responderSendJSON(store, { object: result })
  }
}

export { createResponderTaskAction }
