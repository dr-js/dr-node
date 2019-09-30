import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

// explorerRootPath, explorerUploadMergePath
const ExplorerFormatConfig = parseCompact('explorer-root-path/SP,O', parseCompactList(
  'explorer-upload-merge-path/SP',
  'explorer-status-command-list/O' // check source/module/ServerStatus.js COMMON_SERVER_STATUS_COMMAND_LIST
))
const getExplorerOption = ({ tryGetFirst }) => ({
  explorerRootPath: tryGetFirst('explorer-root-path'),
  explorerUploadMergePath: tryGetFirst('explorer-upload-merge-path'),
  explorerStatusCommandList: tryGetFirst('explorer-status-command-list')
})

export { ExplorerFormatConfig, getExplorerOption }
