import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT } from 'dr-js/module/node/server/commonHTML'

import { DR_BROWSER_SCRIPT } from 'source/HTML/function'
import { initModal } from 'source/HTML/Modal'
import { initAuthMask } from 'source/HTML/AuthMask'
import { initLoadingMask } from 'source/HTML/LoadingMask'

import { taskListStyle, initTaskList } from './taskList'

const getHTML = ({
  IS_SKIP_AUTH = false,
  URL_AUTH_CHECK,
  URL_TASK_ACTION
}) => COMMON_LAYOUT([
  `<title>Task Runner</title>`,
  COMMON_STYLE(),
  mainStyle,
  taskListStyle
], [
  `<div id="control-panel" style="overflow-x: auto; white-space: nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="main-panel" style="position: relative; overflow: auto; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT({
    IS_SKIP_AUTH,
    URL_AUTH_CHECK,
    URL_TASK_ACTION,
    initModal,
    initLoadingMask,
    initAuthMask,
    initTaskList,
    onload: onLoadFunc
  }),
  DR_BROWSER_SCRIPT()
])

const mainStyle = `<style>
* { font-family: monospace; }
</style>`

const onLoadFunc = () => {
  const {
    location,
    qS, cE, aCL,

    IS_SKIP_AUTH,
    URL_AUTH_CHECK, URL_TASK_ACTION,
    initModal, initLoadingMask, initAuthMask, initTaskList,

    Dr: {
      Common: { Immutable: { StateStore: { createStateStore } }, Math: { getRandomId } }
    }
  } = window

  const initTaskRunner = async ({ authRevoke, authFetch }) => {
    const { withAlertModal, withConfirmModal, withPromptModal, withPromptExtModal } = initModal()
    const { initialLoadingMaskState, wrapLossyLoading, renderLoadingMask } = initLoadingMask()
    const {
      initialTaskListState, cycleTaskSortType, authFetchTaskActionJSON, getLoadTaskListAsync, getTaskActionAsync, renderTaskList
    } = initTaskList(URL_TASK_ACTION, authFetch, withAlertModal, withConfirmModal, withPromptModal, withPromptExtModal)

    const loadingMaskStore = createStateStore(initialLoadingMaskState)
    const taskListStore = createStateStore(initialTaskListState)

    const loadTaskList = wrapLossyLoading(loadingMaskStore, getLoadTaskListAsync(taskListStore))
    const taskAction = wrapLossyLoading(loadingMaskStore, getTaskActionAsync(taskListStore))

    const showProcessStatus = wrapLossyLoading(loadingMaskStore, async () => {
      const { processStatus } = await authFetchTaskActionJSON('process-status')
      await withAlertModal(processStatus)
    })

    const createNewTask = async () => {
      const resultList = await withPromptExtModal([
        [ 'key (immutable)', getRandomId('Task-') ],
        [ 'task.command', '' ],
        [ 'task.argList', '[]' ],
        [ 'task.cwd', '' ],
        [ 'task.env', '{}' ],
        [ 'task.shell', 'true' ],
        [ 'info.note', '' ]
      ])
      if (!resultList) return
      const [
        key,
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
        key,
        task: { command: taskCommand, argList: taskArgList, cwd: taskCwd, env: taskEnv, shell: taskShell },
        info: { note: infoNote }
      })
    }

    const updateSort = () => { qS('#button-sort').innerText = `Sort: ${taskListStore.getState().taskSortType}` }
    const cycleSort = () => {
      cycleTaskSortType(taskListStore)
      updateSort()
    }

    loadingMaskStore.subscribe(() => renderLoadingMask(loadingMaskStore))
    taskListStore.subscribe(() => renderTaskList(taskListStore, qS('#main-panel'), loadTaskList, taskAction))

    aCL(qS('#control-panel'), [
      cE('button', { innerText: 'Refresh', onclick: () => loadTaskList() }),
      cE('button', { id: 'button-sort', onclick: cycleSort }),
      cE('span', { innerText: '|' }),
      cE('button', { innerText: 'New Task', onclick: createNewTask }),
      cE('span', { innerText: '|' }),
      cE('button', { innerText: 'Process Status', onclick: () => showProcessStatus() }),
      cE('button', { innerText: 'Auth Revoke', onclick: () => authRevoke().then(() => location.reload()) })
    ])

    updateSort()

    if (__DEV__) window.DEBUG = { loadingMaskStore, taskListStore }
  }

  initAuthMask({
    urlAuthCheck: URL_AUTH_CHECK,
    onAuthPass: initTaskRunner,
    isSkipAuth: IS_SKIP_AUTH
  })
}

export { getHTML }
