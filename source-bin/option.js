import { ConfigPreset, prepareOption, parseCompactFormat as parse } from 'dr-js/module/node/module/Option/preset'
import {
  LogFormatConfig,
  PidFormatConfig,
  AuthFormatConfig,
  AuthGroupFormatConfig,
  PermissionFormatConfig,
  // TokenCacheFormatConfig,
} from 'dr-server/module/configure/option'
import {
  getServerFormatConfig,
  ExplorerFormatConfig,
  StatusCollectFormatConfig,
  StatusReportFormatConfig,
  TaskRunnerFormatConfig
} from 'dr-server/module/feature/option'
import {
  NodeExplorerFormatConfig
} from 'dr-server/module/featureNode/option'

const OPTION_CONFIG = {
  prefixENV: 'dr-server',
  formatList: [
    ConfigPreset.Config,
    parse('help,h/T|show full help'),
    parse('quiet,q/T|less log'),
    parse('version,v/T|show version'),
    getServerFormatConfig([
      LogFormatConfig,
      PidFormatConfig,
      AuthFormatConfig,
      AuthGroupFormatConfig,
      PermissionFormatConfig,
      // TokenCacheFormatConfig,
      ExplorerFormatConfig,
      StatusCollectFormatConfig,
      StatusReportFormatConfig,
      TaskRunnerFormatConfig
    ]),
    NodeExplorerFormatConfig
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
