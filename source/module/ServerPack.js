import { resolve } from 'path'
import { createSecureContext } from 'tls'
import { readFileAsync } from '@dr-js/core/module/node/file/function'
import { createServerPack } from '@dr-js/core/module/node/server/Server'

const configureServerPack = async ({
  protocol = 'http:', hostname = '127.0.0.1', port,
  fileTLSKey, fileTLSCert, fileTLSCA, fileTLSSNIConfig, fileTLSDHParam,
  ...extraOption
}) => createServerPack({
  protocol, hostname, port,
  ...(protocol === 'https:' && await loadTLS(fileTLSKey, fileTLSCert, fileTLSCA, fileTLSSNIConfig, fileTLSDHParam)),
  ...extraOption
})

// for server support multi HTTPS hostname, check `SNICallback`:
//   https://en.wikipedia.org/wiki/Server_Name_Indication
//   https://github.com/nodejs/node/issues/17567
const loadTLS = async (
  fileTLSKey, fileTLSCert, fileTLSCA, fileTLSSNIConfig,
  fileTLSDHParam // Diffie-Hellman Key Exchange, generate with `openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096`
) => {
  const secureContextMap = {}
  const loadTLSFile = (path) => readFileAsync(fileTLSSNIConfig ? resolve(fileTLSSNIConfig, '..', path) : path)
  const hostnameConfigPairList = Object.entries({
    default: fileTLSKey ? { key: fileTLSKey, cert: fileTLSCert, ca: fileTLSCA } : undefined,
    ...(fileTLSSNIConfig && JSON.parse(await readFileAsync(fileTLSSNIConfig)))
  })
  for (const [ hostname, { key, cert, ca } ] of hostnameConfigPairList) {
    secureContextMap[ hostname ] = createSecureContext({
      key: await loadTLSFile(key),
      cert: await loadTLSFile(cert),
      ca: ca && await loadTLSFile(ca)
    })
  }
  const defaultSecureContext = secureContextMap.default || Object.keys(secureContextMap)[ 0 ] // NOTE: use the first as default
  if (!defaultSecureContext) throw new Error(`missing TLS config`)
  return {
    ...defaultSecureContext,
    SNICallback: fileTLSSNIConfig && ((hostname, callback) => callback(null, secureContextMap[ hostname ] || defaultSecureContext)),
    dhparam: fileTLSDHParam && await readFileAsync(fileTLSDHParam)
  }
}

export { configureServerPack }
