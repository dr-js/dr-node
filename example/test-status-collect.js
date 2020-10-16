const { runServer } = require('../output-gitignore/bin/runServer')

const SERVER_TAG = 'stat-collect'

runServer({
  port: 8002,
  filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`
}, {
  isDebugRoute: true,
  permissionType: 'allow',
  authFile: `${__dirname}/.timed-lookup-gitignore.key`,
  statCollectPath: `${__dirname}/fact-${SERVER_TAG}-gitignore`,
  statCollectUrl: 'http://127.0.0.1:8003/stat-report'
  // statCollectInterval: 2 * 1000,
})
  .then(({ serverExot }) => { serverExot.featureMap.get('feature:stat-collect').exotList[ 0 ].timer.start() })
  .catch(console.error)
