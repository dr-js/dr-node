import { resolve } from 'path'

import { withRunBackground } from '@dr-js/dev/module/node/run'
import { withTempDirectory } from '@dr-js/dev/module/node/file'
import { runMain } from '@dr-js/dev/module/main'

import { stringifyEqual } from '@dr-js/core/module/common/verify'
import { readFileAsync, writeFileAsync } from '@dr-js/core/module/node/file/function'
import { modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'
import { run } from '@dr-js/core/module/node/system/Run'

import { PATH_ACTION_TYPE } from 'source/module/PathAction'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_TEMP = resolve(__dirname, '../.temp-gitignore/test-server')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromTemp = (...args) => resolve(PATH_TEMP, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

const FILE_SERVER_PERMISSION_CONFIG = fromTemp('server-permission.config.js')
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

const FILE_AUTH_KEY = fromTemp('auth.key')
const FILE_SERVER_CONFIG = fromTemp('server.config.json')
const TEXT_SERVER_CONFIG = JSON.stringify({
  host: '127.0.0.1:8000',
  pidFile: './server-test.pid',
  permissionType: 'file',
  permissionFile: './server-permission.config.js',
  authFile: FILE_AUTH_KEY,
  explorerRootPath: './path-upload',
  explorerUploadMergePath: './path-upload.merge',
  taskRunnerRootPath: './task-runner'
})

const FILE_CLIENT_PATH_ACTION_CONFIG = fromTemp('client-path-action.config.json')
const TEXT_CLIENT_PATH_ACTION_CONFIG = JSON.stringify({
  authFile: FILE_AUTH_KEY,
  pathActionServerUrl: 'http://127.0.0.1:8000/path-action',
  pathActionType: PATH_ACTION_TYPE.DIRECTORY_CONTENT,
  pathActionKey: ''
})

const FILE_CLIENT_FILE_UPLOAD_CONFIG = fromTemp('client-file-upload.config.json')
const TEXT_CLIENT_FILE_UPLOAD_CONFIG = JSON.stringify({
  authFile: FILE_AUTH_KEY,
  fileUploadServerUrl: 'http://127.0.0.1:8000/file-chunk-upload',
  fileUploadPath: './test-file',
  fileUploadKey: 'test-file.upload'
})

const FILE_CLIENT_FILE_DOWNLOAD_CONFIG = fromTemp('client-file-download.config.json')
const TEXT_CLIENT_FILE_DOWNLOAD_CONFIG = JSON.stringify({
  authFile: FILE_AUTH_KEY,
  fileDownloadServerUrl: 'http://127.0.0.1:8000/file-serve',
  fileDownloadPath: './path-upload/test-file.download',
  fileDownloadKey: 'test-file.upload'
})

const FILE_TEST = fromTemp('test-file')

runMain(async ({ padLog, stepLog }) => {
  padLog(`create test directory`)
  await modifyDeleteForce(PATH_TEMP)
  await withTempDirectory(PATH_TEMP, async () => {
    stepLog('create test directory done')

    padLog(`create config`)
    await writeFileAsync(FILE_SERVER_PERMISSION_CONFIG, TEXT_SERVER_PERMISSION_CONFIG)
    await writeFileAsync(FILE_SERVER_CONFIG, TEXT_SERVER_CONFIG)
    await writeFileAsync(FILE_CLIENT_PATH_ACTION_CONFIG, TEXT_CLIENT_PATH_ACTION_CONFIG)
    await writeFileAsync(FILE_CLIENT_FILE_UPLOAD_CONFIG, TEXT_CLIENT_FILE_UPLOAD_CONFIG)
    await writeFileAsync(FILE_CLIENT_FILE_DOWNLOAD_CONFIG, TEXT_CLIENT_FILE_DOWNLOAD_CONFIG)
    await writeFileAsync(FILE_TEST, await readFileAsync(fromRoot('package-lock.json')))

    padLog(`create FILE_AUTH_KEY`)
    await run({
      command: 'node',
      argList: [ fromOutput('bin/index.js'), '-O', FILE_AUTH_KEY, '--auth-gen-tag', 'TEST_SERVER_AUTH' ]
    }).promise

    padLog(`start server`)
    await withRunBackground({
      command: 'node',
      argList: [ fromOutput('bin/index.js'), '-c', FILE_SERVER_CONFIG ]
    }, async () => {
      stepLog('start server done')

      const FILE_PATH_CONTENT_OUTPUT = fromTemp('path-content.json')
      const getPathContentJSON = async () => {
        const { promise, stderrPromise } = run({
          command: 'node',
          argList: [ fromOutput('bin/index.js'), '-c', FILE_CLIENT_PATH_ACTION_CONFIG, '-O', FILE_PATH_CONTENT_OUTPUT ]
        })
        await promise.catch(async (error) => {
          console.error('[error]', error)
          console.error('[stderrString]', String(await stderrPromise))
        })
        return JSON.parse(await readFileAsync(FILE_PATH_CONTENT_OUTPUT))
      }

      padLog('test node path action')
      const pathContentPre = await getPathContentJSON()
      console.log(JSON.stringify(pathContentPre))
      stringifyEqual(pathContentPre.resultList[ 0 ].actionType, PATH_ACTION_TYPE.DIRECTORY_CONTENT)
      stringifyEqual(pathContentPre.resultList[ 0 ].directoryList, [])
      stringifyEqual(pathContentPre.resultList[ 0 ].fileList, [])
      stepLog('test node path action done')

      padLog('test node file upload')
      await run({
        command: 'node',
        argList: [ fromOutput('bin/index.js'), '-c', FILE_CLIENT_FILE_UPLOAD_CONFIG ]
      }).promise
      stepLog('test node file upload done')

      padLog('test node file download')
      await run({
        command: 'node',
        argList: [ fromOutput('bin/index.js'), '-c', FILE_CLIENT_FILE_DOWNLOAD_CONFIG ]
      }).promise
      stepLog('test node file download done')

      padLog('test node path action')
      const pathContentPost = await getPathContentJSON()
      console.log(JSON.stringify(pathContentPost))
      stringifyEqual(pathContentPost.resultList[ 0 ].actionType, PATH_ACTION_TYPE.DIRECTORY_CONTENT)
      stringifyEqual(pathContentPost.resultList[ 0 ].directoryList, [])
      stringifyEqual(pathContentPost.resultList[ 0 ].fileList.map(([ name ]) => name).sort(), [ 'test-file.download', 'test-file.upload' ])
      stepLog('test node path action done')

      padLog('stop server')
    })
    stepLog('stop server done')
  })
}, 'test-server')
