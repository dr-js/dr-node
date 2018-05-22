const { createServer } = require('../output-gitignore/sample/statusReport')

const SERVER_TAG = 'status-report'

const main = async () => {
  const { start } = await createServer({
    // pathLogDirectory: `${__dirname}/log-${SERVER_TAG}-gitignore`,
    // prefixLogFile: SERVER_TAG,
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuthConfig: `${__dirname}/.timed-lookup-gitignore.key`,

    protocol: 'http:',
    hostname: 'localhost',
    port: 8001
  })

  start()
}

main().catch(console.error)
