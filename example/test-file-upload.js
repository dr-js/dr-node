const { createServer } = require('../output-gitignore/library/sampleServer/fileUpload')

const SERVER_TAG = 'file-upload'

const main = async () => {
  const { start } = await createServer({
    // pathLogDirectory: `${__dirname}/log-${SERVER_TAG}-gitignore`,
    // prefixLogFile: SERVER_TAG,
    filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`,
    fileAuthConfig: `${__dirname}/.timed-lookup-gitignore.key`,

    // url: `http://localhost:8001/status-report`,
    // pathFactDirectory: `${__dirname}/fact-${SERVER_TAG}-gitignore`,
    // delay: 2 * 1000,
    uploadRootPath: `${__dirname}/${SERVER_TAG}-gitignore`,
    uploadMergePath: `${__dirname}/${SERVER_TAG}-merge-gitignore`,

    protocol: 'http:',
    hostname: 'localhost',
    port: 8003
  })

  start()
}

main().catch(console.error)
