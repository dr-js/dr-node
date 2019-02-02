const { describeServer } = require('dr-js/bin/function')
const { createServer } = require('../output-gitignore/sample/server')

const SERVER_TAG = 'explorer'

const main = async () => {
  const { option, start } = await createServer({
    port: 8001,

    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,
    shouldAuthGen: true,
    permissionType: 'allow',

    explorerRootPath: `${__dirname}/${SERVER_TAG}-gitignore`,
    explorerUploadMergePath: `${__dirname}/${SERVER_TAG}-merge-gitignore`
  })

  await start()
  console.log(describeServer(option, SERVER_TAG))
}

main().catch(console.error)
