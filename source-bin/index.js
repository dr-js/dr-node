#!/usr/bin/env node

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { runSampleServer } from './runServer'
import { runModule } from './runModule'

import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, optionData) => modeName === 'host'
  ? runSampleServer(optionData)
  : runModule(optionData, modeName)

const main = async () => {
  const optionData = await parseOption()
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))

  if (!modeName) {
    return console.log(optionData.tryGet('version')
      ? JSON.stringify({ packageName, packageVersion }, null, 2)
      : formatUsage(null, optionData.tryGet('help') ? null : 'simple')
    )
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
