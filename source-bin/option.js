import { Preset, prepareOption } from 'dr-js/module/node/module/Option/preset'

import {
  getServerFormatConfig,
  LogFormatConfig,
  PidFormatConfig
  // TokenCacheFormatConfig,
} from 'dr-server/module/share/option'

import { AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig } from 'dr-server/module/feature/Auth/option'
import { PermissionFormatConfig } from 'dr-server/module/feature/Permission/option'

import { ExplorerFormatConfig } from 'dr-server/module/feature/Explorer/option'
import { StatusCollectFormatConfig } from 'dr-server/module/feature/StatusCollect/option'
import { StatusReportFormatConfig } from 'dr-server/module/feature/StatusReport/option'
import { TaskRunnerFormatConfig } from 'dr-server/module/feature/TaskRunner/option'

import { ExplorerClientFormatConfig } from './optionExplorerClient'

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
      // TokenCacheFormatConfig,

      AuthSkipFormatConfig,
      AuthFileFormatConfig,
      AuthFileGroupFormatConfig,
      PermissionFormatConfig,

      ExplorerFormatConfig,
      StatusCollectFormatConfig,
      StatusReportFormatConfig,
      TaskRunnerFormatConfig
    ]),
    ExplorerClientFormatConfig
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
