import { resolve } from 'path'

import { withRunBackground } from 'dr-dev/module/node/run'
import { withTempDirectory } from 'dr-dev/module/node/file'
import { runMain, argvFlag } from 'dr-dev/module/main'

import { stringifyEqual } from 'dr-js/module/common/verify'
import { readFileAsync, writeFileAsync } from 'dr-js/module/node/file/function'
import { modifyDeleteForce } from 'dr-js/module/node/file/Modify'
import { run, runQuiet } from 'dr-js/module/node/system/Run'

import { PATH_ACTION_TYPE } from 'source/feature/Explorer/task/pathAction'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_TEMP = resolve(__dirname, '../.temp-gitignore/test-server')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromTemp = (...args) => resolve(PATH_TEMP, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

const execOptionTemp = { cwd: fromTemp(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

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

const FILE_SERVER_CONFIG = fromTemp('server.config.json')
const TEXT_SERVER_CONFIG = JSON.stringify({
  host: '127.0.0.1:8000',
  pidFile: './server-test.pid',
  permissionType: 'file',
  permissionFile: './server-permission.config.js',
  authFile: './server-test.auth',
  authFileGenTag: 'SERVER_TEST',
  explorerRootPath: './path-upload',
  explorerUploadMergePath: './path-upload.merge',
  taskRunnerRootPath: './task-runner'
})

const FILE_NODE_PATH_ACTION_CONFIG = fromTemp('node-path-action.config.json')
const TEXT_NODE_PATH_ACTION_CONFIG = JSON.stringify({
  quiet: true,
  nodeAuthFile: './server-test.auth',
  nodePathAction: true,
  pathActionServerUrl: 'http://127.0.0.1:8000/path-action',
  pathActionType: PATH_ACTION_TYPE.DIRECTORY_CONTENT,
  pathActionKey: ''
})

const FILE_NODE_FILE_UPLOAD_CONFIG = fromTemp('node-file-upload.config.json')
const TEXT_NODE_FILE_UPLOAD_CONFIG = JSON.stringify({
  nodeAuthFile: './server-test.auth',
  nodeFileUpload: true,
  fileUploadServerUrl: 'http://127.0.0.1:8000/file-chunk-upload',
  fileUploadPath: './test-file',
  fileUploadKey: 'test-file.upload'
})

const FILE_NODE_FILE_DOWNLOAD_CONFIG = fromTemp('node-file-download.config.json')
const TEXT_NODE_FILE_DOWNLOAD_CONFIG = JSON.stringify({
  nodeAuthFile: './server-test.auth',
  nodeFileDownload: true,
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
    await writeFileAsync(FILE_NODE_PATH_ACTION_CONFIG, TEXT_NODE_PATH_ACTION_CONFIG)
    await writeFileAsync(FILE_NODE_FILE_UPLOAD_CONFIG, TEXT_NODE_FILE_UPLOAD_CONFIG)
    await writeFileAsync(FILE_NODE_FILE_DOWNLOAD_CONFIG, TEXT_NODE_FILE_DOWNLOAD_CONFIG)
    await writeFileAsync(FILE_TEST, await readFileAsync(fromRoot('package-lock.json')))

    padLog(`start server`)
    await withRunBackground({
      command: 'node',
      argList: [ fromOutput('bin/index.js'), '-c', FILE_SERVER_CONFIG ],
      option: execOptionTemp
    }, async () => {
      stepLog('start server done')

      const getPathContentJSON = async () => {
        const { promise, stdoutBufferPromise, stderrBufferPromise } = runQuiet({
          command: 'node',
          argList: [ fromOutput('bin/index.js'), '-c', FILE_NODE_PATH_ACTION_CONFIG ],
          option: { cwd: fromTemp(), shell: true }
        })
        await promise.catch(async (error) => {
          console.error('[error]', error)
          console.error('[stderrString]', String(await stderrBufferPromise))
        })
        return JSON.parse(await stdoutBufferPromise)
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
        argList: [ fromOutput('bin/index.js'), '-c', FILE_NODE_FILE_UPLOAD_CONFIG ],
        option: execOptionTemp
      }).promise
      stepLog('test node file upload done')

      padLog('test node file download')
      await run({
        command: 'node',
        argList: [ fromOutput('bin/index.js'), '-c', FILE_NODE_FILE_DOWNLOAD_CONFIG ],
        option: execOptionTemp
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
