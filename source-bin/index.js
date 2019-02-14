#!/usr/bin/env node

import { time } from 'dr-js/module/common/format'
import { createStepper } from 'dr-js/module/common/time'
import { describeServer } from 'dr-js/bin/function'

import { createServer } from 'dr-server/sample/server'
import { getAuthFetch, fileUpload, fileDownload, pathAction } from 'dr-server/module/featureNode/explorer'
import {
  getLogOption,
  getPidOption,
  getAuthOption,
  getAuthGroupOption,
  getPermissionOption
  // getTokenCacheOption,
} from 'dr-server/module/configure/option'
import {
  getServerOption,
  getExplorerOption,
  getStatusCollectOption,
  getStatusReportOption,
  getTaskRunnerOption
} from 'dr-server/module/feature/option'
import { getNodeExplorerOption } from 'dr-server/module/featureNode/option'

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
    ...getAuthOption(optionData),
    ...getAuthGroupOption(optionData),
    ...getPermissionOption(optionData),
    // ...getTokenCacheOption(optionData),
    ...extraConfig
  })
  await start()
  logger.add(describeServer(
    option,
    'server',
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

  const nodeOption = getNodeExplorerOption(optionData)
  nodeOption.authFetch = await getAuthFetch(nodeOption)
  if (!optionData.tryGet('quiet')) {
    const stepper = createStepper()
    nodeOption.log = (...args) => console.log(...args, `(+${time(stepper())})`)
  }

  switch (modeName) {
    case 'node-path-action':
      return logJSON(await pathAction(nodeOption))
    case 'node-file-upload':
      return fileUpload(nodeOption)
    case 'node-file-download':
      return fileDownload(nodeOption)
  }
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
