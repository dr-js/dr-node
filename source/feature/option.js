import { Preset } from 'dr-js/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

// uploadRootPath, uploadMergePath
const ExplorerFormatConfig = parseCompact('explorer-root-path/SP,O', parseCompactList(
  'explorer-upload-merge-path/SP'
))
const getExplorerOption = ({ tryGetFirst }) => ({
  explorerRootPath: tryGetFirst('explorer-root-path'),
  explorerUploadMergePath: tryGetFirst('explorer-upload-merge-path')
})

// statusCollectPath, statusCollectUrl, statusCollectInterval
const StatusCollectFormatConfig = parseCompact('status-collect-path/SP,O', parseCompactList(
  'status-collect-url/SS,O',
  'status-collect-interval/SI,O'
))
const getStatusCollectOption = ({ tryGetFirst }) => ({
  statusCollectPath: tryGetFirst('status-collect-path'),
  statusCollectUrl: tryGetFirst('status-collect-url'),
  statusCollectInterval: tryGetFirst('status-collect-interval')
})

// statusReportProcessTag
const StatusReportFormatConfig = parseCompact('status-report-process-tag/SS,O')
const getStatusReportOption = ({ tryGetFirst }) => ({
  statusReportProcessTag: tryGetFirst('status-report-process-tag')
})

const TaskRunnerFormatConfig = parseCompact('task-runner-root-path/SP,O')
const getTaskRunnerOption = ({ tryGetFirst }) => ({
  taskRunnerRootPath: tryGetFirst('task-runner-root-path')
})

export {
  ExplorerFormatConfig, getExplorerOption,
  StatusCollectFormatConfig, getStatusCollectOption,
  StatusReportFormatConfig, getStatusReportOption,
  TaskRunnerFormatConfig, getTaskRunnerOption
}
