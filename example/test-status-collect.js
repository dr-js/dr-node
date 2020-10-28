const { runServer } = require('../output-gitignore/library/server/share/configure')
const { configureSampleServer } = require('../output-gitignore/bin/sampleServer')

const SERVER_TAG = 'stat-collect'

runServer(configureSampleServer, {
  port: 8002,
  filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`
}, {
  isDebugRoute: true,
  permissionType: 'allow',
  authFile: `${__dirname}/.timed-lookup-gitignore.key`,
  statCollectPath: `${__dirname}/fact-${SERVER_TAG}-gitignore`,
  statCollectUrl: 'http://127.0.0.1:8003/stat-report'
  // statCollectInterval: 2 * 1000,
}, SERVER_TAG)
  .then(({ serverExot }) => { serverExot.featureMap.get('feature:stat-collect').exotList[ 0 ].timer.start() })
  .catch(console.error)
