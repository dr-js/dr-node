import { join, resolve, relative } from 'path'
import { spawn } from 'child_process'

import { getTimestamp } from 'dr-js/module/common/time'
import { string, boolean, basicArray, basicObject } from 'dr-js/module/common/verify'

import { statAsync, openAsync, truncateAsync, readFileAsync, writeFileAsync, createReadStream, createPathPrefixLock, toPosixPath } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { getDirectorySubInfoList } from 'dr-js/module/node/file/Directory'
import { modify } from 'dr-js/module/node/file/Modify'
import { getProcessList, getProcessPidMap, getProcessTree, findProcessTreeNode, checkProcessExist, tryKillProcessTreeNode } from 'dr-js/module/node/system/ProcessStatus'
import { collectAllProcessStatus } from 'dr-js/bin/function'

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
    // TODO: log not piped to file, but lost in sub-shell for process like `dr-js --sss` (win32 at least)
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
    const processList = await getProcessList()
    const subProcessInfo = (await getProcessPidMap(processList))[ subProcess.pid ]
    if (!subProcessInfo || subProcessInfo.ppid !== process.pid) {
      // if (subProcessInfo) subProcess.kill() // TODO: good to send signal?
      throw new Error(`[startDetachedProcess] sub process info not found, expect pid: ${subProcess.pid}, ppid: ${process.pid}`)
    }
    const { pid, command, subTree } = await findProcessTreeNode(subProcessInfo, await getProcessTree(processList)) // drops ppid since sub tree may get chopped
    __DEV__ && console.log('[startDetachedProcess] processInfo:', { pid, command, subTree })
    return { process: subProcess, processInfo: { pid, command, subTree } }
  }
}

const existTaskProcess = ({ status }, processPidMap) => status && status.processInfo && checkProcessExist(status.processInfo, processPidMap)

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

  const taskAction = {
    'set-task-config': async (payload) => {
      let config = verifyAndFormatConfig(payload, getPath)
      const existConfig = await loadConfig(config.key).catch(onLoadConfigError)
      if (existConfig && await existTaskProcess(existConfig)) throw new Error(`config task running`)
      if (existConfig) config = updateConfig(existConfig, config)
      await createDirectory(getPath(config.key))
      await saveConfig(config)
    },
    'get-task-config': ({ key }) => loadConfig(key).catch(onLoadConfigError),
    'start-task': async ({ key }) => {
      const config = await loadConfig(key)
      if (await existTaskProcess(config)) throw new Error(`task exist`)
      config.task.resetLog && await taskAction[ 'reset-task-log' ]({ key })
      const { processInfo } = await startDetachedProcess(config.task, getLogPath(key))
      await saveConfig({ ...config, status: { processInfo, timeStart: getTimestamp() } })
    },
    'stop-task': async ({ key }) => {
      const config = await loadConfig(key)
      config.status && config.status.processInfo && await tryKillProcessTreeNode(config.status.processInfo)
      await saveConfig({ ...config, status: null })
    },
    'delete-task': async ({ key }) => {
      const config = await loadConfig(key)
      if (await existTaskProcess(config)) throw new Error(`task process running at: ${config.status.processInfo.pid}`)
      await modify.delete(getPath(key))
    },
    'list-task': async () => {
      const configList = []
      for (const { name, stat } of await getDirectorySubInfoList(rootPath).catch(() => [])) {
        const config = stat.isDirectory() && await loadConfig(name).catch(onLoadConfigError)
        config && configList.push(config)
      }
      return { configList }
    },
    'get-task-log': async ({ key }) => ({ stream: createReadStream(getLogPath(key)) }),
    'get-task-log-tail': async ({ key, tailSize = 4 * 1024 }) => {
      const logPath = getLogPath(key)
      const { size } = await statAsync(logPath)
      return { stream: createReadStream(logPath, { start: Math.max(size - tailSize, 0) }) } // TODO: may break UTF8 char
    },
    'reset-task-log': async ({ key }) => truncateAsync(getLogPath(key)),
    'process-status': async ({ outputMode = 'tree', isHumanReadableOutput = true }) => ({
      processStatus: await collectAllProcessStatus(outputMode, isHumanReadableOutput)
    })
  }

  return async (type, payload) => {
    __DEV__ && console.log('[TaskAction]', type, payload)
    const extraData = await taskAction[ type ](payload)
    return { type, ...extraData }
  }
}

export { createTaskAction }