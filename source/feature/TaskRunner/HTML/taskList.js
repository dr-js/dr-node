const taskListStyle = `<style>
h2, h6 { margin: 0.5em 4px; }
.item { display: flex; flex-flow: row nowrap; align-items: stretch; }
.item:hover { background: #eee; }
.name { overflow:hidden; flex: 1; white-space:nowrap; text-align: left; text-overflow: ellipsis; background: transparent; }
.item .name { pointer-events: none; color: #666; }
.edit { pointer-events: auto; min-width: 1.5em; min-height: auto; line-height: normal; }
</style>`

// TODO: add drag selection

const initTaskList = (
  URL_PATH_ACTION,
  authFetch,
  withAlertModal,
  withConfirmModal,
  withPromptModal,
  withPromptExtModal
) => {
  const {
    cE, aCL,
    Dr: { Common: { Compare: { compareString } } }
  } = window

  const SORT_FUNC = {
    KEY: ({ key: a }, { key: b }) => compareString(a, b),
    COMMAND: ({ task: { command: a } }, { task: { command: b } }) => compareString(a, b),
    TIME_CREATE: ({ info: { timeCreate: a } }, { info: { timeCreate: b } }) => b - a // newer first
  }
  const SORT_TYPE_LIST = Object.keys(SORT_FUNC)

  const initialTaskListState = {
    taskSortType: SORT_TYPE_LIST[ 0 ],
    configList: []
  }

  const authFetchTaskActionJSON = async (type, payload = {}) => (await authFetch(URL_PATH_ACTION, { method: 'POST', body: JSON.stringify({ type, payload }) })).json()
  const authFetchTaskActionText = async (type, payload = {}) => (await authFetch(URL_PATH_ACTION, { method: 'POST', body: JSON.stringify({ type, payload }) })).text()

  const cycleTaskSortType = (taskListStore, taskSortType = taskListStore.getState().taskSortType) => {
    const nextSortIndex = (SORT_TYPE_LIST.indexOf(taskSortType) + 1) % SORT_TYPE_LIST.length
    taskListStore.setState({ taskSortType: SORT_TYPE_LIST[ nextSortIndex ] })
  }

  const getLoadTaskListAsync = async (taskListStore) => {
    const { configList } = await authFetchTaskActionJSON('list-task')
    taskListStore.setState({ configList })
  }

  const getTaskActionAsync = (taskListStore) => async (type, payload) => {
    await authFetchTaskActionJSON(type, payload)
    await getLoadTaskListAsync(taskListStore)
  }

  const renderTaskList = (taskListStore, parentElement, loadTaskList, taskAction) => {
    const { taskSortType, configList } = taskListStore.getState()

    const TEXT_DETAIL = '🔎'
    const TEXT_EDIT = '🔧'
    const TEXT_START = '▶️'
    const TEXT_STOP = '⏹'
    const TEXT_LOG = '📃'
    const TEXT_LOG_RESET = '♻️'
    const TEXT_DELETE = '🗑️'

    const doEditConfig = async (config) => {
      const resultList = await withPromptExtModal([
        [ 'task.command', config.task.command ],
        [ 'task.argList', JSON.stringify(config.task.argList) ],
        [ 'task.cwd', config.task.cwd ],
        [ 'task.env', JSON.stringify(config.task.env) ],
        [ 'task.shell', config.task.shell ],
        [ 'info.note', config.info.note ]
      ])
      if (!resultList) return
      const [
        taskCommand,
        taskArgListRaw,
        taskCwd,
        taskEnvRaw,
        taskShellRaw,
        infoNote
      ] = resultList
      const taskArgList = JSON.parse(taskArgListRaw)
      const taskEnv = JSON.parse(taskEnvRaw)
      const taskShell = taskShellRaw === 'true'
      return taskAction('set-task-config', {
        key: config.key,
        task: { command: taskCommand, argList: taskArgList, cwd: taskCwd, env: taskEnv, shell: taskShell },
        info: { note: infoNote }
      })
    }

    parentElement.innerHTML = ''
    aCL(parentElement, [
      cE('h2', { innerText: 'Task List' }),
      cE('h6', { innerText: `${configList.length} task` }),

      ...configList
        .sort(SORT_FUNC[ taskSortType ])
        .map((config) => {
          const { key, task, info, status } = config
          const isRunning = Boolean(status && status.processInfo)
          return cE('div', { className: 'item' }, [
            cE('span', { className: 'name button', innerText: `📄|${key} - ${info.note || task.command}` }),
            cE('button', { className: 'edit', innerText: TEXT_DETAIL, onclick: async () => withAlertModal(JSON.stringify(config, null, 2)) }),
            cE('button', { className: 'edit', innerText: TEXT_EDIT, disabled: isRunning, onclick: async () => doEditConfig(config) }),
            cE('button', { className: 'edit', innerText: isRunning ? TEXT_STOP : TEXT_START, onclick: async () => (await withConfirmModal(`${isRunning ? 'Stop' : 'Start'} task: ${key}?`)) && taskAction(isRunning ? 'stop-task' : 'start-task', config) }),
            cE('button', { className: 'edit', innerText: TEXT_LOG, onclick: async () => withAlertModal((await authFetchTaskActionText((await withConfirmModal(`Get tail instead of full log for task: ${config.key}?`, 'Tail log', 'Full log')) ? 'get-task-log-tail' : 'get-task-log', config)) || '[no log]') }),
            cE('button', { className: 'edit', innerText: TEXT_LOG_RESET, onclick: async () => (await withConfirmModal(`Reset log of task: ${key}?`)) && taskAction('reset-task-log', config) }),
            cE('button', { className: 'edit', innerText: TEXT_DELETE, disabled: isRunning, onclick: async () => (await withConfirmModal(`Delete task: ${key}?`)) && taskAction('delete-task', config) })
          ])
        })
    ])
  }

  return {
    initialTaskListState,
    cycleTaskSortType,
    authFetchTaskActionJSON,
    getLoadTaskListAsync,
    getTaskActionAsync,
    renderTaskList
  }
}

export { taskListStyle, initTaskList }
