# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/module/Auth.js](source/module/Auth.js)
  - `AUTH_FILE`, `AUTH_FILE_GROUP`, `AUTH_SKIP`, `DEFAULT_AUTH_KEY`, `configureAuthFile`, `configureAuthFileGroup`, `configureAuthSkip`, `describeAuthFile`, `generateAuthCheckCode`, `generateAuthFile`, `loadAuthFile`, `saveAuthFile`, `verifyAuthCheckCode`
+ 📄 [source/module/Compress.js](source/module/Compress.js)
  - `checkBloat`, `compressFile`, `compressFileList`
+ 📄 [source/module/FactDatabase.js](source/module/FactDatabase.js)
  - `INITIAL_FACT_INFO`, `createFactDatabase`, `tryDeleteExtraCache`, `tryLoadFactInfo`
+ 📄 [source/module/FileChunkUpload.js](source/module/FileChunkUpload.js)
  - `createFileChunkUpload`, `uploadFileByChunk`
+ 📄 [source/module/Log.js](source/module/Log.js)
  - `configureLog`
+ 📄 [source/module/PathAction.js](source/module/PathAction.js)
  - `PATH_ACTION_TYPE`, `createGetPathAction`
+ 📄 [source/module/Permission.js](source/module/Permission.js)
  - `configurePermission`
+ 📄 [source/module/Pid.js](source/module/Pid.js)
  - `configurePid`
+ 📄 [source/module/PrivateAddress.js](source/module/PrivateAddress.js)
  - `isPrivateAddress`
+ 📄 [source/module/RequestCommon.js](source/module/RequestCommon.js)
  - `getRequestBuffer`, `getRequestJSON`, `getRequestParam`
+ 📄 [source/module/ServerPack.js](source/module/ServerPack.js)
  - `configureServerPack`
+ 📄 [source/module/ServerStatus.js](source/module/ServerStatus.js)
  - `getCommonServerStatus`
+ 📄 [source/module/TaskAction.js](source/module/TaskAction.js)
  - `TASK_ACTION_TYPE`, `createTaskAction`
+ 📄 [source/module/TokenCache.js](source/module/TokenCache.js)
  - `DEFAULT_TOKEN_KEY`, `configureTokenCache`
+ 📄 [source/module/Software/7z.js](source/module/Software/7z.js)
  - `compressConfig`, `compressFileConfig`, `detect`, `extractConfig`
+ 📄 [source/module/Software/function.js](source/module/Software/function.js)
  - `createDetect`
+ 📄 [source/module/Software/git.js](source/module/Software/git.js)
  - `detect`, `getGitBranch`, `getGitCommitHash`
+ 📄 [source/module/Software/tar.js](source/module/Software/tar.js)
  - `compressConfig`, `detect`, `extractConfig`
+ 📄 [source/module/Stat/StatCollect.js](source/module/Stat/StatCollect.js)
  - `configureStatCollect`
+ 📄 [source/module/Stat/StatReport.js](source/module/Stat/StatReport.js)
  - `createGetStatReport`
+ 📄 [source/module/Stat/module/applyStatFact.js](source/module/Stat/module/applyStatFact.js)
  - `applyStatFact`
+ 📄 [source/module/Stat/module/combineStat.js](source/module/Stat/module/combineStat.js)
  - `combineStat`, `combineStatRaw`, `setRangeRaw`, `setSumRaw`
+ 📄 [source/server/feature/Auth/HTML.js](source/server/feature/Auth/HTML.js)
  - `initAuthMask`
+ 📄 [source/server/feature/Auth/configureFeaturePack.js](source/server/feature/Auth/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/server/feature/Auth/option.js](source/server/feature/Auth/option.js)
  - `AuthFileFormatConfig`, `AuthFileGroupFormatConfig`, `AuthSkipFormatConfig`, `getAuthFileGroupOption`, `getAuthFileOption`, `getAuthSkipOption`
+ 📄 [source/server/feature/Auth/responder.js](source/server/feature/Auth/responder.js)
  - `createResponderCheckAuth`, `createResponderGrantAuthHeader`
+ 📄 [source/server/feature/Explorer/client.js](source/server/feature/Explorer/client.js)
  - `fileDownload`, `fileUpload`, `pathAction`
