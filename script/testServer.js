import { stringifyEqual } from '@dr-js/core/module/common/verify.js'
import { writeText, readJSON } from '@dr-js/core/module/node/fs/File.js'
import { resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { modifyCopy } from '@dr-js/core/module/node/fs/Modify.js'
import { run } from '@dr-js/core/module/node/run.js'
import { runKit } from '@dr-js/core/module/node/kit.js'

import { withTempDirectory } from '@dr-js/dev/module/node/file.js'
import { withRunBackground } from '@dr-js/dev/module/node/run.js'

import { ACTION_TYPE } from 'source/module/ActionJSON/path.js'

const TEXT_SERVER_PERMISSION_CONFIG = `
module.exports = {
  configurePermission: (option) => {
    console.log('DEBUG CODE INJECT !!permissionFunc!!', option)
    return {
      checkPermission: (type, { store, extra }) => {
        console.log('DEBUG CODE INJECT !!checkPermission!!', { type }, JSON.stringify(store.getState().timedLookupData))
        return true
      }
    }
  }
}
`

runKit(async (kit) => {
  const FILE_SERVER_PERMISSION_CONFIG = kit.fromTemp('test-server/server-permission.config.js')

  const FILE_AUTH_KEY = kit.fromTemp('test-server/auth.key')
  const FILE_SERVER_CONFIG = kit.fromTemp('test-server/server.config.json')
  const TEXT_SERVER_CONFIG = JSON.stringify({
    host: '127.0.0.1:8000',
    pidFile: './server-test.pid',
    permissionType: 'file',
    permissionFile: './server-permission.config.js',
    authFile: FILE_AUTH_KEY,
    fileRootPath: './path-upload',
    fileUploadMergePath: './path-upload.merge',
    explorer: true
  })

  const FILE_CLIENT_PATH_ACTION_CONFIG = kit.fromTemp('test-server/client-path-action.config.json')
  const TEXT_CLIENT_PATH_ACTION_CONFIG = JSON.stringify({
    authFile: FILE_AUTH_KEY,
    pathActionServerUrl: 'http://127.0.0.1:8000/action-json',
    pathActionType: ACTION_TYPE.PATH_DIRECTORY_CONTENT,
    pathActionKey: ''
  })

  const FILE_CLIENT_FILE_UPLOAD_CONFIG = kit.fromTemp('test-server/client-file-upload.config.json')
  const TEXT_CLIENT_FILE_UPLOAD_CONFIG = JSON.stringify({
    authFile: FILE_AUTH_KEY,
    fileUploadServerUrl: 'http://127.0.0.1:8000/file-chunk-upload',
    fileUploadPath: './test-file',
    fileUploadKey: 'test-file.upload'
  })

  const FILE_CLIENT_FILE_DOWNLOAD_CONFIG = kit.fromTemp('test-server/client-file-download.config.json')
  const TEXT_CLIENT_FILE_DOWNLOAD_CONFIG = JSON.stringify({
    authFile: FILE_AUTH_KEY,
    fileDownloadServerUrl: 'http://127.0.0.1:8000/file-serve',
    fileDownloadPath: './path-upload/test-file.download',
    fileDownloadKey: 'test-file.upload'
  })

  const FILE_TEST = kit.fromTemp('test-server/test-file')

  kit.padLog('create test directory')
  await resetDirectory(kit.fromTemp('test-server/'))
  await withTempDirectory(kit.fromTemp('test-server/'), async () => {
    kit.stepLog('create test directory done')

    kit.padLog('create config')
    await writeText(FILE_SERVER_PERMISSION_CONFIG, TEXT_SERVER_PERMISSION_CONFIG)
    await writeText(FILE_SERVER_CONFIG, TEXT_SERVER_CONFIG)
    await writeText(FILE_CLIENT_PATH_ACTION_CONFIG, TEXT_CLIENT_PATH_ACTION_CONFIG)
    await writeText(FILE_CLIENT_FILE_UPLOAD_CONFIG, TEXT_CLIENT_FILE_UPLOAD_CONFIG)
    await writeText(FILE_CLIENT_FILE_DOWNLOAD_CONFIG, TEXT_CLIENT_FILE_DOWNLOAD_CONFIG)
    await modifyCopy(kit.fromRoot('package-lock.json'), FILE_TEST)

    const commandBin = [ process.execPath, kit.fromOutput('bin/index.js') ]

    kit.padLog('create FILE_AUTH_KEY')
    await run([ ...commandBin, '-O', FILE_AUTH_KEY, '--auth-gen-tag', 'TEST_SERVER_AUTH' ]).promise

    kit.padLog('start server')
    await withRunBackground({ command: process.execPath, argList: [ kit.fromOutput('bin/index.js'), '-c', FILE_SERVER_CONFIG ] }, async () => {
      kit.stepLog('start server done')

      const FILE_PATH_CONTENT_OUTPUT = kit.fromTemp('test-server/path-content.json')
      const getPathContentJSON = async () => {
        const { promise, stderrPromise } = run([ ...commandBin, '-c', FILE_CLIENT_PATH_ACTION_CONFIG, '-O', FILE_PATH_CONTENT_OUTPUT ])
        await promise.catch(async (error) => {
          console.error('[error]', error)
          console.error('[stderrString]', String(await stderrPromise))
        })
        return readJSON(FILE_PATH_CONTENT_OUTPUT)
      }

      kit.padLog('test node path action')
      const pathContentPre = await getPathContentJSON()
      console.log(JSON.stringify(pathContentPre))
      stringifyEqual(pathContentPre.resultList[ 0 ].actionType, ACTION_TYPE.PATH_DIRECTORY_CONTENT)
      stringifyEqual(pathContentPre.resultList[ 0 ].directoryList, [])
      stringifyEqual(pathContentPre.resultList[ 0 ].fileList, [])
      kit.stepLog('test node path action done')

      kit.padLog('test node file upload')
      await run([ ...commandBin, '-c', FILE_CLIENT_FILE_UPLOAD_CONFIG ]).promise
      kit.stepLog('test node file upload done')

      kit.padLog('test node file download')
      await run([ ...commandBin, '-c', FILE_CLIENT_FILE_DOWNLOAD_CONFIG ]).promise
      kit.stepLog('test node file download done')

      kit.padLog('test node path action')
      const pathContentPost = await getPathContentJSON()
      console.log(JSON.stringify(pathContentPost))
      stringifyEqual(pathContentPost.resultList[ 0 ].actionType, ACTION_TYPE.PATH_DIRECTORY_CONTENT)
      stringifyEqual(pathContentPost.resultList[ 0 ].directoryList, [])
      stringifyEqual(pathContentPost.resultList[ 0 ].fileList.map(([ name ]) => name).sort(), [ 'test-file.download', 'test-file.upload' ])
      kit.stepLog('test node path action done')

      kit.padLog('stop server')
    })
    kit.stepLog('stop server done')
  })
}, { title: 'test-server' })
