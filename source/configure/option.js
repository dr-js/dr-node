import { Preset } from 'dr-js/module/node/module/Option/preset'

const { parseCompact, parseCompactList, pickOneOf } = Preset

const getServerFormatConfig = (extraList = []) => parseCompact('host,H/SS,O|set "hostname:port"', [
  parseCompact('https,S/T', parseCompactList(
    'file-SSL-key/SP',
    'file-SSL-cert/SP',
    'file-SSL-chain/SP',
    'file-SSL-dhparam/SP'
  )),
  ...extraList
])
const getServerOption = ({ tryGet, tryGetFirst }) => {
  const host = tryGetFirst('host') || ''
  const [ hostname, port ] = host.split(':')
  return {
    protocol: tryGet('https') ? 'https:' : 'http:',
    hostname: hostname || undefined,
    port: Number(port) || undefined,
    fileSSLKey: tryGetFirst('file-SSL-key'),
    fileSSLCert: tryGetFirst('file-SSL-cert'),
    fileSSLChain: tryGetFirst('file-SSL-chain'),
    fileSSLDHParam: tryGetFirst('file-SSL-dhparam')
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

const PermissionFormatConfig = {
  ...pickOneOf([ 'allow', 'deny', 'func', 'file' ]),
  name: 'permission-type',
  extendFormatList: parseCompactList(
    'permission-func/SF,O',
    'permission-file/SP,O'
  )
}
const getPermissionOption = ({ tryGetFirst }) => ({
  permissionType: tryGetFirst('permission-type'),
  permissionFunc: tryGetFirst('permission-func'),
  permissionFile: tryGetFirst('permission-file')
})

export {
  getServerFormatConfig, getServerOption,

  LogFormatConfig, getLogOption,
  PidFormatConfig, getPidOption,
  PermissionFormatConfig, getPermissionOption
}
