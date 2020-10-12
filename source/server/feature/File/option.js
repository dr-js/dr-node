import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

// fileRootPath, fileRootPathPublic, fileUploadMergePath
const FileFormatConfig = parseCompact('file-root-path/SP,O', parseCompactList(
  'file-root-path-public/SP,O',
  'file-upload-merge-path/SP'
))
const getFileOption = ({ tryGetFirst }) => ({
  fileRootPath: tryGetFirst('file-root-path'),
  fileRootPathPublic: tryGetFirst('file-root-path-public'),
  fileUploadMergePath: tryGetFirst('file-upload-merge-path')
})

export { FileFormatConfig, getFileOption }