+ 📄 [source/server/feature/Explorer/configureFeaturePack.js](source/server/feature/Explorer/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/server/feature/Explorer/option.js](source/server/feature/Explorer/option.js)
  - `ExplorerFormatConfig`, `getExplorerOption`
+ 📄 [source/server/feature/Explorer/permission.js](source/server/feature/Explorer/permission.js)
  - `CREATE_PERMISSION_CHECK_MAP`, `PERMISSION_EXPLORER_FILE_UPLOAD_START`, `PERMISSION_EXPLORER_PATH_ACTION`, `PERMISSION_TYPE`
+ 📄 [source/server/feature/Explorer/responder.js](source/server/feature/Explorer/responder.js)
  - `createResponderFileChunkUpload`, `createResponderPathAction`, `createResponderServeFile`, `createResponderStorageStatus`
+ 📄 [source/server/feature/Explorer/HTML/main.js](source/server/feature/Explorer/HTML/main.js)
  - `getHTML`
+ 📄 [source/server/feature/Explorer/HTML/pathContent.js](source/server/feature/Explorer/HTML/pathContent.js)
  - `initPathContent`, `pathContentStyle`
+ 📄 [source/server/feature/Explorer/HTML/uploader.js](source/server/feature/Explorer/HTML/uploader.js)
  - `initFileUpload`, `initUploader`
+ 📄 [source/server/feature/Permission/configureFeaturePack.js](source/server/feature/Permission/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/server/feature/Permission/option.js](source/server/feature/Permission/option.js)
  - `PermissionFormatConfig`, `getPermissionOption`
+ 📄 [source/server/feature/ServerFetch/HTML.js](source/server/feature/ServerFetch/HTML.js)
  - `initServerFetch`
+ 📄 [source/server/feature/ServerFetch/responder.js](source/server/feature/ServerFetch/responder.js)
  - `responderServerFetch`
+ 📄 [source/server/feature/StatCollect/HTML.js](source/server/feature/StatCollect/HTML.js)
  - `getHTML`
+ 📄 [source/server/feature/StatCollect/configureFeaturePack.js](source/server/feature/StatCollect/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/server/feature/StatCollect/option.js](source/server/feature/StatCollect/option.js)
  - `StatCollectFormatConfig`, `getStatCollectOption`
+ 📄 [source/server/feature/StatCollect/responder.js](source/server/feature/StatCollect/responder.js)
  - `createResponderStatCollect`, `createResponderStatState`
+ 📄 [source/server/feature/StatReport/configureFeaturePack.js](source/server/feature/StatReport/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/server/feature/StatReport/option.js](source/server/feature/StatReport/option.js)
  - `StatReportFormatConfig`, `getStatReportOption`
+ 📄 [source/server/feature/TaskRunner/configureFeaturePack.js](source/server/feature/TaskRunner/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/server/feature/TaskRunner/option.js](source/server/feature/TaskRunner/option.js)
  - `TaskRunnerFormatConfig`, `getTaskRunnerOption`
+ 📄 [source/server/feature/TaskRunner/permission.js](source/server/feature/TaskRunner/permission.js)
  - `CREATE_PERMISSION_CHECK_MAP`, `PERMISSION_TASK_RUNNER_TASK_ACTION`, `PERMISSION_TYPE`
+ 📄 [source/server/feature/TaskRunner/responder.js](source/server/feature/TaskRunner/responder.js)
  - `createResponderTaskAction`
+ 📄 [source/server/feature/TaskRunner/HTML/main.js](source/server/feature/TaskRunner/HTML/main.js)
  - `getHTML`
+ 📄 [source/server/feature/TaskRunner/HTML/taskList.js](source/server/feature/TaskRunner/HTML/taskList.js)
  - `initTaskList`, `taskListStyle`
+ 📄 [source/server/feature/TokenCache/option.js](source/server/feature/TokenCache/option.js)
  - `TokenCacheFormatConfig`, `getTokenCacheOption`
+ 📄 [source/server/feature/TokenCache/responder.js](source/server/feature/TokenCache/responder.js)
  - `createResponderAssignTokenCookie`, `createResponderAssignTokenHeader`, `createResponderCheckToken`
