import { getTimestamp, createStepper } from 'dr-js/module/common/time'
import { binary } from 'dr-js/module/common/format'
import { roundFloat } from 'dr-js/module/common/math/base'
import { getSystemProcessor, getSystemStatus, getCurrentProcessStatus } from 'dr-js/module/node/system/Status'

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

export { createGetStatusReport }
