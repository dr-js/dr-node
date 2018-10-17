const { getServerInfo } = require('dr-js/bin/server/function')
const { createServer } = require('../output-gitignore/sample/statusReport')

const SERVER_TAG = 'status-report'

const main = async () => {
  const { option, start, featureStatusReport } = await createServer({
    port: 8001,

    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,
    shouldAuthGen: true
  })

  await start()
  console.log(getServerInfo(SERVER_TAG, option.protocol, option.hostname, option.port))

  // push status
  setInterval(() => featureStatusReport.reportStatus('http://localhost:8002/status-collect'), 5000)
}

main().catch(console.error)
