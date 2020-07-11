import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

// fileRootPath, fileUploadMergePath
const FileFormatConfig = parseCompact('file-root-path/SP,O', parseCompactList(
  'file-upload-merge-path/SP'
))
const getFileOption = ({ tryGetFirst }) => ({
  fileRootPath: tryGetFirst('file-root-path'),
  fileUploadMergePath: tryGetFirst('file-upload-merge-path')
})

export { FileFormatConfig, getFileOption }
