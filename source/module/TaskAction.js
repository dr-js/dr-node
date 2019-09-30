import { join, resolve, relative } from 'path'
import { spawn } from 'child_process'

import { getTimestamp } from '@dr-js/core/module/common/time'
import { string, boolean, basicArray, basicObject } from '@dr-js/core/module/common/verify'

import { statAsync, openAsync, truncateAsync, readFileAsync, writeFileAsync, createReadStream } from '@dr-js/core/module/node/file/function'
import { createPathPrefixLock, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { getDirectorySubInfoList, createDirectory } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'
import {
  getProcessListAsync,
  toProcessPidMap, findProcessPidMapInfo,
  toProcessTree, findProcessTreeInfo,
  killProcessTreeInfoAsync,
  getAllProcessStatusAsync, describeAllProcessStatusAsync,
  isPidExist
} from '@dr-js/core/module/node/system/Process'

const TASK_CONFIG_SET = 'task-config:set'
const TASK_CONFIG_GET = 'task-config:get'

const TASK_START = 'task:start'
const TASK_STOP = 'task:stop'
const TASK_DELETE = 'task:delete'
const TASK_LIST = 'task:list'

const TASK_LOG_GET = 'task-log:get'
const TASK_LOG_GET_TAIL = 'task-log:get-tail'
const TASK_LOG_RESET = 'task-log:reset'

const PROCESS_STATUS = 'process-status'

const TASK_ACTION_TYPE = { // NOTE: should always refer action type form here
  TASK_CONFIG_SET,
  TASK_CONFIG_GET,
  TASK_START,
  TASK_STOP,
  TASK_DELETE,
  TASK_LIST,
  TASK_LOG_GET,
  TASK_LOG_GET_TAIL,
  TASK_LOG_RESET,
  PROCESS_STATUS
}

const FILE_TASK_CONFIG = 'task.config.json'
const FILE_TASK_LOG = 'task.log'

// Task
//   key
//   task
//     command: ''
//     argList: []
//     cwd: ''
//     env: {}
//     shell: true
//     resetLog: true
//   info
//     note: '' | [ '' ] | {} | whatever
//     timeCreate
//     timeUpdate
//   status
//     processInfo { pid, command, subTree }
//     timeStart

const REGEXP_TASK_KEY = /^\w[\w-.|]*$/

const verifyString = (value, valueName) => {
  if (!value) throw new Error(`missing ${valueName}`)
  string(value, `invalid ${valueName}`)
  if (!value.length) throw new Error(`expect value in ${valueName}`)
}

const verifyAndFormatConfig = ({ key, task, info = {} }, getPath) => {
  verifyString(key, 'key')
  if (!REGEXP_TASK_KEY.test(key)) throw new Error(`invalid key, get: ${key}, expect: ${REGEXP_TASK_KEY}`)

  basicObject(task, 'invalid task')
  const taskPath = getPath(key)
  const { command, argList = [], cwd = taskPath, env = {}, shell = true, resetLog = true } = task
  verifyString(command, 'task.command')
  basicArray(argList, 'invalid task.argList')
  basicObject(env, 'invalid task.env')
  boolean(shell, 'invalid task.shell')
  boolean(resetLog, 'invalid task.resetLog')
  task = { command, argList, cwd: toPosixPath(relative(taskPath, resolve(taskPath, cwd))), env, shell, resetLog }

  basicObject(info, 'invalid info')
  const { note } = info
  const timeCreate = getTimestamp()
  info = { note, timeCreate, timeUpdate: timeCreate }

  return { key, task, info, status: null }
}

const updateConfig = (prevConfig, { key, task, info }) => ({ key, task, info: { ...info, timeCreate: prevConfig.info.timeCreate }, status: null })

const startDetachedProcess = async ({ command, argList, cwd, env, shell = true }, logFile) => {
  __DEV__ && console.log('[startDetachedProcess]', { command, argList, cwd, env, shell }, logFile)

  const subProcess = spawn(command, argList, {
    // TODO: log not piped to file, but lost in sub-shell for process like `@dr-js/core --sss` (win32 at least)
    stdio: [ 'ignore', await openAsync(logFile, 'a'), await openAsync(logFile, 'a') ],
    cwd,
    env,
    shell,
    detached: true,
    windowsHide: true
  })
  subProcess.on('error', (error) => { console.warn('[ERROR][startDetachedProcess] config:', { command, argList, cwd, env, shell }, 'error:', error) })
  subProcess.unref()

  {
    const processList = await getProcessListAsync()
    const subProcessInfo = toProcessPidMap(processList)[ subProcess.pid ]
    if (!subProcessInfo || subProcessInfo.ppid !== process.pid) {
      // if (subProcessInfo) subProcess.kill() // TODO: good to send signal?
      throw new Error(`sub process info not found, expect pid: ${subProcess.pid}, ppid: ${process.pid}`)
    }
    const { pid, command, subTree } = findProcessTreeInfo(subProcessInfo, toProcessTree(processList)) // drops ppid since sub tree may get chopped
    __DEV__ && console.log('[startDetachedProcess] processInfo:', { pid, command, subTree })
    return { process: subProcess, processInfo: { pid, command, subTree } }
  }
}

const existTaskProcessAsync = async ({ status }) => status && status.processInfo &&
  isPidExist(status.processInfo.pid) &&
  findProcessPidMapInfo(status.processInfo, toProcessPidMap(await getProcessListAsync()))

const onLoadConfigError = (error) => {
  __DEV__ && console.log('[loadConfig] error', error)
  return null
}

const createTaskAction = (rootPath) => { // relativePath should be under rootPath
  __DEV__ && console.log('[TaskAction]', { rootPath })
  const getPath = createPathPrefixLock(rootPath)

  const getConfigPath = (key) => getPath(join(key, FILE_TASK_CONFIG))
  const getLogPath = (key) => getPath(join(key, FILE_TASK_LOG))

  // add cacheMap here?
  const saveConfig = (config) => writeFileAsync(getConfigPath(config.key), JSON.stringify(config))
  const loadConfig = async (key) => JSON.parse(await readFileAsync(getConfigPath(key)))

  const TASK_ACTION_MAP = {
    [ TASK_CONFIG_SET ]: async (payload) => {
      let config = verifyAndFormatConfig(payload, getPath)
      const existConfig = await loadConfig(config.key).catch(onLoadConfigError)
      if (existConfig && await existTaskProcessAsync(existConfig)) throw new Error(`config task running`)
      if (existConfig) config = updateConfig(existConfig, config)
      await createDirectory(getPath(config.key))
      await saveConfig(config)
    },
    [ TASK_CONFIG_GET ]: ({ key }) => loadConfig(key).catch(onLoadConfigError),
    [ TASK_START ]: async ({ key }) => {
      const config = await loadConfig(key)
      if (await existTaskProcessAsync(config)) throw new Error(`task exist`)
      config.task.resetLog && await TASK_ACTION_MAP[ TASK_LOG_RESET ]({ key })
      const { processInfo } = await startDetachedProcess(config.task, getLogPath(key))
      await saveConfig({ ...config, status: { processInfo, timeStart: getTimestamp() } })
    },
    [ TASK_STOP ]: async ({ key }) => {
      const config = await loadConfig(key)
      config.status && config.status.processInfo && await killProcessTreeInfoAsync(config.status.processInfo)
      await saveConfig({ ...config, status: null })
    },
    [ TASK_DELETE ]: async ({ key }) => {
      const config = await loadConfig(key)
      if (await existTaskProcessAsync(config)) throw new Error(`task process running at: ${config.status.processInfo.pid}`)
      await modifyDelete(getPath(key))
    },
    [ TASK_LIST ]: async () => {
      const configList = []
      for (const { name, stat } of await getDirectorySubInfoList(rootPath).catch(() => [])) {
        const config = stat.isDirectory() && await loadConfig(name).catch(onLoadConfigError)
        config && configList.push(config)
      }
      return { configList }
    },
    [ TASK_LOG_GET ]: async ({ key }) => ({ resultStream: createReadStream(getLogPath(key)) }),
    [ TASK_LOG_GET_TAIL ]: async ({ key, tailSize = 4 * 1024 }) => {
      const logPath = getLogPath(key)
      const { size } = await statAsync(logPath)
      return { resultStream: createReadStream(logPath, { start: Math.max(size - tailSize, 0) }) } // TODO: may cut multi-byte UTF8
    },
    [ TASK_LOG_RESET ]: async ({ key }) => truncateAsync(getLogPath(key)),
    [ PROCESS_STATUS ]: async ({ outputMode = 'tree', isHumanReadableOutput = true }) => ({
      processStatus: await (isHumanReadableOutput ? describeAllProcessStatusAsync : getAllProcessStatusAsync)(outputMode)
    })
  }

  return async (type, payload) => {
    __DEV__ && console.log('[TaskAction]', type, payload)
    const extraData = await TASK_ACTION_MAP[ type ](payload)
    return { type, ...extraData }
  }
}

export {
  TASK_ACTION_TYPE,
  createTaskAction
}
