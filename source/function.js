import { catchAsync } from 'dr-js/module/common/error'
import { getUnusedPort } from 'dr-js/module/node/server/function'
import { getNetworkIPv4AddressList } from 'dr-js/module/node/system/NetworkAddress'

const autoTestServerPort = async (expectPortList, host) => {
  for (const expectPort of expectPortList) {
    const { result, error } = await catchAsync(getUnusedPort, expectPort, host)
    __DEV__ && error && console.log(`[autoTestServerPort] failed for expectPort: ${expectPort}`, error)
    if (result) return result
  }
  return getUnusedPort(0, host) // any
}

const getServerInfo = (title, protocol, hostname, port, extra = []) => `[${title}]\n  ${[
  ...extra,
  'running at:',
  `  - '${protocol}//${hostname}:${port}'`,
  ...(hostname === '0.0.0.0' ? [
    'connect at:',
    ...getNetworkIPv4AddressList().map(({ address }) => `  - '${protocol}//${address}:${port}'`)
  ] : [])
].join('\n  ')}`

export {
  autoTestServerPort,
  getServerInfo
}
