const { createServer } = require('../output-gitignore/sample/explorer')

const SERVER_TAG = 'explorer'

const main = async () => {
  const { start } = await createServer({
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuth: `${__dirname}/.timed-lookup-gitignore.key`,
    // fileTokenCache: `${__dirname}/.token-cache-gitignore.json`,
    shouldAuthGen: true,

    uploadRootPath: `${__dirname}/${SERVER_TAG}-gitignore`,
    uploadMergePath: `${__dirname}/${SERVER_TAG}-merge-gitignore`,

    protocol: 'http:',
    hostname: 'localhost',
    port: 8003
  })

  start()
}

main().catch(console.error)
