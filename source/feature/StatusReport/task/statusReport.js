import { getTimestamp, createStepper } from 'dr-js/module/common/time'
import { tryCall } from 'dr-js/module/common/error'
import { binary } from 'dr-js/module/common/format'
import { roundFloat } from 'dr-js/module/common/math/base'
import { getSystemProcessor, getSystemStatus } from 'dr-js/module/node/system/Status'

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

const getSystemProcessorTimeListDelta = (status = getSystemProcessor(), prevStatus) => status.map(({ times: { user, nice, sys, idle, irq } }, index) => {
  const prevTimes = prevStatus[ index ].times
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

const createGetStatusReport = (processTag = getSystemTag()) => {
  const stepper = createStepper()
  let prevSystemStatus = getSystemStatus()
  let prevProcessStatus = getCurrentProcessStatus()

  return () => {
    const systemStatus = getSystemStatus()
    const processStatus = getCurrentProcessStatus()

    const statusReport = {
      timestamp: getTimestamp(),
      processTag,
      systemStatus,
      processStatus,
      delta: {
        time: roundFloat(stepper()),
        systemProcessorTimeList: getSystemProcessorTimeListDelta(systemStatus.processor, prevSystemStatus.processor),
        processCpuUsage: getProcessCpuUsageDelta(processStatus.cpuUsage, prevProcessStatus.cpuUsage)
      }
    }

    prevSystemStatus = systemStatus
    prevProcessStatus = processStatus

    return statusReport
  }
}

const getCurrentProcessStatus = () => ({ // status for current node process // TODO: use `process.resourceUsage()` from `node@12.6.0`
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

export { createGetStatusReport }
