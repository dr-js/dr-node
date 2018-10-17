const { describeServer } = require('dr-js/bin/function')
const { createServer } = require('../output-gitignore/sample/explorer')

const SERVER_TAG = 'explorer'

const main = async () => {
  const { option, start } = await createServer({
    port: 8003,

    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,
    shouldAuthGen: true,

    uploadRootPath: `${__dirname}/${SERVER_TAG}-gitignore`,
    uploadMergePath: `${__dirname}/${SERVER_TAG}-merge-gitignore`
  })

  await start()
  console.log(describeServer(option, SERVER_TAG))
}

main().catch(console.error)
