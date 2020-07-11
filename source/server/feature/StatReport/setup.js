import { responderSendJSON } from '@dr-js/core/module/node/server/Responder/Send'

import { createGetStatReport } from 'source/module/Stat/StatReport' // TODO: move to ActionJSON?

const setup = async ({
  name = 'feature:stat-report',
  logger, routePrefix = '',
  featureAuth: { authPack: { authFetch }, createResponderCheckAuth },

  statReportProcessTag,

  URL_STAT_REPORT = `${routePrefix}/stat-report`
}) => {
  const getStatReport = createGetStatReport(statReportProcessTag)

  const routeList = [
    [ URL_STAT_REPORT, 'GET', createResponderCheckAuth({
      responderNext: (store) => responderSendJSON(store, { object: getStatReport() })
    }) ]
  ]

  const reportStat = async (url) => { // TODO: move out
    const { status } = await authFetch(url, { method: 'POST', body: JSON.stringify(getStatReport()) })
    __DEV__ && console.log('reported status:', status)
  }

  return {
    reportStat,

    URL_STAT_REPORT,
    routeList,
    name
  }
}

export { setup }
