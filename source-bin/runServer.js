import { tmpdir } from 'os'

import { Preset } from '@dr-js/core/module/node/module/Option/preset'

import { describeServerOption } from '@dr-js/core/module/node/server/Server'
import { autoTestServerPort } from '@dr-js/core/module/node/server/function'

import { configureLog } from '@dr-js/node/module/module/Log'
import { configurePid } from '@dr-js/node/module/module/Pid'
import { configureServerExot } from '@dr-js/node/module/module/ServerExot'
import {
  getServerExotOption, getLogOption, getPidOption,
  getServerExotFormatConfig, LogFormatConfig, PidFormatConfig
} from '@dr-js/node/module/server/share/option'
import { setupServerExotGroup, runServerExotGroup } from '@dr-js/node/module/server/share/configure'

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

const runServer = async (serverOption, featureOption) => {
  await configurePid(serverOption)
  const { loggerExot } = await configureLog(serverOption)
  const serverExot = await configureServerExot(serverOption)
  await configureSampleServer({ serverExot, loggerExot, ...featureOption })
  serverExot.describeString = describeServerOption(
    serverExot.option,
    `${packageName}@${packageVersion}`,
    Object.entries(featureOption).map(([ key, value ]) => value !== undefined && `${key}: ${value}`)
  )
  setupPackageSIGUSR2(packageName, packageVersion)
  return runServerExotGroup({ serverExot, loggerExot, serverExotGroup: setupServerExotGroup(serverExot, loggerExot) })
}

const runSampleServer = async (optionData) => runServer({
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
})

const runQuickSampleExplorerServer = async ({ rootPath, hostname, port }) => runServer({
  hostname,
  port: port || await autoTestServerPort([ 80, 8080, 8888, 8800, 8000 ], hostname)
}, {
  permissionType: 'allow',
  authSkip: true,
  fileRootPath: rootPath,
  fileUploadMergePath: `${tmpdir()}/${packageName}@${packageVersion}-quick-sample-explorer-merge/`,
  explorer: true
})

export {
  SampleServerFormatConfig,
  runServer,
  runSampleServer, runQuickSampleExplorerServer
}
