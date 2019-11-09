const taskListStyle = `<style>
h2, h6 { margin: 0.5em 4px; }
.item { display: flex; flex-flow: row nowrap; align-items: stretch; }
.item:hover { background: var(--c-fill-s); }
.name { overflow:hidden; flex: 1; white-space:nowrap; text-align: left; text-overflow: ellipsis; background: transparent; }
.item .name { pointer-events: none; color: #888; }
.edit { pointer-events: auto; min-width: 1.5em; min-height: auto; line-height: normal; }
</style>`

// TODO: add drag selection

const initTaskList = (
  URL_PATH_ACTION,
  TASK_ACTION_TYPE,
  authFetch,
  withAlertModal,
  withConfirmModal,
  withPromptModal,
  withPromptExtModal
) => {
  const {
    cE, aCL,
    Dr: { Common: { Compare: { compareString, compareStringWithNumber }, Math: { getRandomId } } }
  } = window

  const KEY = (a, b) => compareString(a.key, b.key)
  const COMMAND = (a, b) => compareStringWithNumber(a.task.command, b.task.command) || KEY(a, b)
  const NOTE = (a, b) => compareStringWithNumber(a.info.note, b.info.note) || COMMAND(a, b)
  const TIME_CREATE = (a, b) => b.info.timeCreate - a.info.timeCreate || COMMAND(a, b) // newer first
  const TIME_UPDATE = (a, b) => b.info.timeUpdate - a.info.timeUpdate || COMMAND(a, b) // newer first

  const SORT_FUNC = { COMMAND, NOTE, TIME_CREATE, TIME_UPDATE }
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
    const { configList } = await authFetchTaskActionJSON(TASK_ACTION_TYPE.TASK_LIST)
    taskListStore.setState({ configList })
  }

  const getTaskActionAsync = (taskListStore) => async (type, payload) => {
    await authFetchTaskActionJSON(type, payload)
    await getLoadTaskListAsync(taskListStore)
  }

  const getSetTaskConfigAsync = (taskAction) => async (config = { key: getRandomId('Task-'), task: {}, info: {} }) => {
    const resultList = await withPromptExtModal([
      [ 'task.command', config.task.command || '' ],
      [ 'task.argList', JSON.stringify(config.task.argList) || '[]' ],
      [ 'task.cwd', config.task.cwd || '' ],
      [ 'task.env', JSON.stringify(config.task.env) || '{}' ],
      [ 'task.shell', config.task.shell || 'true' ],
      [ 'task.resetLog', config.task.resetLog || 'true' ],
      [ 'info.note', config.info.note || '' ]
    ])
    if (!resultList) return
    const [
      taskCommand,
      taskArgList,
      taskCwd,
      taskEnv,
      taskShell,
      taskResetLog,
      infoNote
    ] = resultList
    return taskAction(TASK_ACTION_TYPE.TASK_CONFIG_SET, {
      key: config.key,
      task: {
        command: taskCommand,
        argList: JSON.parse(taskArgList),
        cwd: taskCwd,
        env: JSON.parse(taskEnv),
        shell: taskShell === 'true',
        resetLog: taskResetLog === 'true'
      },
      info: {
        note: infoNote
      }
    })
  }

  const renderTaskList = (taskListStore, parentElement, loadTaskList, taskAction, setTaskConfigAsync) => {
    const { taskSortType, configList } = taskListStore.getState()

    const TEXT_DETAIL = '🔎'
    const TEXT_EDIT = '🔧'
    const TEXT_START = '▶️'
    const TEXT_STOP = '⏹'
    const TEXT_LOG = '📃'
    const TEXT_LOG_RESET = '♻️'
    const TEXT_DELETE = '🗑️'

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
            cE('span', { className: 'name button', innerText: `📄|${info.note ? `[Note] ${info.note} ` : ``}[Command] ${task.command}` }),
            cE('button', { className: 'edit', innerText: TEXT_DETAIL, onclick: async () => withAlertModal(JSON.stringify(config, null, 2)) }),
            cE('button', { className: 'edit', innerText: TEXT_EDIT, disabled: isRunning, onclick: () => setTaskConfigAsync(config) }),
            cE('button', { className: 'edit', innerText: isRunning ? TEXT_STOP : TEXT_START, onclick: async () => (await withConfirmModal(`${isRunning ? 'Stop' : 'Start'} task: ${key}?`)) && taskAction(isRunning ? TASK_ACTION_TYPE.TASK_STOP : TASK_ACTION_TYPE.TASK_START, config) }),
            cE('button', { className: 'edit', innerText: TEXT_LOG, onclick: async () => withAlertModal((await authFetchTaskActionText((await withConfirmModal(`Get tail instead of full log for task: ${config.key}?`, 'Tail log', 'Full log')) ? TASK_ACTION_TYPE.TASK_LOG_GET_TAIL : TASK_ACTION_TYPE.TASK_LOG_GET, config)) || '[no log]') }),
            cE('button', { className: 'edit', innerText: TEXT_LOG_RESET, onclick: async () => (await withConfirmModal(`Reset log of task: ${key}?`)) && taskAction(TASK_ACTION_TYPE.TASK_LOG_RESET, config) }),
            cE('button', { className: 'edit', innerText: TEXT_DELETE, disabled: isRunning, onclick: async () => (await withConfirmModal(`Delete task: ${key}?`)) && taskAction(TASK_ACTION_TYPE.TASK_DELETE, config) })
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
    getSetTaskConfigAsync,
    renderTaskList
  }
}

export { taskListStyle, initTaskList }
