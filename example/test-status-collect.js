const { getServerInfo } = require('dr-js/bin/server/function')
const { createServer } = require('../output-gitignore/sample/statusCollect')

const SERVER_TAG = 'status-collect'

const main = async () => {
  const { option, start, featureStatusCollect } = await createServer({
    port: 8002,

    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,
    shouldAuthGen: true,

    statusCollectPath: `${__dirname}/fact-${SERVER_TAG}-gitignore`,
    statusCollectUrl: `http://localhost:8001/status-report`
    // statusCollectInterval: 2 * 1000,
  })

  await start()
  featureStatusCollect.timer.start()
  console.log(getServerInfo(SERVER_TAG, option.protocol, option.hostname, option.port))
}

main().catch(console.error)
