import { parseCompactFormat as parse } from 'dr-js/module/node/module/Option/preset'

const parseList = (...args) => args.map(parse)

const NodeExplorerFormatConfig = {
  ...parse('node-auth-file/SP,O'),
  extendFormatList: [
    parse('node-auth-key/SS,O'),
    {
      ...parse('node-path-action,npa/T'),
      extendFormatList: parseList(
        'path-action-server-url/SS',
        'path-action-type/SS',
        'path-action-key/SS,O',
        'path-action-key-to/SS,O',
        'path-action-name-list/AS,O'
      )
    },
    {
      ...parse('node-file-upload,nfu/T'),
      extendFormatList: parseList(
        'file-upload-server-url/SS',
        'file-upload-key/SS',
        'file-upload-path/SP'
      )
    },
    {
      ...parse('node-file-download,nfd/T'),
      extendFormatList: parseList(
        'file-download-server-url/SS',
        'file-download-key/SS',
        'file-download-path/SP'
      )
    }
  ]
}
const getNodeExplorerOption = ({ tryGet, getFirst, tryGetFirst }) => ({
  ...(tryGet('node-path-action') ? ({
    nameList: tryGet('path-action-name-list'),
    actionType: getFirst('path-action-type'),
    key: tryGetFirst('path-action-key'),
    keyTo: tryGetFirst('path-action-key-to'),
    urlPathAction: getFirst('path-action-server-url')
  }) : null),
  ...(tryGet('node-file-upload') ? ({
    fileInputPath: getFirst('file-upload-path'),
    filePath: getFirst('file-upload-key'),
    urlFileUpload: getFirst('file-upload-server-url')
  }) : null),
  ...(tryGet('node-file-download') ? ({
    fileOutputPath: getFirst('file-download-path'),
    filePath: getFirst('file-download-key'),
    urlFileDownload: getFirst('file-download-server-url')
  }) : null),
  fileAuth: tryGetFirst('node-auth-file'),
  authKey: tryGetFirst('node-auth-key')
})

export { NodeExplorerFormatConfig, getNodeExplorerOption }
