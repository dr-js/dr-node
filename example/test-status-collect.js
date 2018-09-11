const { createServer } = require('../output-gitignore/sample/statusCollect')

const SERVER_TAG = 'status-collect'

const main = async () => {
  const { start, timer } = await createServer({
    // pathLogDirectory: `${__dirname}/log-${SERVER_TAG}-gitignore`,
    // logFilePrefix: SERVER_TAG,
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
  timer.start()
}

main().catch(console.error)
