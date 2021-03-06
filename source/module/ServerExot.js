import { createSecureContext } from 'tls'
import { promises as fsAsync } from 'fs'
import { objectMap } from '@dr-js/core/module/common/immutable/Object'
import { createServerExot } from '@dr-js/core/module/node/server/Server'

const parseHostString = (host, defaultHostname) => { // for ipv6 should use host like: `[::]:80`
  const hostnameList = host.split(':')
  const port = Number(hostnameList.pop()) || undefined
  const hostname = hostnameList.join(':') || defaultHostname || undefined
  return { hostname, port }
}

const parseCookieString = (cookieString) => cookieString
  .split(';')
  .reduce((o, v) => {
    const [ key, ...valueList ] = v.split('=')
    const value = valueList.join('=').trim()
    if (value !== '') o[ key.trim() ] = value
    return o
  }, {})

__DEV__ && console.log('SAMPLE_TLS_SNI_CONFIG: single', { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined })
__DEV__ && console.log('SAMPLE_TLS_SNI_CONFIG: multi', {
  'default': { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined }, // default hostname
  '0.domain.domain': { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined }, // buffer or load from file
  '1.domain.domain': { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined } // buffer or load from file
})

const configureServerExot = async ({
  protocol = 'http:', hostname = '127.0.0.1', port,
  TLSSNIConfig, TLSDHParam, // accept Buffer or String (absolute path)
  ...extraOption
}) => createServerExot({
  protocol, hostname, port,
  ...(protocol === 'https:' && await loadTLS(TLSSNIConfig, TLSDHParam)),
  ...extraOption
})

// for server support multi HTTPS hostname, check `SNICallback`:
//   https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_connect_options_callback
//   https://en.wikipedia.org/wiki/Server_Name_Indication
//   https://github.com/nodejs/node/issues/17567
const loadTLS = async (
  TLSSNIConfig,
  TLSDHParam // Diffie-Hellman Key Exchange, generate with `openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096`
) => {
  if (TLSSNIConfig.key) TLSSNIConfig = { default: TLSSNIConfig } // convert single config to multi config
  if (!TLSSNIConfig.default) TLSSNIConfig.default = Object.values(TLSSNIConfig)[ 0 ] // use the first as default, if not set
  if (!TLSSNIConfig.default) throw new Error('no default TLS config')
  const dhparam = TLSDHParam && await autoBuffer(TLSDHParam)
  const optionMap = await objectMapAsync(TLSSNIConfig, async ({ key, cert, ca }) => ({
    // for Let'sEncrypt/CertBot cert config check: https://community.letsencrypt.org/t/node-js-configuration/5175
    key: await autoBuffer(key),
    cert: await autoBuffer(cert),
    ca: ca && await autoBuffer(ca),
    dhparam
  }))
  const secureContextMap = objectMap(optionMap, (option) => createSecureContext(option)) // pre-create and later reuse secureContext
  return {
    ...optionMap.default, // TODO: NOTE: currently can not pass pre-created secureContext directly
    SNICallback: Object.keys(optionMap).length >= 2 ? (hostname, callback) => callback(null, secureContextMap[ hostname ] || secureContextMap.default) : undefined
  }
}
const autoBuffer = async (bufferOrPath) => Buffer.isBuffer(bufferOrPath) ? bufferOrPath : fsAsync.readFile(bufferOrPath)
const objectMapAsync = async (object, mapFuncAsync) => {
  const result = {}
  for (const [ key, value ] of Object.entries(object)) result[ key ] = await mapFuncAsync(value, key)
  return result
}

export {
  parseHostString, parseCookieString,
  configureServerExot
}
