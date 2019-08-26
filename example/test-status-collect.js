const { describeServer } = require('@dr-js/core/bin/function')
const { createServer } = require('../output-gitignore/sample/server')

const SERVER_TAG = 'status-collect'

const main = async () => {
  const { option, start, featureStatusCollect } = await createServer({
    port: 8002,

    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    permissionType: 'allow',

    authFile: `${__dirname}/.timed-lookup-gitignore.key`,
    authFileGenTag: 'DEV_TAG',

    statusCollectPath: `${__dirname}/fact-${SERVER_TAG}-gitignore`,
    statusCollectUrl: `http://127.0.0.1:8003/status-report`
    // statusCollectInterval: 2 * 1000,
  })

  await start()
  featureStatusCollect.timer.start()
  console.log(describeServer(option, SERVER_TAG))
}

main().catch(console.error)
