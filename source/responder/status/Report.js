import { clock, getTimestamp } from 'dr-js/module/common/time'
import { binary } from 'dr-js/module/common/format'
import { roundFloat } from 'dr-js/module/common/math/base'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'

import { getSystemProcessor, getSystemStatus, getProcessStatus } from 'dr-js/module/node/system/Status'

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

const createResponderStatusReport = (processTag = getSystemTag()) => {
  let prevTime = clock()
  let prevSystemStatus = getSystemStatus()
  let prevProcessStatus = getProcessStatus()

  return (store) => {
    const time = clock()
    const systemStatus = getSystemStatus()
    const processStatus = getProcessStatus()

    const buffer = Buffer.from(JSON.stringify({
      timestamp: getTimestamp(),
      processTag,
      systemStatus,
      processStatus,
      delta: {
        time: roundFloat(time - prevTime),
        systemProcessorTimeList: getSystemProcessorTimeListDelta(systemStatus.processor, prevSystemStatus.processor),
        processCpuUsage: getProcessCpuUsageDelta(processStatus.cpuUsage, prevProcessStatus.cpuUsage)
      }
    }))

    prevTime = time
    prevSystemStatus = systemStatus
    prevProcessStatus = processStatus

    return responderSendBufferCompress(store, { buffer, type: BASIC_EXTENSION_MAP.json })
  }
}

export { createResponderStatusReport }
