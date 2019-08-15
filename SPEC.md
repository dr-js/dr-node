# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/feature/Auth/HTML.js](source/feature/Auth/HTML.js)
  - `initAuthMask`
+ 📄 [source/feature/Auth/configure.js](source/feature/Auth/configure.js)
  - `AUTH_FILE`, `AUTH_FILE_GROUP`, `AUTH_SKIP`, `DEFAULT_AUTH_KEY`, `configureAuthFile`, `configureAuthFileGroup`, `configureAuthSkip`
+ 📄 [source/feature/Auth/configureFeaturePack.js](source/feature/Auth/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/Auth/option.js](source/feature/Auth/option.js)
  - `AuthFileFormatConfig`, `AuthFileGroupFormatConfig`, `AuthSkipFormatConfig`, `getAuthFileGroupOption`, `getAuthFileOption`, `getAuthSkipOption`
+ 📄 [source/feature/Auth/responder.js](source/feature/Auth/responder.js)
  - `createResponderCheckAuth`, `createResponderGrantAuthHeader`
+ 📄 [source/feature/Explorer/configureFeaturePack.js](source/feature/Explorer/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/Explorer/option.js](source/feature/Explorer/option.js)
  - `ExplorerFormatConfig`, `getExplorerOption`
+ 📄 [source/feature/Explorer/permission.js](source/feature/Explorer/permission.js)
  - `CREATE_PERMISSION_CHECK_MAP`, `PERMISSION_EXPLORER_FILE_UPLOAD_START`, `PERMISSION_EXPLORER_PATH_ACTION`, `PERMISSION_TYPE`
+ 📄 [source/feature/Explorer/responder.js](source/feature/Explorer/responder.js)
  - `createResponderFileChunkUpload`, `createResponderPathAction`, `createResponderServeFile`, `createResponderStorageStatus`
+ 📄 [source/feature/Explorer/HTML/main.js](source/feature/Explorer/HTML/main.js)
  - `getHTML`
+ 📄 [source/feature/Explorer/HTML/pathContent.js](source/feature/Explorer/HTML/pathContent.js)
  - `initPathContent`, `pathContentStyle`
+ 📄 [source/feature/Explorer/HTML/uploader.js](source/feature/Explorer/HTML/uploader.js)
  - `initFileUpload`, `initUploader`
+ 📄 [source/feature/Explorer/task/client.js](source/feature/Explorer/task/client.js)
  - `fileDownload`, `fileUpload`, `pathAction`
+ 📄 [source/feature/Explorer/task/fileChunkUpload.js](source/feature/Explorer/task/fileChunkUpload.js)
  - `createFileChunkUpload`, `uploadFileByChunk`
+ 📄 [source/feature/Explorer/task/pathAction.js](source/feature/Explorer/task/pathAction.js)
  - `PATH_ACTION_TYPE`, `createGetPathAction`
+ 📄 [source/feature/Explorer/task/serverStatus.js](source/feature/Explorer/task/serverStatus.js)
  - `getCommonServerStatus`
+ 📄 [source/feature/Permission/configure.js](source/feature/Permission/configure.js)
  - `configurePermission`
+ 📄 [source/feature/Permission/configureFeaturePack.js](source/feature/Permission/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/Permission/option.js](source/feature/Permission/option.js)
  - `PermissionFormatConfig`, `getPermissionOption`
+ 📄 [source/feature/ServerFetch/HTML.js](source/feature/ServerFetch/HTML.js)
  - `initServerFetch`
+ 📄 [source/feature/ServerFetch/responder.js](source/feature/ServerFetch/responder.js)
  - `responderServerFetch`
+ 📄 [source/feature/StatusCollect/HTML.js](source/feature/StatusCollect/HTML.js)
  - `getHTML`
+ 📄 [source/feature/StatusCollect/configure.js](source/feature/StatusCollect/configure.js)
  - `configureStatusCollector`
+ 📄 [source/feature/StatusCollect/configureFeaturePack.js](source/feature/StatusCollect/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/StatusCollect/option.js](source/feature/StatusCollect/option.js)
  - `StatusCollectFormatConfig`, `getStatusCollectOption`
