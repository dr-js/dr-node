const { createServer } = require('../output-gitignore/sample/pathContent')

const SERVER_TAG = 'path-content'

const main = async () => {
  const { start } = await createServer({
    // pathLogDirectory: `${__dirname}/log-${SERVER_TAG}-gitignore`,
    // prefixLogFile: SERVER_TAG,
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuthConfig: `${__dirname}/.timed-lookup-gitignore.key`,
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
