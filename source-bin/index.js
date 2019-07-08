#!/usr/bin/env node

import { time } from 'dr-js/module/common/format'
import { createStepper } from 'dr-js/module/common/time'
import { describeServer } from 'dr-js/bin/function'

import { createServer } from 'dr-server/sample/server'
import { startClient } from 'dr-server/sample/client'

import {
  getServerOption,
  getLogOption,
  getPidOption,
  getPermissionOption
  // getTokenCacheOption,
} from 'dr-server/module/configure/option'

import { getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption } from 'dr-server/module/feature/Auth/option'
import { getExplorerOption } from 'dr-server/module/feature/Explorer/option'
import { getStatusCollectOption } from 'dr-server/module/feature/StatusCollect/option'
import { getStatusReportOption } from 'dr-server/module/feature/StatusReport/option'
import { getTaskRunnerOption } from 'dr-server/module/feature/TaskRunner/option'

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

    ...getAuthSkipOption(optionData),
    ...getAuthFileOption(optionData),
    ...getAuthFileGroupOption(optionData),

    ...getPermissionOption(optionData),
    // ...getTokenCacheOption(optionData),
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
