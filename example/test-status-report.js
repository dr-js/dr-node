const { createServer } = require('../output-gitignore/sample/statusReport')

const SERVER_TAG = 'status-report'

const main = async () => {
  const { start, featureStatusReport } = await createServer({
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,

    protocol: 'http:',
    hostname: 'localhost',
    port: 8001
  })

  start()

  // push status
  setInterval(() => {
    featureStatusReport.reportStatus('http://localhost:8002/status-collect')
  }, 5000)
}

main().catch(console.error)
