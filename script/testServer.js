import { resolve } from 'path'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'

import { catchAsync } from 'dr-js/module/common/error'
import { stringifyEqual } from 'dr-js/module/common/verify'
import { setTimeoutAsync } from 'dr-js/module/common/time'
import { readFileAsync, writeFileAsync } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { modify } from 'dr-js/module/node/file/Modify'
import { run, runQuiet } from 'dr-js/module/node/system/Run'
import { getProcessList, getProcessPidMap, getProcessTree, findProcessTreeNode, checkProcessExist, tryKillProcessTreeNode } from 'dr-js/module/node/system/ProcessStatus'

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
  host: 'localhost:8000',
  pidFile: './server-test.pid',
  authFile: './server-test.auth',
  authGen: true,
  authGenTag: 'SERVER_TEST',
  permissionType: 'file',
  permissionFile: './server-permission.config.js',
  explorerRootPath: './path-upload',
  explorerUploadMergePath: './path-upload.merge',
  taskRunnerRootPath: './task-runner'
})

const FILE_NODE_PATH_ACTION_CONFIG = fromTemp('node-path-action.config.json')
const TEXT_NODE_PATH_ACTION_CONFIG = JSON.stringify({
  quiet: true,
  nodePathAction: true,
  pathActionServerUrl: 'http://localhost:8000/path-action',
  pathActionType: 'path-content',
  pathActionKey: '',
  nodeAuthFile: './server-test.auth'
})

const FILE_NODE_FILE_UPLOAD_CONFIG = fromTemp('node-file-upload.config.json')
const TEXT_NODE_FILE_UPLOAD_CONFIG = JSON.stringify({
  nodeFileUpload: true,
  fileUploadServerUrl: 'http://localhost:8000/file-chunk-upload',
  fileUploadPath: './test-file',
  fileUploadKey: 'test-file.upload',
  nodeAuthFile: './server-test.auth'
})

const FILE_NODE_FILE_DOWNLOAD_CONFIG = fromTemp('node-file-download.config.json')
const TEXT_NODE_FILE_DOWNLOAD_CONFIG = JSON.stringify({
  nodeFileDownload: true,
  fileDownloadServerUrl: 'http://localhost:8000/file-serve',
  fileDownloadPath: './path-upload/test-file.download',
  fileDownloadKey: 'test-file.upload',
  nodeAuthFile: './server-test.auth'
})

const FILE_TEST = fromTemp('test-file')

runMain(async ({ padLog, stepLog }) => {
  await modify.delete(PATH_TEMP).catch(() => {})
  await createDirectory(PATH_TEMP)

  const { error } = await catchAsync(async () => {
    padLog(`create config`)
    await writeFileAsync(FILE_SERVER_PERMISSION_CONFIG, TEXT_SERVER_PERMISSION_CONFIG)
    await writeFileAsync(FILE_SERVER_CONFIG, TEXT_SERVER_CONFIG)
    await writeFileAsync(FILE_NODE_PATH_ACTION_CONFIG, TEXT_NODE_PATH_ACTION_CONFIG)
    await writeFileAsync(FILE_NODE_FILE_UPLOAD_CONFIG, TEXT_NODE_FILE_UPLOAD_CONFIG)
    await writeFileAsync(FILE_NODE_FILE_DOWNLOAD_CONFIG, TEXT_NODE_FILE_DOWNLOAD_CONFIG)
    await writeFileAsync(FILE_TEST, await readFileAsync(fromRoot('package-lock.json')))

    padLog(`start server`)
    const { subProcess, promise } = run({
      command: 'node',
      argList: [ fromOutput('bin/index.js'), '-c', FILE_SERVER_CONFIG ],
      option: execOptionTemp
    })
    const exitPromise = promise.catch((error) => __DEV__ && console.log(`server exit: ${error}`))
    await setTimeoutAsync(500) // wait for a bit
    if (!await checkProcessExist({ pid: subProcess.pid })) throw new Error('failed to start server')
    const processList = await getProcessList()
    const subProcessInfo = (await getProcessPidMap(processList))[ subProcess.pid ]
    const { pid, command, subTree } = await findProcessTreeNode(subProcessInfo, await getProcessTree(processList)) // drops ppid since sub tree may get chopped
    __DEV__ && console.log({ pid, command, subTree })
    stepLog('start server done')

    const { error } = await catchAsync(async () => {
      const getPathContentJSON = async () => JSON.parse(await runQuiet({
        command: 'node',
        argList: [ fromOutput('bin/index.js'), '-c', FILE_NODE_PATH_ACTION_CONFIG ],
        option: { cwd: fromTemp(), shell: true }
      }).stdoutBufferPromise)

      padLog('test node path action')
      const pathContentPre = await getPathContentJSON()
      console.log(JSON.stringify(pathContentPre))
      stringifyEqual(pathContentPre.resultList[ 0 ].actionType, 'path-content')
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
      stringifyEqual(pathContentPost.resultList[ 0 ].actionType, 'path-content')
      stringifyEqual(pathContentPost.resultList[ 0 ].directoryList, [])
      stringifyEqual(pathContentPost.resultList[ 0 ].fileList.map(([ name ]) => name).sort(), [ 'test-file.download', 'test-file.upload' ])
      stepLog('test node path action done')
    })

    padLog('stop server')
    await tryKillProcessTreeNode({ pid, command, subTree })
    await exitPromise
    stepLog('stop server done')

    if (error) throw error
  })

  await modify.delete(PATH_TEMP)
  if (error) throw error
}, getLogger('test-server', argvFlag('quiet')))
