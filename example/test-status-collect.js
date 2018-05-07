const { createServer } = require('../output-gitignore/library/sampleServer/statusCollect')

const SERVER_TAG = 'status-collect'

const main = async () => {
  const { start, timer } = await createServer({
    // pathLogDirectory: `${__dirname}/log-${SERVER_TAG}-gitignore`,
    // prefixLogFile: SERVER_TAG,
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuthConfig: `${__dirname}/.timed-lookup-gitignore.key`,

    url: `http://localhost:8001/status-report`,
    pathFactDirectory: `${__dirname}/fact-${SERVER_TAG}-gitignore`,
    // delay: 2 * 1000,

    protocol: 'http:',
    hostname: 'localhost',
    port: 8002
  })

  start()
  timer.start()
}

main().catch(console.error)
