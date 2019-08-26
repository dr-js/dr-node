import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT } from '@dr-js/core/module/node/server/commonHTML'
import { DR_BROWSER_SCRIPT_TAG } from '@dr-js/core/module/node/resource'

import { initModal } from 'source/server/share/HTML/Modal'
import { initLoadingMask } from 'source/server/share/HTML/LoadingMask'

import { initAuthMask } from 'source/server/feature/Auth/HTML'

import { taskListStyle, initTaskList } from './taskList'

const getHTML = ({
  URL_AUTH_CHECK,
  URL_TASK_ACTION,
  IS_SKIP_AUTH = false,
  TASK_ACTION_TYPE
}) => COMMON_LAYOUT([
  `<title>Task Runner</title>`,
  COMMON_STYLE(),
  mainStyle,
  taskListStyle
], [
  `<div id="control-panel" style="overflow-x: auto; white-space: nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="main-panel" style="position: relative; overflow: auto; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT({
    URL_AUTH_CHECK,
    URL_TASK_ACTION,
    IS_SKIP_AUTH,
    TASK_ACTION_TYPE,
    initModal,
    initLoadingMask,
    initAuthMask,
    initTaskList,
    onload: onLoadFunc
  }),
  DR_BROWSER_SCRIPT_TAG()
])

const mainStyle = `<style>
* { font-family: monospace; }
</style>`

const onLoadFunc = () => {
  const {
    location,
    qS, cE, aCL,

    URL_AUTH_CHECK, URL_TASK_ACTION,
    IS_SKIP_AUTH, TASK_ACTION_TYPE,
    initModal, initLoadingMask, initAuthMask, initTaskList,

    Dr: {
      Common: { Immutable: { StateStore: { createStateStore } } }
    }
  } = window

  const initTaskRunner = async ({ authRevoke, authFetch }) => {
    const { withAlertModal, withConfirmModal, withPromptModal, withPromptExtModal } = initModal()
    const { initialLoadingMaskState, wrapLossyLoading, renderLoadingMask } = initLoadingMask()
    const {
      initialTaskListState, cycleTaskSortType, authFetchTaskActionJSON, getLoadTaskListAsync, getTaskActionAsync, getSetTaskConfigAsync, renderTaskList
    } = initTaskList(
      URL_TASK_ACTION,
      TASK_ACTION_TYPE,
      authFetch,
      withAlertModal,
      withConfirmModal,
      withPromptModal,
      withPromptExtModal
    )

    const loadingMaskStore = createStateStore(initialLoadingMaskState)
    const taskListStore = createStateStore(initialTaskListState)

    const loadTaskList = wrapLossyLoading(loadingMaskStore, getLoadTaskListAsync(taskListStore))
    const taskAction = wrapLossyLoading(loadingMaskStore, getTaskActionAsync(taskListStore))
    const setTaskConfigAsync = getSetTaskConfigAsync(taskAction)

    const showProcessStatus = wrapLossyLoading(loadingMaskStore, async () => {
      const { processStatus } = await authFetchTaskActionJSON(TASK_ACTION_TYPE.PROCESS_STATUS)
      await withAlertModal(processStatus)
    })

    const updateSort = () => { qS('#button-sort').innerText = `Sort: ${taskListStore.getState().taskSortType}` }
    const cycleSort = () => {
      cycleTaskSortType(taskListStore)
      updateSort()
    }

    loadingMaskStore.subscribe(() => renderLoadingMask(loadingMaskStore))
    taskListStore.subscribe(() => renderTaskList(taskListStore, qS('#main-panel'), loadTaskList, taskAction, setTaskConfigAsync))

    aCL(qS('#control-panel'), [
      cE('button', { innerText: 'Refresh', onclick: () => loadTaskList() }),
      cE('button', { id: 'button-sort', onclick: cycleSort }),
      cE('span', { innerText: '|' }),
      cE('button', { innerText: 'New Task', onclick: () => setTaskConfigAsync() }),
      cE('span', { innerText: '|' }),
      cE('button', { innerText: 'Process Status', onclick: () => showProcessStatus() }),
      cE('button', { innerText: 'Auth Revoke', onclick: () => authRevoke().then(() => location.reload()) })
    ])

    updateSort()

    if (__DEV__) window.DEBUG = { loadingMaskStore, taskListStore }
  }

  initAuthMask({
    IS_SKIP_AUTH,
    URL_AUTH_CHECK,
    onAuthPass: initTaskRunner
  })
}

export { getHTML }
