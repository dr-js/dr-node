const { startServer } = require('../output-gitignore/bin/runServer')

const SERVER_TAG = 'explorer'

startServer({
  port: 8001,
  filePid: `${__dirname}/.${SERVER_TAG}-gitignore.pid`
}, {
  isDebugRoute: true,
  permissionType: 'allow',
  authFile: `${__dirname}/.timed-lookup-gitignore.key`,
  explorerRootPath: `${__dirname}/${SERVER_TAG}-gitignore`,
  explorerUploadMergePath: `${__dirname}/${SERVER_TAG}-merge-gitignore`
})
  .catch(console.error)
