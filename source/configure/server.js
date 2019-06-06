import { createSecureContext } from 'tls'
import { receiveBufferAsync } from 'dr-js/module/node/data/Buffer'
import { createServer } from 'dr-js/module/node/server/Server'
import { readFileAsync } from 'dr-js/module/node/file/function'

const loadFile = (filePath) => filePath ? readFileAsync(filePath) : null

const configureServer = async ({
  protocol = 'http:',
  hostname = 'localhost',
  port,
  fileSSLKey,
  fileSSLCert,
  fileSSLChain,
  fileSSLDHParam, // Diffie-Hellman Key Exchange // NOTE: generate with `openssl dhparam -dsaparam -out output/path/dhparam.4096.pem 4096`
  ...extraOption
}) => {
  const isHttps = protocol === 'https:'
  return createServer({
    protocol,
    hostname,
    port,
    key: await loadFile(isHttps && fileSSLKey),
    cert: await loadFile(isHttps && fileSSLCert),
    ca: await loadFile(isHttps && fileSSLChain),
    dhparam: await loadFile(isHttps && fileSSLDHParam),
    ...extraOption
  })
}

// for multi HTTPS host server, check `SNICallback`:
//   https://en.wikipedia.org/wiki/Server_Name_Indication
//   https://github.com/nodejs/node/issues/17567
const getServerSNIOption = async (
  hostnameConfigMap // { [hostname]: { fileSSLKey, fileSSLCert, fileSSLChain } }
) => {
  const secureContextMap = {}
  for (const [ hostname, { fileSSLKey, fileSSLCert, fileSSLChain } ] of Object.entries(hostnameConfigMap)) {
    secureContextMap[ hostname ] = {
      key: await loadFile(fileSSLKey),
      cert: await loadFile(fileSSLCert),
      ca: await loadFile(fileSSLChain)
    }
  }
  const defaultSecureContext = Object.keys(secureContextMap)[ 0 ] // NOTE: use the first as default
  return {
    ...defaultSecureContext, // for skipping duplicate config for SSL in configureServer
    SNICallback: (hostname, callback) => callback(
      null,
      createSecureContext(secureContextMap[ hostname ] || defaultSecureContext)
    )
  }
}

const responderCommonExtend = (store) => { // TODO: this add functions to every request, so balance handiness & weight
  const requestBuffer = () => receiveBufferAsync(store.request)
  const requestJSON = async () => JSON.parse(await requestBuffer())

  store.requestBuffer = requestBuffer
  store.requestJSON = requestJSON
}

export {
  configureServer,
  getServerSNIOption,

  responderCommonExtend
}
