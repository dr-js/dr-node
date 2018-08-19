import { gzip } from 'zlib'
import { promisify } from 'util'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { getEntityTagByContentHashAsync } from 'dr-js/module/node/module/EntityTag'

const gzipAsync = promisify(gzip)

const prepareBufferData = async (buffer, type) => ({
  type,
  buffer,
  bufferGzip: await gzipAsync(buffer),
  entityTag: await getEntityTagByContentHashAsync(buffer),
  length: buffer.length
})

const prepareBufferDataHTML = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.html)
const prepareBufferDataJSON = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.json)
const prepareBufferDataPNG = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.png)

// only common, not all is checked, check: https://en.wikipedia.org/wiki/Private_network
const isPrivateAddress = (address) => (
  address === '127.0.0.1' || // fast common private ip
  address === '::1' ||
  address === '::' ||
  address.startsWith('192.168.') ||
  address.startsWith('127.') ||
  address.startsWith('10.') ||
  address.startsWith('fd') ||
  address === 'localhost' // technically this is not ip address
)

export {
  prepareBufferData,
  prepareBufferDataHTML,
  prepareBufferDataJSON,
  prepareBufferDataPNG,

  isPrivateAddress
}
