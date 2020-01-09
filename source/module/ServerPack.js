import { resolve } from 'path'
import { createSecureContext } from 'tls'
import { isBasicObject } from '@dr-js/core/module/common/check'
import { objectMap } from '@dr-js/core/module/common/immutable/Object'
import { readFileAsync } from '@dr-js/core/module/node/file/function'
import { createServerPack } from '@dr-js/core/module/node/server/Server'

__DEV__ && console.log('SAMPLE_TLS_SNI_CONFIG: single', { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined })
__DEV__ && console.log('SAMPLE_TLS_SNI_CONFIG: multi', {
  'default': { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined }, // default hostname
  '0.domain.domain': { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined }, // buffer or load from file
  '1.domain.domain': { key: Buffer || String, cert: Buffer || String, ca: Buffer || String || undefined } // buffer or load from file
})

const deprecateTLSSNIConfigPatch = async (fileTLSKey, fileTLSCert, fileTLSCA, fileTLSSNIConfig) => { // TODO: deprecate
  const TLSSNIConfig = {}
  if (fileTLSSNIConfig) Object.assign(TLSSNIConfig, objectMapDeep(JSON.parse(String(await readFileAsync(fileTLSSNIConfig))), (value) => resolve(fileTLSSNIConfig, '..', value)))
  if (fileTLSKey) TLSSNIConfig.default = { key: fileTLSKey, cert: fileTLSCert, ca: fileTLSCA }
  __DEV__ && console.log({ TLSSNIConfig })
  return TLSSNIConfig
}
const objectMapDeep = (object, mapFunc) => {
  const result = {}
  for (const [ key, value ] of Object.entries(object)) result[ key ] = isBasicObject(value) ? objectMapDeep(value, mapFunc) : mapFunc(value, key)
  return result
}

const configureServerPack = async ({
  protocol = 'http:', hostname = '127.0.0.1', port,
  fileTLSKey, fileTLSCert, fileTLSCA, fileTLSSNIConfig, fileTLSDHParam, // TODO: deprecate
  TLSSNIConfig, TLSDHParam, // accept Buffer or String (absolute path)
  ...extraOption
}) => createServerPack({
  protocol, hostname, port,
  ...(protocol === 'https:' && await loadTLS(TLSSNIConfig || await deprecateTLSSNIConfigPatch(fileTLSKey, fileTLSCert, fileTLSCA, fileTLSSNIConfig), TLSDHParam || fileTLSDHParam)),
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
const autoBuffer = async (bufferOrPath) => Buffer.isBuffer(bufferOrPath) ? bufferOrPath : readFileAsync(bufferOrPath)
const objectMapAsync = async (object, mapFuncAsync) => {
  const result = {}
  for (const [ key, value ] of Object.entries(object)) result[ key ] = await mapFuncAsync(value, key)
  return result
}

export { configureServerPack }
