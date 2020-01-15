import { resolve } from 'path'
import { isString, isBasicObject } from '@dr-js/core/module/common/check'
import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const getServerPackFormatConfig = (extraList = []) => parseCompact('host,H/SS,O|set "hostname:port"', [
  parseCompact('https,S/T', parseCompactList( // TODO: deprecate https, just use `TLS-SNI-config`?
    `TLS-SNI-config/SO,O|TLS SNI config map:\n  ${[
      'multi config: { [hostname]: { key: pathOrBuffer, cert: pathOrBuffer, ca: pathOrBuffer } }, default to special hostname "default", or the first config',
      'single config: { key: pathOrBuffer, cert: pathOrBuffer, ca: pathOrBuffer }',
      'key: Private keys in PEM format',
      'cert: Cert chains in PEM format',
      'ca: Optionally override the trusted CA certificates'
    ].join('\n  ')}`,
    'TLS-dhparam/O/1|pathOrBuffer; Diffie-Hellman Key Exchange, generate with: "openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096"',

    'file-TLS-key/SP,O|<DEPRECATE> Private keys in PEM format', // TODO: deprecate
    'file-TLS-cert/SP,O|<DEPRECATE> Cert chains in PEM format', // TODO: deprecate
    'file-TLS-CA/SP,O|<DEPRECATE> Optionally override the trusted CA certificates', // TODO: deprecate
    'file-TLS-SNI-config/SP,O|<DEPRECATE> path to TLS SNI JSON file', // TODO: deprecate
    'file-TLS-dhparam/SP,O|<DEPRECATE> Diffie-Hellman Key Exchange, generate with: "openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096"' // TODO: deprecate
  )),
  ...extraList
])
const getServerPackOption = ({ tryGet, tryGetFirst, pwd }, defaultHostname = '127.0.0.1') => {
  const host = tryGetFirst('host') || ''
  const hostnameList = host.split(':')
  const port = Number(hostnameList.pop())
  const hostname = hostnameList.join(':') || defaultHostname
  const pwdTLSSNIConfig = pwd('TLS-SNI-config') // should be the same for `TLS-dhparam`
  const autoResolve = (value) => isString(value) ? resolve(pwdTLSSNIConfig, value) : value
  return {
    protocol: tryGet('https') ? 'https:' : 'http:',
    hostname: hostname || undefined,
    port: Number(port) || undefined,
    ...(pwdTLSSNIConfig && {
      TLSSNIConfig: objectMapDeep(tryGetFirst('TLS-SNI-config'), autoResolve),
      TLSDHParam: autoResolve(tryGetFirst('TLS-dhparam'))
    }),
    fileTLSKey: tryGetFirst('file-TLS-key'), // TODO: deprecate
    fileTLSCert: tryGetFirst('file-TLS-cert'), // TODO: deprecate
    fileTLSCA: tryGetFirst('file-TLS-CA'), // TODO: deprecate
    fileTLSSNIConfig: tryGetFirst('file-TLS-SNI-config') // TODO: deprecate
  }
}
const objectMapDeep = (object, mapFunc) => {
  const result = {}
  for (const [ key, value ] of Object.entries(object)) result[ key ] = (isBasicObject(value) && !Buffer.isBuffer(value)) ? objectMapDeep(value, mapFunc) : mapFunc(value, key)
  return result
}

const LogFormatConfig = parseCompact('log-path/SP,O', parseCompactList(
  'log-file-prefix/SS,O'
))
const getLogOption = ({ tryGetFirst }) => ({
  pathLogDirectory: tryGetFirst('log-path'),
  logFilePrefix: tryGetFirst('log-file-prefix')
})

const PidFormatConfig = parseCompact('pid-file/SP,O', parseCompactList(
  'pid-ignore-exist/T'
))
const getPidOption = ({ tryGet, tryGetFirst }) => ({
  filePid: tryGetFirst('pid-file'),
  shouldIgnoreExistPid: Boolean(tryGet('pid-ignore-exist'))
})

export {
  getServerPackFormatConfig, getServerPackOption,

  LogFormatConfig, getLogOption,
  PidFormatConfig, getPidOption
}
