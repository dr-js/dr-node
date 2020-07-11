import { once } from '@dr-js/core/module/common/function'
import { createExotGroup } from '@dr-js/core/module/common/module/Exot'
import { describeServerOption } from '@dr-js/core/module/node/server/Server'
import { Preset } from '@dr-js/core/module/node/module/Option/preset'
import { addExitListenerAsync, addExitListenerSync } from '@dr-js/core/module/node/system/ExitListener'

import { configureLog } from '@dr-js/node/module/module/Log'
import { configurePid } from '@dr-js/node/module/module/Pid'
import { configureServerExot } from '@dr-js/node/module/module/ServerExot'
import {
  getServerExotOption, getLogOption, getPidOption,
  getServerExotFormatConfig, LogFormatConfig, PidFormatConfig
} from '@dr-js/node/module/server/share/option'

import {
  getAuthCommonOption, getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption,
  AuthCommonFormatConfig, AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig
} from '@dr-js/node/module/server/feature/Auth/option'
import { getPermissionOption, PermissionFormatConfig } from '@dr-js/node/module/server/feature/Permission/option'
import { getFileOption, FileFormatConfig } from '@dr-js/node/module/server/feature/File/option'
import { getExplorerOption, ExplorerFormatConfig } from '@dr-js/node/module/server/feature/Explorer/option'
import { getStatCollectOption, StatCollectFormatConfig } from '@dr-js/node/module/server/feature/StatCollect/option'
import { getStatReportOption, StatReportFormatConfig } from '@dr-js/node/module/server/feature/StatReport/option'
import { getWebSocketTunnelOption, WebSocketTunnelFormatConfig } from '@dr-js/node/module/server/feature/WebSocketTunnelDev/option'

import { configureSampleServer } from './sampleServer'
import { setupPackageSIGUSR2 } from './function'

import { name as packageName, version as packageVersion } from '../package.json'

const SampleServerFormatConfig = getServerExotFormatConfig([
  Preset.parseCompact('debug-route/T|show debug route list on "/"'),

  LogFormatConfig,
  PidFormatConfig,

  AuthCommonFormatConfig, AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig,
  PermissionFormatConfig,

  FileFormatConfig,
  ExplorerFormatConfig,
  StatCollectFormatConfig,
  StatReportFormatConfig,

  WebSocketTunnelFormatConfig
])

const runSampleServer = async (optionData) => setupServer({
  ...getPidOption(optionData),
  ...getLogOption(optionData),
  ...getServerExotOption(optionData)
}, {
  isDebugRoute: optionData.tryGet('debug-route'),
  ...getAuthCommonOption(optionData), ...getAuthSkipOption(optionData), ...getAuthFileOption(optionData), ...getAuthFileGroupOption(optionData),
  ...getPermissionOption(optionData),
  ...getFileOption(optionData),
  ...getExplorerOption(optionData),
  ...getStatCollectOption(optionData),
  ...getStatReportOption(optionData),
  ...getWebSocketTunnelOption(optionData)
}).then(setupServerExotGroup)

const setupServer = async (serverOption, featureOption) => {
  await configurePid(serverOption)
  const { loggerExot } = await configureLog(serverOption)
  const serverExot = await configureServerExot(serverOption)

  await configureSampleServer({ serverExot, logger: loggerExot, ...featureOption })

  loggerExot.add(describeServerOption(
    serverExot.option,
    `${packageName}@${packageVersion}`,
    Object.entries(featureOption).map(([ key, value ]) => value !== undefined && `${key}: ${value}`)
  ))

  const exotGroup = createExotGroup({
    id: 'exot:group-server',
    getOnExotError: (exotGroup) => (error) => {
      console.log('[exot-group-error]', error)
      return exotGroup.down()
    }
  })

  exotGroup.set(loggerExot)
  for (const { exotList } of serverExot.featureMap.values()) { // NOTE: this will up all featureExot before serverExot
    if (exotList && exotList.length) for (const exot of exotList) exotGroup.set(exot)
  }
  exotGroup.set(serverExot)

  setupPackageSIGUSR2(packageName, packageVersion)

  return {
    exotGroup,
    serverExot, loggerExot
  }
}

const setupServerExotGroup = ({ exotGroup }) => {
  const down = once(exotGroup.down) // trigger all exot down, the worst case those sync ones may still finish
  addExitListenerSync(down)
  addExitListenerAsync(down)
  return exotGroup.up()
}

export {
  SampleServerFormatConfig,
  runSampleServer,
  setupServer, setupServerExotGroup
}
