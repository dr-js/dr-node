import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact } = Preset

const ExplorerFormatConfig = parseCompact('explorer/T')
const getExplorerOption = ({ tryGetFirst }) => ({
  explorer: tryGetFirst('explorer')
})

export { ExplorerFormatConfig, getExplorerOption }
