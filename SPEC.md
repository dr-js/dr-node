# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/function.js](source/function.js)
  - `getCommonServerStatus`, `isPrivateAddress`
+ 📄 [source/configure/auth.js](source/configure/auth.js)
  - `DEFAULT_AUTH_KEY`, `authFetchTimedLookup`, `configureAuthTimedLookup`, `configureAuthTimedLookupGroup`, `loadLookupFile`, `saveLookupFile`
+ 📄 [source/configure/log.js](source/configure/log.js)
  - `configureLog`
+ 📄 [source/configure/option.js](source/configure/option.js)
  - `AuthFormatConfig`, `AuthGroupFormatConfig`, `LogFormatConfig`, `PermissionFormatConfig`, `PidFormatConfig`, `TokenCacheFormatConfig`, `getAuthGroupOption`, `getAuthOption`, `getLogOption`, `getPermissionOption`, `getPidOption`, `getTokenCacheOption`
+ 📄 [source/configure/permission.js](source/configure/permission.js)
  - `configurePermission`
+ 📄 [source/configure/pid.js](source/configure/pid.js)
  - `configurePid`
+ 📄 [source/configure/server.js](source/configure/server.js)
  - `configureServer`, `getServerSNIOption`
+ 📄 [source/configure/tokenCache.js](source/configure/tokenCache.js)
  - `configureTokenCache`
+ 📄 [source/feature/option.js](source/feature/option.js)
  - `ExplorerFormatConfig`, `StatusCollectFormatConfig`, `StatusReportFormatConfig`, `TaskRunnerFormatConfig`, `getExplorerOption`, `getServerFormatConfig`, `getServerOption`, `getStatusCollectOption`, `getStatusReportOption`, `getTaskRunnerOption`
+ 📄 [source/feature/Explorer/configureFeaturePack.js](source/feature/Explorer/configureFeaturePack.js)
  - `configureFeaturePack`
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
+ 📄 [source/feature/Explorer/task/fileChunkUpload.js](source/feature/Explorer/task/fileChunkUpload.js)
  - `createFileChunkUpload`, `uploadFileByChunk`
+ 📄 [source/feature/Explorer/task/pathAction.js](source/feature/Explorer/task/pathAction.js)
  - `PATH_ACTION_TYPE`, `createGetPathAction`
+ 📄 [source/feature/StatusCollect/HTML.js](source/feature/StatusCollect/HTML.js)
  - `getHTML`
+ 📄 [source/feature/StatusCollect/configureFeaturePack.js](source/feature/StatusCollect/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/StatusCollect/responder.js](source/feature/StatusCollect/responder.js)
  - `createResponderStatusCollect`, `createResponderStatusState`
+ 📄 [source/feature/StatusCollect/configure/applyStatusFact.js](source/feature/StatusCollect/configure/applyStatusFact.js)
  - `applyStatusFact`
+ 📄 [source/feature/StatusCollect/configure/combineStatus.js](source/feature/StatusCollect/configure/combineStatus.js)
  - `combineStatus`, `combineStatusRaw`, `setRangeRaw`, `setSumRaw`
+ 📄 [source/feature/StatusCollect/configure/configureStatusCollector.js](source/feature/StatusCollect/configure/configureStatusCollector.js)
  - `configureStatusCollector`
+ 📄 [source/feature/StatusReport/configureFeaturePack.js](source/feature/StatusReport/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/StatusReport/task/statusReport.js](source/feature/StatusReport/task/statusReport.js)
  - `createGetStatusReport`
+ 📄 [source/feature/TaskRunner/configureFeaturePack.js](source/feature/TaskRunner/configureFeaturePack.js)
  - `configureFeaturePack`
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
+ 📄 [source/featureNode/explorer.js](source/featureNode/explorer.js)
  - `fileDownload`, `fileUpload`, `getAuthFetch`, `pathAction`
+ 📄 [source/featureNode/option.js](source/featureNode/option.js)
  - `NodeExplorerFormatConfig`, `getNodeExplorerOption`
+ 📄 [source/HTML/AuthMask.js](source/HTML/AuthMask.js)
  - `initAuthMask`
+ 📄 [source/HTML/LoadingMask.js](source/HTML/LoadingMask.js)
  - `initLoadingMask`
+ 📄 [source/HTML/Modal.js](source/HTML/Modal.js)
  - `initModal`
+ 📄 [source/HTML/function.js](source/HTML/function.js)
  - `DR_BROWSER_SCRIPT`

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
>     --auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-gen [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>         --auth-gen-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-token-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-time-gap [OPTIONAL-CHECK] [ARGUMENT=1]
>     --auth-group-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-group-default-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-group-key-suffix [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-group-verify-request-tag [OPTIONAL-CHECK] [ARGUMENT=1]
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
>     export DR_SERVER_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_AUTH_GEN_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN_TOKEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN_TIME_GAP="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GROUP_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GROUP_DEFAULT_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GROUP_KEY_SUFFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GROUP_VERIFY_REQUEST_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
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
>     export DR_SERVER_NODE_PATH_ACTION="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_PATH_ACTION_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_TYPE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_KEY_TO="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_ACTION_NAME_LIST="[OPTIONAL-CHECK] [ARGUMENT=1+]"
>     export DR_SERVER_NODE_FILE_UPLOAD="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_UPLOAD_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_UPLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_UPLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_NODE_FILE_DOWNLOAD="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_DOWNLOAD_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_DOWNLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_DOWNLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
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
>     "authFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGen": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authGenTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTimeGap": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupDefaultTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupKeySuffix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupVerifyRequestTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
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
>     "nodePathAction": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "pathActionServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionType": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionKeyTo": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionNameList": [ "[OPTIONAL-CHECK] [ARGUMENT=1+]" ],
>     "nodeFileUpload": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileUploadServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "nodeFileDownload": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileDownloadServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
