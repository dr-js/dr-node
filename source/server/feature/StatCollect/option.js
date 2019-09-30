import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const StatCollectFormatConfig = parseCompact('stat-collect-path/SP,O', parseCompactList(
  'stat-collect-url/SS,O',
  'stat-collect-interval/SI,O'
))
const getStatCollectOption = ({ tryGetFirst }) => ({
  statCollectPath: tryGetFirst('stat-collect-path'),
  statCollectUrl: tryGetFirst('stat-collect-url'),
  statCollectInterval: tryGetFirst('stat-collect-interval')
})

export { StatCollectFormatConfig, getStatCollectOption }
