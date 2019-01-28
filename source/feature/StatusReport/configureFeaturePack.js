import { fetchLikeRequest } from 'dr-js/module/node/net'
import { responderSendJSON } from 'dr-js/module/node/server/Responder/Send'

import { createGetStatusReport } from './task/statusReport'

const DEFAULT_AUTH_KEY = 'auth-check-code'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  statusReportProcessTag,

  // TODO: maybe less specific, or optional?
  authKey = DEFAULT_AUTH_KEY,
  createResponderCheckAuth = ({ responderNext }) => responderNext,
  generateAuth = () => ''
}) => {
  const URL_STATUS_REPORT = `${routePrefix}/status-report`

  const getStatusReport = createGetStatusReport(statusReportProcessTag)

  const routeList = [
    [ URL_STATUS_REPORT, 'GET', createResponderCheckAuth({
      responderNext: (store) => responderSendJSON(store, { object: getStatusReport() })
    }) ]
  ]

  const reportStatus = async (url) => { // TODO: move out
    const { status } = await fetchLikeRequest(url, {
      method: 'POST',
      headers: { [ authKey ]: await generateAuth() },
      body: JSON.stringify(getStatusReport())
    })
    __DEV__ && console.log('reported status:', status)
  }

  return {
    URL_STATUS_REPORT,
    routeList,
    reportStatus
  }
}

export { configureFeaturePack }