+ 📄 [source/feature/StatusCollect/responder.js](source/feature/StatusCollect/responder.js)
  - `createResponderStatusCollect`, `createResponderStatusState`
+ 📄 [source/feature/StatusCollect/module/applyStatusFact.js](source/feature/StatusCollect/module/applyStatusFact.js)
  - `applyStatusFact`
+ 📄 [source/feature/StatusCollect/module/combineStatus.js](source/feature/StatusCollect/module/combineStatus.js)
  - `combineStatus`, `combineStatusRaw`, `setRangeRaw`, `setSumRaw`
+ 📄 [source/feature/StatusReport/configureFeaturePack.js](source/feature/StatusReport/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/StatusReport/option.js](source/feature/StatusReport/option.js)
  - `StatusReportFormatConfig`, `getStatusReportOption`
+ 📄 [source/feature/StatusReport/task/statusReport.js](source/feature/StatusReport/task/statusReport.js)
  - `createGetStatusReport`
+ 📄 [source/feature/TaskRunner/configureFeaturePack.js](source/feature/TaskRunner/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/TaskRunner/option.js](source/feature/TaskRunner/option.js)
  - `TaskRunnerFormatConfig`, `getTaskRunnerOption`
+ 📄 [source/feature/TaskRunner/permission.js](source/feature/TaskRunner/permission.js)
  - `CREATE_PERMISSION_CHECK_MAP`, `PERMISSION_TASK_RUNNER_TASK_ACTION`, `PERMISSION_TYPE`
+ 📄 [source/feature/TaskRunner/responder.js](source/feature/TaskRunner/responder.js)
  - `createResponderTaskAction`
+ 📄 [source/feature/TaskRunner/HTML/main.js](source/feature/TaskRunner/HTML/main.js)
  - `getHTML`
+ 📄 [source/feature/TaskRunner/HTML/taskList.js](source/feature/TaskRunner/HTML/taskList.js)
  - `initTaskList`, `taskListStyle`
+ 📄 [source/feature/TaskRunner/task/taskAction.js](source/feature/TaskRunner/task/taskAction.js)
  - `TASK_ACTION_TYPE`, `createTaskAction`
+ 📄 [source/feature/TokenCache/configure.js](source/feature/TokenCache/configure.js)
  - `DEFAULT_TOKEN_KEY`, `configureTokenCache`
+ 📄 [source/feature/TokenCache/option.js](source/feature/TokenCache/option.js)
  - `TokenCacheFormatConfig`, `getTokenCacheOption`
+ 📄 [source/feature/TokenCache/responder.js](source/feature/TokenCache/responder.js)
  - `createResponderAssignTokenCookie`, `createResponderAssignTokenHeader`, `createResponderCheckToken`
+ 📄 [source/share/option.js](source/share/option.js)
  - `LogFormatConfig`, `PidFormatConfig`, `getLogOption`, `getPidOption`, `getServerFormatConfig`, `getServerOption`
+ 📄 [source/share/responder.js](source/share/responder.js)
  - `responderCommonExtend`
+ 📄 [source/share/configure/log.js](source/share/configure/log.js)
  - `configureLog`
+ 📄 [source/share/configure/pid.js](source/share/configure/pid.js)
  - `configurePid`
+ 📄 [source/share/configure/server.js](source/share/configure/server.js)
  - `configureServer`, `getServerSNIOption`
+ 📄 [source/share/HTML/LoadingMask.js](source/share/HTML/LoadingMask.js)
  - `initLoadingMask`
+ 📄 [source/share/HTML/Modal.js](source/share/HTML/Modal.js)
  - `initModal`
+ 📄 [source/share/module/PrivateAddress.js](source/share/module/PrivateAddress.js)
  - `isPrivateAddress`
+ 📄 [source/share/module/RequestParam.js](source/share/module/RequestParam.js)
  - `getRequestParam`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env"
