import { Preset, prepareOption } from 'dr-js/module/node/module/Option/preset'
import {
  getServerFormatConfig,
  LogFormatConfig,
  PidFormatConfig,
  AuthFormatConfig,
  AuthGroupFormatConfig,
  PermissionFormatConfig
  // TokenCacheFormatConfig,
} from 'dr-server/module/configure/option'
import {
  ExplorerFormatConfig,
  StatusCollectFormatConfig,
  StatusReportFormatConfig,
  TaskRunnerFormatConfig
} from 'dr-server/module/feature/option'
import {
  NodeExplorerFormatConfig
} from 'dr-server/module/featureNode/option'

const { Config, parseCompactList } = Preset

const OPTION_CONFIG = {
  prefixENV: 'dr-server',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'quiet,q/T|less log',
      'version,v/T|show version'
    ),
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
