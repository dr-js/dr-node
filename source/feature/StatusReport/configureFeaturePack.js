import { fetchLikeRequest } from 'dr-js/module/node/net'
import { responderSendJSON } from 'dr-js/module/node/server/Responder/Send'

import { createGetStatusReport } from './task/statusReport'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  statusReportProcessTag,

  createResponderCheckAuth = ({ responderNext }) => responderNext,
  authFetch = fetchLikeRequest
}) => {
  const URL_STATUS_REPORT = `${routePrefix}/status-report`

  const getStatusReport = createGetStatusReport(statusReportProcessTag)

  const routeList = [
    [ URL_STATUS_REPORT, 'GET', createResponderCheckAuth({
      responderNext: (store) => responderSendJSON(store, { object: getStatusReport() })
    }) ]
  ]

  const reportStatus = async (url) => { // TODO: move out
    const { status } = await authFetch(url, { method: 'POST', body: JSON.stringify(getStatusReport()) })
    __DEV__ && console.log('reported status:', status)
  }

  return {
    URL_STATUS_REPORT,
    routeList,
    reportStatus
  }
}

export { configureFeaturePack }
