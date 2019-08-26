import { Preset } from '@dr-js/core/module/node/module/Option/preset'

import { PATH_ACTION_TYPE } from '@dr-js/node/module/server/feature/Explorer/task/pathAction'

const { pickOneOf, parseCompact, parseCompactList } = Preset

// TODO: still too specific, place this here, remove or upgrade this

const ExplorerClientFormatConfig = parseCompact('node-auth-file/SP,O', parseCompactList(
  'node-auth-key/SS,O',
  [ 'node-file-upload,nfu/T', parseCompactList(
    'file-upload-server-url/SS',
    'file-upload-key/SS',
    'file-upload-path/SP'
  ) ],
  [ 'node-file-download,nfd/T', parseCompactList(
    'file-download-server-url/SS',
    'file-download-key/SS',
    'file-download-path/SP'
  ) ],
  [ 'node-path-action,npa/T', parseCompactList(
    'path-action-server-url/SS',
    [ 'path-action-type', pickOneOf(Object.values(PATH_ACTION_TYPE)) ],
    'path-action-key/SS,O',
    'path-action-key-to/SS,O',
    'path-action-name-list/AS,O'
  ) ]
))

const getExplorerClientOption = ({ tryGet, getFirst, tryGetFirst }) => ({
  authFile: tryGetFirst('node-auth-file'),
  authKey: tryGetFirst('node-auth-key'),
  ...(tryGet('node-file-upload') ? ({
    fileInputPath: getFirst('file-upload-path'),
    key: getFirst('file-upload-key'),
    urlFileUpload: getFirst('file-upload-server-url')
  }) : null),
  ...(tryGet('node-file-download') ? ({
    fileOutputPath: getFirst('file-download-path'),
    key: getFirst('file-download-key'),
    urlFileDownload: getFirst('file-download-server-url')
  }) : null),
  ...(tryGet('node-path-action') ? ({
    nameList: tryGet('path-action-name-list'),
    actionType: getFirst('path-action-type'),
    key: tryGetFirst('path-action-key'),
    keyTo: tryGetFirst('path-action-key-to'),
    urlPathAction: getFirst('path-action-server-url')
  }) : null)
})

export { ExplorerClientFormatConfig, getExplorerClientOption }
