import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

// explorerRootPath, explorerUploadMergePath
const ExplorerFormatConfig = parseCompact('explorer-root-path/SP,O', parseCompactList(
  'explorer-upload-merge-path/SP'
))
const getExplorerOption = ({ tryGetFirst }) => ({
  explorerRootPath: tryGetFirst('explorer-root-path'),
  explorerUploadMergePath: tryGetFirst('explorer-upload-merge-path')
})

export { ExplorerFormatConfig, getExplorerOption }
