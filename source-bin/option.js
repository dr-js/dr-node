import { Preset, prepareOption } from '@dr-js/core/module/node/module/Option/preset'

import {
  getServerFormatConfig,
  LogFormatConfig,
  PidFormatConfig
  // TokenCacheFormatConfig,
} from '@dr-js/node/module/server/share/option'

import { AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig } from '@dr-js/node/module/server/feature/Auth/option'
import { PermissionFormatConfig } from '@dr-js/node/module/server/feature/Permission/option'

import { ExplorerFormatConfig } from '@dr-js/node/module/server/feature/Explorer/option'
import { StatusCollectFormatConfig } from '@dr-js/node/module/server/feature/StatusCollect/option'
import { StatusReportFormatConfig } from '@dr-js/node/module/server/feature/StatusReport/option'
import { TaskRunnerFormatConfig } from '@dr-js/node/module/server/feature/TaskRunner/option'

import { ExplorerClientFormatConfig } from './optionExplorerClient'

const { Config, parseCompactList } = Preset

const OPTION_CONFIG = {
  prefixENV: 'dr-node',
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