>       from JS/JSON file: set to "path/to/config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --quiet --q -q [OPTIONAL] [ARGUMENT=0+]
>       less log
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --host --H -H [OPTIONAL] [ARGUMENT=1]
>       set "hostname:port"
>     --https --S -S [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --file-SSL-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-cert [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-chain [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-dhparam [OPTIONAL-CHECK] [ARGUMENT=1]
>     --log-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --log-file-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>     --pid-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --pid-ignore-exist [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>     --auth-skip [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>     --auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-file-gen-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>           set to enable auto gen auth file
>         --auth-file-gen-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-file-gen-token-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-file-gen-time-gap [OPTIONAL-CHECK] [ARGUMENT=1]
>     --auth-file-group-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-file-group-default-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-file-group-key-suffix [OPTIONAL-CHECK] [ARGUMENT=1]
>     --permission-type [OPTIONAL-CHECK] [ARGUMENT=1]
>         one of:
>           allow deny func file
>       --permission-func [OPTIONAL-CHECK] [ARGUMENT=1]
>       --permission-file [OPTIONAL-CHECK] [ARGUMENT=1]
>     --explorer-root-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --explorer-upload-merge-path [OPTIONAL-CHECK] [ARGUMENT=1]
>     --status-collect-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --status-collect-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --status-collect-interval [OPTIONAL-CHECK] [ARGUMENT=1]
>     --status-report-process-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>     --task-runner-root-path [OPTIONAL-CHECK] [ARGUMENT=1]
>   --node-auth-file [OPTIONAL] [ARGUMENT=1]
>     --node-auth-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --node-file-upload --nfu [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --file-upload-server-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-upload-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-upload-path [OPTIONAL-CHECK] [ARGUMENT=1]
>     --node-file-download --nfd [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --file-download-server-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-download-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-download-path [OPTIONAL-CHECK] [ARGUMENT=1]
>     --node-path-action --npa [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --path-action-server-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --path-action-type [OPTIONAL-CHECK] [ARGUMENT=1]
>           one of:
>             path:visible path:stat path:copy path:move
>             path:delete directory:create directory:content directory:all-file-list
>       --path-action-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --path-action-key-to [OPTIONAL-CHECK] [ARGUMENT=1]
>       --path-action-name-list [OPTIONAL-CHECK] [ARGUMENT=1+]
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_SERVER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_SERVER_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_QUIET="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_HOST="[OPTIONAL] [ARGUMENT=1]"
>     export DR_SERVER_HTTPS="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_SSL_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_SSL_CERT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_SSL_CHAIN="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_SSL_DHPARAM="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_LOG_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_LOG_FILE_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PID_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PID_IGNORE_EXIST="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_AUTH_SKIP="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE_GEN_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE_GEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE_GEN_TOKEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE_GEN_TIME_GAP="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE_GROUP_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE_GROUP_DEFAULT_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE_GROUP_KEY_SUFFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PERMISSION_TYPE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PERMISSION_FUNC="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PERMISSION_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_EXPLORER_ROOT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_EXPLORER_UPLOAD_MERGE_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_STATUS_COLLECT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_STATUS_COLLECT_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_STATUS_COLLECT_INTERVAL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_STATUS_REPORT_PROCESS_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_TASK_RUNNER_ROOT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_NODE_AUTH_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export DR_SERVER_NODE_AUTH_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_NODE_FILE_UPLOAD="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_UPLOAD_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_UPLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_UPLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_NODE_FILE_DOWNLOAD="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_DOWNLOAD_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_DOWNLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_DOWNLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_NODE_PATH_ACTION="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_PATH_ACTION_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_TYPE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_KEY_TO="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_NAME_LIST="[OPTIONAL-CHECK] [ARGUMENT=1+]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "host": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "https": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileSSLKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLCert": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLChain": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLDhparam": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "logPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "logFilePrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authSkip": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGenTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGenTokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGenTimeGap": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGroupPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGroupDefaultTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGroupKeySuffix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "permissionType": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "permissionFunc": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "permissionFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "explorerRootPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "explorerUploadMergePath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statusCollectPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statusCollectUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statusCollectInterval": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statusReportProcessTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "taskRunnerRootPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "nodeAuthFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "nodeAuthKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "nodeFileUpload": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileUploadServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "nodeFileDownload": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileDownloadServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "nodePathAction": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "pathActionServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionType": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionKeyTo": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionNameList": [ "[OPTIONAL-CHECK] [ARGUMENT=1+]" ],
>   }
> ```
