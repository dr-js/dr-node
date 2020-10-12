const { setupServer, setupServerExotGroup } = require('../output-gitignore/bin/runServer')

const SERVER_TAG = 'stat-report'

setupServer({
  port: 8003,
  filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`
}, {
  isDebugRoute: true,
  permissionType: 'allow',
  authFile: `${__dirname}/.timed-lookup-gitignore.key`,
  statReportProcessTag: SERVER_TAG
})
  .then(async ({ exotGroup, serverExot, loggerExot }) => {
    await setupServerExotGroup({ exotGroup, serverExot, loggerExot })
    setInterval(
      () => serverExot.featureMap.get('feature:stat-report')
        .reportStat('http://127.0.0.1:8002/stat-collect') // push stat
        .catch((error) => console.log('[report-error]', error)),
      5000
    ).unref()
  })
  .catch(console.error)
