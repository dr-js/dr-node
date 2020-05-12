import { describeServerPack } from '@dr-js/core/module/node/server/Server'
import { Preset } from '@dr-js/core/module/node/module/Option/preset'

import { configureLog } from '@dr-js/node/module/module/Log'
import { configurePid } from '@dr-js/node/module/module/Pid'
import { configureServerPack } from '@dr-js/node/module/module/ServerPack'
import {
  getServerPackOption, getLogOption, getPidOption,
  getServerPackFormatConfig, LogFormatConfig, PidFormatConfig
} from '@dr-js/node/module/server/share/option'

import {
  getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption,
  AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig
} from '@dr-js/node/module/server/feature/Auth/option'
import { getPermissionOption, PermissionFormatConfig } from '@dr-js/node/module/server/feature/Permission/option'
import { getExplorerOption, ExplorerFormatConfig } from '@dr-js/node/module/server/feature/Explorer/option'
import { getStatCollectOption, StatCollectFormatConfig } from '@dr-js/node/module/server/feature/StatCollect/option'
import { getStatReportOption, StatReportFormatConfig } from '@dr-js/node/module/server/feature/StatReport/option'
import { getWebSocketTunnelOption, WebSocketTunnelFormatConfig } from '@dr-js/node/module/server/feature/WebSocketTunnel/option'

import { configureSampleServer } from './sampleServer'
import { setupPackageSIGUSR2 } from './function'

import { name as packageName, version as packageVersion } from '../package.json'

const SampleServerFormatConfig = getServerPackFormatConfig([
  Preset.parseCompact('debug-route/T|show debug route list on "/"'),

  LogFormatConfig,
  PidFormatConfig,

  AuthSkipFormatConfig,
  AuthFileFormatConfig,
  AuthFileGroupFormatConfig,
  PermissionFormatConfig,

  ExplorerFormatConfig,
  StatCollectFormatConfig,
  StatReportFormatConfig,

  WebSocketTunnelFormatConfig
])

const runSampleServer = async (optionData) => startServer({
  ...getPidOption(optionData),
  ...getLogOption(optionData),
  ...getServerPackOption(optionData)
}, {
  isDebugRoute: optionData.tryGet('debug-route'),
  ...getAuthSkipOption(optionData),
  ...getAuthFileOption(optionData),
  ...getAuthFileGroupOption(optionData),
  ...getPermissionOption(optionData),
  ...getExplorerOption(optionData),
  ...getStatCollectOption(optionData),
  ...getStatReportOption(optionData),
  ...getWebSocketTunnelOption(optionData)
})

const startServer = async (serverOption, featureOption) => {
  await configurePid(serverOption)
  const serverPack = await configureServerPack(serverOption)
  const logger = await configureLog(serverOption)
  const featurePack = await configureSampleServer({ serverPack, logger, ...featureOption })
  await serverPack.start()
  logger.add(describeServerPack(
    serverPack.option,
    `${packageName}@${packageVersion}`,
    Object.entries(featureOption).map(([ key, value ]) => value !== undefined && `${key}: ${value}`)
  ))
  setupPackageSIGUSR2(packageName, packageVersion)
  return featurePack
}

export {
  SampleServerFormatConfig,
  runSampleServer,
  startServer
}
