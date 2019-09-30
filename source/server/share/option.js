import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const getServerPackFormatConfig = (extraList = []) => parseCompact('host,H/SS,O|set "hostname:port"', [
  parseCompact('https,S/T', parseCompactList(
    'file-TLS-key/SP',
    'file-TLS-cert/SP',
    'file-TLS-CA/SP,O|trusted CA cert',
    'file-TLS-SNI-config/SP,O|TLS SNI JSON like: { [hostname]: { key, cert, ca } }',
    'file-TLS-dhparam/SP|Diffie-Hellman Key Exchange, generate with: "openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096"'
  )),
  ...extraList
])
const getServerPackOption = ({ tryGet, tryGetFirst }, defaultHostname = '127.0.0.1') => {
  const host = tryGetFirst('host') || ''
  const hostnameList = host.split(':')
  const port = Number(hostnameList.pop())
  const hostname = hostnameList.join(':') || defaultHostname
  return {
    protocol: tryGet('https') ? 'https:' : 'http:',
    hostname: hostname || undefined,
    port: Number(port) || undefined,
    fileTLSKey: tryGetFirst('file-TLS-key'),
    fileTLSCert: tryGetFirst('file-TLS-cert'),
    fileTLSCA: tryGetFirst('file-TLS-ca'),
    fileTLSSNIConfig: tryGetFirst('file-TLS-SNI-config'),
    fileTLSDHParam: tryGetFirst('file-TLS-dhparam')
  }
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
