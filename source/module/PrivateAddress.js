// only common address, not all is checked, check: https://en.wikipedia.org/wiki/Private_network
const isPrivateAddress = (address) => (
  address === '127.0.0.1' ||
  address === '0.0.0.0' ||

  address === '[::1]' ||
  address === '[::]' ||

  address.startsWith('192.168.') ||
  address.startsWith('127.') ||
  address.startsWith('10.') ||

  address.startsWith('[fc') ||
  address.startsWith('[fd') ||
  address.startsWith('[fe') ||

  address === 'localhost' // technically this is not an ip address
)

export { isPrivateAddress }
