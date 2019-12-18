const { startServer } = require('../output-gitignore/bin/runServer')

const SERVER_TAG = 'stat-report'

startServer({
  port: 8003,
  filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`
}, {
  isDebugRoute: true,
  permissionType: 'allow',
  authFile: `${__dirname}/.timed-lookup-gitignore.key`,
  statReportProcessTag: SERVER_TAG
})
  .then(({ featureStatReport }) => setInterval(() => featureStatReport.reportStat('http://127.0.0.1:8002/stat-collect'), 5000)) // push stat
  .catch(console.error)
