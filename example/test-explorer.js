const { runServer } = require('../output-gitignore/bin/runServer')

const SERVER_TAG = 'explorer'

runServer({
  hostname: '0.0.0.0',
  port: 8001,
  filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`
}, {
  isDebugRoute: true,
  permissionType: 'allow',
  authFile: `${__dirname}/.timed-lookup-gitignore.key`,
  fileRootPath: `${__dirname}/${SERVER_TAG}-gitignore`,
  fileUploadMergePath: `${__dirname}/${SERVER_TAG}-merge-gitignore`,
  explorer: true
})
  .catch(console.error)
