const { createServer } = require('../output-gitignore/sample/statusCollect')

const SERVER_TAG = 'status-collect'

const main = async () => {
  const { start, featureStatusCollect } = await createServer({
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,

    statusCollectPath: `${__dirname}/fact-${SERVER_TAG}-gitignore`,
    statusCollectUrl: `http://localhost:8001/status-report`,
    // statusCollectInterval: 2 * 1000,

    protocol: 'http:',
    hostname: 'localhost',
    port: 8002
  })

  start()
  featureStatusCollect.timer.start()
}

main().catch(console.error)
