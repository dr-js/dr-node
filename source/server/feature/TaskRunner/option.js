import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact } = Preset

const TaskRunnerFormatConfig = parseCompact('task-runner-root-path/SP,O')
const getTaskRunnerOption = ({ tryGetFirst }) => ({
  taskRunnerRootPath: tryGetFirst('task-runner-root-path')
})

export { TaskRunnerFormatConfig, getTaskRunnerOption }
