#!/usr/bin/env node

import { time } from '@dr-js/core/module/common/format'
import { createStepper } from '@dr-js/core/module/common/time'
import { describeServer } from '@dr-js/core/bin/function'

import { createServer } from '@dr-js/node/sample/server'
import { startClient } from '@dr-js/node/sample/client'

import {
  getServerOption,
  getLogOption,
  getPidOption
  // getTokenCacheOption,
} from '@dr-js/node/module/server/share/option'

import { getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption } from '@dr-js/node/module/server/feature/Auth/option'
import { getPermissionOption } from '@dr-js/node/module/server/feature/Permission/option'

import { getExplorerOption } from '@dr-js/node/module/server/feature/Explorer/option'
import { getStatusCollectOption } from '@dr-js/node/module/server/feature/StatusCollect/option'
import { getStatusReportOption } from '@dr-js/node/module/server/feature/StatusReport/option'
import { getTaskRunnerOption } from '@dr-js/node/module/server/feature/TaskRunner/option'

import { getExplorerClientOption } from './optionExplorerClient'

import { parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const logJSON = (object) => console.log(JSON.stringify(object, null, 2))

const startServer = async (optionData) => {
  const extraConfig = {
    ...getExplorerOption(optionData),
    ...getStatusCollectOption(optionData),
    ...getStatusReportOption(optionData),
    ...getTaskRunnerOption(optionData)
  }
  const { start, option, logger } = await createServer({
    ...getServerOption(optionData),
    ...getLogOption(optionData),
    ...getPidOption(optionData),
    // ...getTokenCacheOption(optionData),

    ...getAuthSkipOption(optionData),
    ...getAuthFileOption(optionData),
    ...getAuthFileGroupOption(optionData),
    ...getPermissionOption(optionData),
    ...extraConfig
  })
  await start()
  logger.add(describeServer(
    option,
    `${packageName}@${packageVersion}`,
    Object.entries(extraConfig)
      .map(([ key, value ]) => value !== undefined && `${key}: ${value}`)
      .filter(Boolean)
  ))
}

const MODE_NAME_LIST = [
  'host', // server
  'node-path-action',
  'node-file-upload',
  'node-file-download'
]

const runMode = async (modeName, optionData) => {
  if (modeName === 'host') return startServer(optionData)

  let log
  if (!optionData.tryGet('quiet')) {
    const stepper = createStepper()
    log = (...args) => console.log(...args, `(+${time(stepper())})`)
  }

  const result = await startClient({
    modeName,
    log,
    ...getAuthFileOption(optionData),
    ...getExplorerClientOption(optionData)
  })
  result && logJSON(result)
}

const main = async () => {
  const optionData = await parseOption()
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))

  if (!modeName) {
    return optionData.tryGet('version')
      ? logJSON({ packageName, packageVersion })
      : console.log(formatUsage(null, optionData.tryGet('help') ? null : 'simple'))
  }

  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
