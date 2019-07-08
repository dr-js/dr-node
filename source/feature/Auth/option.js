import { Preset } from 'dr-js/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const AuthSkipFormatConfig = parseCompact('auth-skip/T')
const getAuthSkipOption = ({ tryGetFirst }) => ({
  authSkip: tryGetFirst('auth-skip')
})

const AuthFileFormatConfig = parseCompact('auth-file/SP,O', parseCompactList(
  [ 'auth-file-gen-tag/SS,O|set to enable auto gen auth file', parseCompactList(
    'auth-file-gen-size/SI,O',
    'auth-file-gen-token-size/SI,O',
    'auth-file-gen-time-gap/SI,O'
  ) ]
))
const getAuthFileOption = ({ tryGetFirst }) => ({
  authFile: tryGetFirst('auth-file'),
  authFileGenTag: tryGetFirst('auth-file-gen-tag'),
  authFileGenSize: tryGetFirst('auth-file-gen-size'),
  authFileGenTokenSize: tryGetFirst('auth-file-gen-token-size'),
  authFileGenTimeGap: tryGetFirst('auth-file-gen-time-gap')
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
