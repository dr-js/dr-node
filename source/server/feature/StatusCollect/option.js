import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const StatusCollectFormatConfig = parseCompact('status-collect-path/SP,O', parseCompactList(
  'status-collect-url/SS,O',
  'status-collect-interval/SI,O'
))
const getStatusCollectOption = ({ tryGetFirst }) => ({
  statusCollectPath: tryGetFirst('status-collect-path'),
  statusCollectUrl: tryGetFirst('status-collect-url'),
  statusCollectInterval: tryGetFirst('status-collect-interval')
})

export { StatusCollectFormatConfig, getStatusCollectOption }
