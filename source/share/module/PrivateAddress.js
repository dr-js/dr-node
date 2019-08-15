// only common address, not all is checked, check: https://en.wikipedia.org/wiki/Private_network
const isPrivateAddress = (address) => (
  address === '127.0.0.1' || // fast common private ip
  address === '::1' ||
  address === '::' ||
  address.startsWith('192.168.') ||
  address.startsWith('127.') ||
  address.startsWith('10.') ||
  address.startsWith('fd') ||
  address === 'localhost' // technically this is not a ip address
)

export { isPrivateAddress }
