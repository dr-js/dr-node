const { describeServer } = require('dr-js/bin/function')
const { createServer } = require('../output-gitignore/sample/server')

const SERVER_TAG = 'status-report'

const main = async () => {
  const { option, start, featureStatusReport } = await createServer({
    port: 8003,

    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    permissionType: 'allow',

    authFile: `${__dirname}/.timed-lookup-gitignore.key`,
    authFileGenTag: 'DEV_TAG',

    statusReportProcessTag: SERVER_TAG
  })

  await start()
  console.log(describeServer(option, SERVER_TAG))

  // push status
  setInterval(() => featureStatusReport.reportStatus('http://localhost:8002/status-collect'), 5000)
}

main().catch(console.error)
