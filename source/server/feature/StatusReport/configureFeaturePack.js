import { responderSendJSON } from '@dr-js/core/module/node/server/Responder/Send'

import { createGetStatusReport } from './task/statusReport'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',
  featureAuth: { authPack: { authFetch }, createResponderCheckAuth },

  statusReportProcessTag
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
