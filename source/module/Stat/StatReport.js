import { getTimestamp, createStepper } from '@dr-js/core/module/common/time'
import { tryCall } from '@dr-js/core/module/common/error'
import { binary } from '@dr-js/core/module/common/format'
import { roundFloat } from '@dr-js/core/module/common/math/base'
import { getSystemProcessor, getSystemStatus } from '@dr-js/core/module/node/system/Status'

const getSystemTag = ({ platform, processor, memory, network } = getSystemStatus()) => [
  platform.platform,
  platform.arch,
  platform.release,

  processor.length,
  processor[ 0 ].model,
  processor[ 0 ].speed,

  binary(memory.total),

  network.hostname
].filter(Boolean).join('|')

const getSystemProcessorTimeListDelta = (stat = getSystemProcessor(), prevStat) => stat.map(({ times: { user, nice, sys, idle, irq } }, index) => {
  const prevTimes = prevStat[ index ].times
  return {
    user: user - prevTimes.user,
    nice: nice - prevTimes.nice,
    sys: sys - prevTimes.sys,
    idle: idle - prevTimes.idle,
    irq: irq - prevTimes.irq
  }
})

const getProcessCpuUsageDelta = ({ user, system } = process.cpuUsage(), prevValue) => ({
  user: user - prevValue.user,
  system: system - prevValue.system
})

const createGetStatReport = (processTag = getSystemTag()) => {
  const stepper = createStepper()
  let prevSystemStat = getSystemStatus()
  let prevProcessStat = getCurrentProcessStat()

  return () => {
    const systemStat = getSystemStatus()
    const processStat = getCurrentProcessStat()

    const statReport = {
      timestamp: getTimestamp(),
      processTag,
      systemStat,
      processStat,
      delta: {
        time: roundFloat(stepper()),
        systemProcessorTimeList: getSystemProcessorTimeListDelta(systemStat.processor, prevSystemStat.processor),
        processCpuUsage: getProcessCpuUsageDelta(processStat.cpuUsage, prevProcessStat.cpuUsage)
      }
    }

    prevSystemStat = systemStat
    prevProcessStat = processStat

    return statReport
  }
}

const getCurrentProcessStat = () => ({ // stat for current node process // TODO: use `process.resourceUsage()` from `node@12.6.0`
  title: process.title,
  pid: process.pid,
  ppid: process.ppid,

  uid: tryCall(process, 'getuid'),
  gid: tryCall(process, 'getgid'),
  groups: tryCall(process, 'getgroups') || [],
  euid: tryCall(process, 'geteuid'),
  egid: tryCall(process, 'getegid'),

  stdio: {
    stdin: getStdio('stdin'),
    stdout: getStdio('stdout'),
    stderr: getStdio('stderr')
  },
  isConnectedIPC: Boolean(process.connected),

  execPath: process.execPath,
  execArgv: process.execArgv, // []
  argv: process.argv, // []
  cwd: process.cwd(),
  uptime: process.uptime() * 1000,
  cpuUsage: process.cpuUsage(), // { user, system } // in µsec(micro-sec), not msec(mili-sec)
  memoryUsage: process.memoryUsage() // {}
})

const getStdio = (name) => ({ isTTY: Boolean(process[ name ].isTTY) })

export { createGetStatReport }
