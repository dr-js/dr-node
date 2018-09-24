import { fetchLikeRequest } from 'dr-js/module/node/net'
import { responderSendJSON } from 'dr-js/module/node/server/Responder/Send'

import { createGetStatusReport } from './task/getStatusReport'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',

  statusReportProcessTag,

  // TODO: maybe less specific, or optional?
  wrapResponderCheckAuthCheckCode = (responder) => responder,
  generateAuthCheckCode = () => ''
}) => {
  const URL_STATUS_REPORT = `${routePrefix}/status-report`

  const getStatusReport = createGetStatusReport(statusReportProcessTag)

  const routeList = [
    [ URL_STATUS_REPORT, 'GET', wrapResponderCheckAuthCheckCode((store) => responderSendJSON(store, { object: getStatusReport() })) ]
  ]

  const reportStatus = async (url) => { // TODO: move out
    const { status } = await fetchLikeRequest(url, {
      method: 'POST',
      headers: { 'auth-check-code': generateAuthCheckCode() },
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
