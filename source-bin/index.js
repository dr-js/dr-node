#!/usr/bin/env node

import { logAuto } from '@dr-js/core/bin/function' // NOTE: borrow bin code

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { runSampleServer } from './runSampleServer'
import { runModule } from './runModule'

import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (optionData, modeName) => modeName === 'host'
  ? runSampleServer(optionData)
  : runModule(optionData, modeName, packageName, packageVersion)

const main = async () => {
  const optionData = await parseOption()
  if (optionData.getToggle('version')) return logAuto({ packageName, packageVersion })
  if (optionData.getToggle('help')) return logAuto(formatUsage())
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))
  if (!modeName) throw new Error('no mode specified')
  await runMode(optionData, modeName).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
