import { tmpdir } from 'os'

import { Preset } from '@dr-js/core/module/node/module/Option/preset'

import { autoTestServerPort } from '@dr-js/core/module/node/server/function'

import {
  getServerExotOption, getLogOption, getPidOption,
  getServerExotFormatConfig, LogFormatConfig, PidFormatConfig
} from '@dr-js/node/module/server/share/option'
import { runServer } from '@dr-js/node/module/server/share/configure'

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

const runSampleServer = async (optionData) => runServer(configureSampleServer, {
  ...getPidOption(optionData),
  ...getLogOption(optionData),
  ...getServerExotOption(optionData)
}, {
  packageName, packageVersion, isDebugRoute: optionData.tryGet('debug-route'),
  ...getAuthCommonOption(optionData), ...getAuthSkipOption(optionData), ...getAuthFileOption(optionData), ...getAuthFileGroupOption(optionData),
  ...getPermissionOption(optionData),
  ...getFileOption(optionData),
  ...getExplorerOption(optionData),
  ...getStatCollectOption(optionData),
  ...getStatReportOption(optionData),
  ...getWebSocketTunnelOption(optionData)
})

const runQuickSampleExplorerServer = async ({ rootPath, hostname, port }) => runServer(configureSampleServer, {
  hostname,
  port: port || await autoTestServerPort([ 80, 8080, 8888, 8800, 8000 ], hostname)
}, {
  packageName, packageVersion,
  permissionType: 'allow',
  authSkip: true,
  fileRootPath: rootPath,
  fileUploadMergePath: `${tmpdir()}/${packageName}@${packageVersion}-quick-sample-explorer-merge/`,
  explorer: true
})

export {
  SampleServerFormatConfig,
  runSampleServer, runQuickSampleExplorerServer
}
