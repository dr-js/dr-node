import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const AuthSkipFormatConfig = parseCompact('auth-skip/T')
const getAuthSkipOption = ({ tryGetFirst }) => ({
  authSkip: tryGetFirst('auth-skip')
})

const AuthFileFormatConfig = parseCompact('auth-file/SP,O')
const getAuthFileOption = ({ tryGetFirst }) => ({
  authFile: tryGetFirst('auth-file')
})

const AuthFileGroupFormatConfig = parseCompact('auth-file-group-path/SP,O', parseCompactList(
  'auth-file-group-default-tag/SS',
  'auth-file-group-key-suffix/SS,O'
))
const getAuthFileGroupOption = ({ tryGetFirst }) => ({
  authFileGroupPath: tryGetFirst('auth-file-group-path'),
  authFileGroupDefaultTag: tryGetFirst('auth-file-group-default-tag'),
  authFileGroupKeySuffix: tryGetFirst('auth-file-group-key-suffix')
})

export {
  AuthSkipFormatConfig, getAuthSkipOption,
  AuthFileFormatConfig, getAuthFileOption,
  AuthFileGroupFormatConfig, getAuthFileGroupOption
}