+ 📄 [source/server/share/option.js](source/server/share/option.js)
  - `LogFormatConfig`, `PidFormatConfig`, `getLogOption`, `getPidOption`, `getServerPackFormatConfig`, `getServerPackOption`
+ 📄 [source/server/share/HTML/LoadingMask.js](source/server/share/HTML/LoadingMask.js)
  - `initLoadingMask`
+ 📄 [source/server/share/HTML/Modal.js](source/server/share/HTML/Modal.js)
  - `initModal`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env"
>       from JS/JSON file: set to "path/to/config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --quiet --q -q [OPTIONAL] [ARGUMENT=0+]
>       less log
>   --input-file --I -I [OPTIONAL] [ARGUMENT=1]
>       common option
>   --output-file --O -O [OPTIONAL] [ARGUMENT=1]
>       common option
>   --file-upload-server-url --fusu [OPTIONAL] [ARGUMENT=1]
>       require provide "auth-file" or "auth-file-group"
>     --file-upload-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-upload-path [OPTIONAL-CHECK] [ARGUMENT=1]
>   --file-download-server-url --fdsu [OPTIONAL] [ARGUMENT=1]
>       require provide "auth-file" or "auth-file-group"
>     --file-download-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-download-path [OPTIONAL-CHECK] [ARGUMENT=1]
>   --path-action-server-url --pasu [OPTIONAL] [ARGUMENT=1]
>       require provide "auth-file" or "auth-file-group"
>     --path-action-type [OPTIONAL-CHECK] [ARGUMENT=1]
>         one of:
>           path:visible path:stat path:copy path:move
>           path:delete directory:create directory:content directory:all-file-list
>     --path-action-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --path-action-key-to [OPTIONAL-CHECK] [ARGUMENT=1]
>     --path-action-name-list [OPTIONAL-CHECK] [ARGUMENT=1+]
>   --auth-gen-tag --agt [OPTIONAL] [ARGUMENT=1]
>       generate auth file: -O=outputFile
>     --auth-gen-size [OPTIONAL-CHECK] [ARGUMENT=1]
>     --auth-gen-token-size [OPTIONAL-CHECK] [ARGUMENT=1]
>     --auth-gen-time-gap [OPTIONAL-CHECK] [ARGUMENT=1]
>     --auth-gen-info [OPTIONAL-CHECK] [ARGUMENT=1]
>   --auth-file-describe --afd [OPTIONAL] [ARGUMENT=0+]
>       describe auth file: -I=authFile
>   --auth-check-code-generate --accg [OPTIONAL] [ARGUMENT=0-1]
>       generate checkCode from auth file: -I=authFile, $0=timestamp/now
>   --auth-check-code-verify --accv [OPTIONAL] [ARGUMENT=1-2]
>       verify checkCode with auth file: -I=authFile, $@=checkCode,timestamp/now
>   --file-list --ls [OPTIONAL] [ARGUMENT=0-1]
>       list file: $0=path/cwd
>   --file-list-all --ls-R --lla [OPTIONAL] [ARGUMENT=0-1]
>       list all file: $0=path/cwd
>   --file-tree --tree [OPTIONAL] [ARGUMENT=0-1]
>       list all file in tree: $0=path/cwd
>   --compress-7z --c7z [OPTIONAL] [ARGUMENT=1]
>       compress with 7zip: -O=outputFile, $0=inputDirectory
>   --extract-7z --e7z [OPTIONAL] [ARGUMENT=1]
>       extract with 7zip: -I=inputFile, $0=outputDirectory
>   --compress-tar --ctar [OPTIONAL] [ARGUMENT=1]
>       compress with tar: -O=outputFile, $0=inputDirectory
>   --extract-tar --etar [OPTIONAL] [ARGUMENT=1]
>       extract with tar: -I=inputFile, $0=outputDirectory
>   --git-branch --gb [OPTIONAL] [ARGUMENT=0+]
>       print git branch
>   --git-commit-hash --gch [OPTIONAL] [ARGUMENT=0+]
>       print git commit hash
>   --host --H -H [OPTIONAL] [ARGUMENT=1]
>       set "hostname:port"
>     --https --S -S [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --file-TLS-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-TLS-cert [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-TLS-CA [OPTIONAL-CHECK] [ARGUMENT=1]
>           trusted CA cert
>       --file-TLS-SNI-config [OPTIONAL-CHECK] [ARGUMENT=1]
>           TLS SNI JSON like: { [hostname]: { key, cert, ca } }
>       --file-TLS-dhparam [OPTIONAL-CHECK] [ARGUMENT=1]
>           Diffie-Hellman Key Exchange, generate with: "openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096"
>     --log-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --log-file-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>     --pid-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --pid-ignore-exist [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>     --auth-skip [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>     --auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
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
>       --explorer-status-command-list [OPTIONAL-CHECK]
>     --stat-collect-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --stat-collect-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --stat-collect-interval [OPTIONAL-CHECK] [ARGUMENT=1]
>     --stat-report-process-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>     --task-runner-root-path [OPTIONAL-CHECK] [ARGUMENT=1]
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_NODE_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_NODE_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_NODE_QUIET="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_NODE_INPUT_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_OUTPUT_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_FILE_UPLOAD_SERVER_URL="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_FILE_UPLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_FILE_UPLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_SERVER_URL="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_SERVER_URL="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_TYPE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_KEY_TO="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_NAME_LIST="[OPTIONAL-CHECK] [ARGUMENT=1+]"
>     export DR_NODE_AUTH_GEN_TAG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_TOKEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_TIME_GAP="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_INFO="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_DESCRIBE="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_NODE_AUTH_CHECK_CODE_GENERATE="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_AUTH_CHECK_CODE_VERIFY="[OPTIONAL] [ARGUMENT=1-2]"
>     export DR_NODE_FILE_LIST="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_FILE_LIST_ALL="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_FILE_TREE="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_COMPRESS_7Z="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_EXTRACT_7Z="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_COMPRESS_TAR="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_EXTRACT_TAR="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_GIT_BRANCH="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_NODE_GIT_COMMIT_HASH="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_NODE_HOST="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_HTTPS="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_NODE_FILE_TLS_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_FILE_TLS_CERT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_FILE_TLS_CA="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_FILE_TLS_SNI_CONFIG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_FILE_TLS_DHPARAM="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_LOG_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_LOG_FILE_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PID_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PID_IGNORE_EXIST="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_NODE_AUTH_SKIP="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_NODE_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_DEFAULT_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_KEY_SUFFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PERMISSION_TYPE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PERMISSION_FUNC="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_PERMISSION_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_EXPLORER_ROOT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_EXPLORER_UPLOAD_MERGE_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_EXPLORER_STATUS_COMMAND_LIST="[OPTIONAL-CHECK]"
>     export DR_NODE_STAT_COLLECT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_STAT_COLLECT_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_STAT_COLLECT_INTERVAL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_STAT_REPORT_PROCESS_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_NODE_TASK_RUNNER_ROOT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "inputFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "outputFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "fileUploadServerUrl": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "fileUploadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadServerUrl": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "fileDownloadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionServerUrl": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "pathActionType": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionKeyTo": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathActionNameList": [ "[OPTIONAL-CHECK] [ARGUMENT=1+]" ],
>     "authGenTag": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "authGenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTimeGap": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenInfo": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileDescribe": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "authCheckCodeGenerate": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "authCheckCodeVerify": [ "[OPTIONAL] [ARGUMENT=1-2]" ],
>     "fileList": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "fileListAll": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "fileTree": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "compress7z": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "extract7z": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "compressTar": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "extractTar": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "gitBranch": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "gitCommitHash": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "host": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "https": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileTLSKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileTLSCert": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileTLSCA": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileTLSSNIConfig": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileTLSDhparam": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "logPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "logFilePrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authSkip": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGroupPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGroupDefaultTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFileGroupKeySuffix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "permissionType": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "permissionFunc": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "permissionFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "explorerRootPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "explorerUploadMergePath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "explorerStatusCommandList": [ "[OPTIONAL-CHECK]" ],
>     "statCollectPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statCollectUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statCollectInterval": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statReportProcessTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "taskRunnerRootPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
