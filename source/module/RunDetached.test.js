import { strictEqual } from 'assert'
import { join } from 'path'
import { spawnSync } from 'child_process'
import { readFileSync, unlinkSync } from 'fs'
import { setTimeoutAsync } from '@dr-js/core/module/common/time'
import { isPidExist } from '@dr-js/core/module/node/system/Process'

const { describe, it, info = console.log } = global

const TEST_DETACHED_PROCESS_FUNC = (TEST_LOG_FILE) => {
  const { open, close, unlink } = require('fs')
  const { spawn } = require('child_process')
  const { promisify } = require('util')

  const openAsync = promisify(open)
  const closeAsync = promisify(close)
  const unlinkAsync = promisify(unlink)

  const startDetachedProcess = async ({ command, argList, option }, logFile) => {
    console.log(`[startDetachedProcess] logFile: ${logFile}`)
    await unlinkAsync(logFile).catch(() => {})
    const stdoutFd = await openAsync(logFile, 'a')
    const subProcess = spawn(command, argList, {
      ...option,
      stdio: [ 'ignore', stdoutFd, stdoutFd ], // TODO: NOTE: check: https://github.com/joyent/libuv/issues/923
      detached: true // to allow server restart and find the process again
    })
    subProcess.on('error', (error) => { console.warn('[ERROR][startDetachedProcess] config:', { command, argList, option }, 'error:', error) })
    subProcess.unref()
    await closeAsync(stdoutFd)
    console.error(JSON.stringify({ processPid: process.pid, subProcessPid: subProcess.pid }))
  }

  const TEST_STDIO_FUNC = () => {
    const TIME_INTERVAL = 0.1 * 1000
    const COUNTER_MAX = 20
    let counter = 0
    console.log(process.platform)
    console.log('[STDOUT|START]')
    console.error('[STDERR|START]')
    const intervalToken = setInterval(() => {
      console.log('[STDOUT|TICK] ====')
      console.error('[STDERR|TICK] ====')
      console.log('[STDOUT|TICK]', counter)
      console.error('[STDERR|TICK]', counter)
      counter++
      if (counter < COUNTER_MAX) return
      clearInterval(intervalToken)
      console.log('[STDOUT|DONE]')
      console.error('[STDERR|DONE]')
    }, TIME_INTERVAL)
  }

  startDetachedProcess({
    command: process.argv[ 0 ],
    argList: [ '-e', `(${TEST_STDIO_FUNC})()` ],
    option: { cwd: __dirname }
  }, TEST_LOG_FILE).catch(console.error)
}

const EXPECT_LOG_STRING = `${process.platform}
[STDOUT|START]
[STDERR|START]
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 0
[STDERR|TICK] 0
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 1
[STDERR|TICK] 1
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 2
[STDERR|TICK] 2
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 3
[STDERR|TICK] 3
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 4
[STDERR|TICK] 4
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 5
[STDERR|TICK] 5
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 6
[STDERR|TICK] 6
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 7
[STDERR|TICK] 7
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 8
[STDERR|TICK] 8
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 9
[STDERR|TICK] 9
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 10
[STDERR|TICK] 10
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 11
[STDERR|TICK] 11
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 12
[STDERR|TICK] 12
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 13
[STDERR|TICK] 13
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 14
[STDERR|TICK] 14
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 15
[STDERR|TICK] 15
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 16
[STDERR|TICK] 16
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 17
[STDERR|TICK] 17
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 18
[STDERR|TICK] 18
[STDOUT|TICK] ====
[STDERR|TICK] ====
[STDOUT|TICK] 19
[STDERR|TICK] 19
[STDOUT|DONE]
[STDERR|DONE]
`

const TEST_LOG_FILE = join(__dirname, 'TEST_DETACHED_PROCESS_MERGE_STDOUT_STDERR.log')

describe('Node.Module.RunDetached', () => {
  it('verify Node.js support: detached process merge stdout stderr', async () => {
    const { stdout, stderr } = spawnSync(
      process.argv[ 0 ],
      [ '-e', `(${TEST_DETACHED_PROCESS_FUNC})(${JSON.stringify(TEST_LOG_FILE)})` ],
      { cwd: __dirname }
    )
    info(`== stdout ==\n${stdout}`)
    info(`== stderr ==\n${stderr}`)
    const { subProcessPid } = JSON.parse(String(stderr))
    while (isPidExist(subProcessPid)) await setTimeoutAsync(100)
    const logString = String(readFileSync(TEST_LOG_FILE))
    unlinkSync(TEST_LOG_FILE)
    info('check logString') // info(`== logString ==\n${logString}`)
    strictEqual(logString, EXPECT_LOG_STRING)
  })
})
