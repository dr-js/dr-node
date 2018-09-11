const { createServer } = require('../output-gitignore/sample/statusReport')

const SERVER_TAG = 'status-report'

const main = async () => {
  const { start, reportStatus } = await createServer({
    // pathLogDirectory: `${__dirname}/log-${SERVER_TAG}-gitignore`,
    // logFilePrefix: SERVER_TAG,
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,

    protocol: 'http:',
    hostname: 'localhost',
    port: 8001
  })

  start()

  // push status
  setInterval(() => {
    reportStatus('http://localhost:8002/status-collect')
  }, 5000)
}

main().catch(console.error)
