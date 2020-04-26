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
+ 📄 [source/module/FsPack.js](source/module/FsPack.js)
  - `TYPE_DIRECTORY`, `TYPE_FILE`, `append`, `appendContentList`, `appendDirectory`, `appendFile`, `appendFromPath`, `initFsPack`, `loadFsPack`, `saveFsPack`, `setFsPackPackRoot`, `setFsPackUnpackPath`, `unpack`, `unpackContentList`, `unpackDirectory`, `unpackFile`, `unpackToPath`
+ 📄 [source/module/Log.js](source/module/Log.js)
  - `configureLog`
+ 📄 [source/module/Permission.js](source/module/Permission.js)
  - `configurePermission`
+ 📄 [source/module/Pid.js](source/module/Pid.js)
  - `configurePid`
+ 📄 [source/module/PingRace.js](source/module/PingRace.js)
  - `PING_STAT_ERROR`, `pingRaceUrlList`, `pingStatUrlList`
+ 📄 [source/module/PrivateAddress.js](source/module/PrivateAddress.js)
  - `isPrivateAddress`
+ 📄 [source/module/RequestCommon.js](source/module/RequestCommon.js)
  - `getRequestBuffer`, `getRequestJSON`, `getRequestParam`
+ 📄 [source/module/RunDetached.js](source/module/RunDetached.js)
  - `findDetachedProcessAsync`, `runDetached`
+ 📄 [source/module/ServerPack.js](source/module/ServerPack.js)
  - `configureServerPack`
+ 📄 [source/module/ServerStatus.js](source/module/ServerStatus.js)
  - `getCommonServerStatus`
+ 📄 [source/module/TerminalColor.js](source/module/TerminalColor.js)
  - `configureTerminalColor`
+ 📄 [source/module/TerminalStatusBar.js](source/module/TerminalStatusBar.js)
  - `createStatusBar`
+ 📄 [source/module/TokenCache.js](source/module/TokenCache.js)
  - `DEFAULT_TOKEN_KEY`, `configureTokenCache`
+ 📄 [source/module/PathAction/base.js](source/module/PathAction/base.js)
  - `PATH_ACTION_MAP`, `PATH_ACTION_TYPE`, `createPathActionTask`
+ 📄 [source/module/PathAction/extraCompress.js](source/module/PathAction/extraCompress.js)
  - `PATH_ACTION_MAP`, `PATH_ACTION_TYPE`
+ 📄 [source/module/Software/7z.js](source/module/Software/7z.js)
  - `compressConfig`, `compressFileConfig`, `compressTgzAsync`, `detect`, `extractConfig`, `extractTgzAsync`, `getCommand`, `setCommand`
+ 📄 [source/module/Software/function.js](source/module/Software/function.js)
  - `createCommandWrap`, `createDetect`
+ 📄 [source/module/Software/git.js](source/module/Software/git.js)
  - `detect`, `getCommand`, `getGitBranch`, `getGitCommitHash`, `setCommand`
+ 📄 [source/module/Software/npm.js](source/module/Software/npm.js)
  - `findUpPackageRoot`, `fromGlobalNodeModules`, `fromNpmNodeModules`, `getPathNpm`, `getPathNpmExecutable`, `getPathNpmGlobalRoot`, `parsePackageNameAndVersion`
+ 📄 [source/module/Software/tar.js](source/module/Software/tar.js)
  - `compressConfig`, `detect`, `extractConfig`, `getCommand`, `setCommand`
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
>       from ENV: set to "env" to enable, not using be default
>       from JS/JSON file: set to "path/to/file.config.js|json"
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
>     --file-upload-key [ARGUMENT=1]
>     --file-upload-path [ARGUMENT=1]
>   --file-download-server-url --fdsu [OPTIONAL] [ARGUMENT=1]
>       require provide "auth-file" or "auth-file-group"
>     --file-download-key [ARGUMENT=1]
>     --file-download-path [ARGUMENT=1]
>   --path-action-server-url --pasu [OPTIONAL] [ARGUMENT=1]
>       require provide "auth-file" or "auth-file-group"
>     --path-action-type [ARGUMENT=1]
>         one of:
>           path:visible path:stat path:copy path:rename
>           path:delete directory:create directory:content directory:all-file-list
>           extra:compress:7z extra:extract:7z extra:compress:tar extra:extract:tar
>     --path-action-key [ARGUMENT=1]
>     --path-action-key-to [ARGUMENT=1]
>     --path-action-name-list [ARGUMENT=1+]
>   --auth-gen-tag --agt [OPTIONAL] [ARGUMENT=1]
>       generate auth file: -O=outputFile
>     --auth-gen-size [ARGUMENT=1]
>     --auth-gen-token-size [ARGUMENT=1]
>     --auth-gen-time-gap [ARGUMENT=1]
>     --auth-gen-info [ARGUMENT=1]
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
>   --ping-race --pr [OPTIONAL] [ARGUMENT=1+]
>       tcp-ping list of url to find the fastest
>   --ping-stat --ps [OPTIONAL] [ARGUMENT=1+]
>       tcp-ping list of url and print result
>   --host --H -H [OPTIONAL] [ARGUMENT=1]
>       set "hostname:port"
>     --TLS-SNI-config [ARGUMENT=1]
>         TLS SNI config map, set to enable https:
>           multi config: { [hostname]: { key: pathOrBuffer, cert: pathOrBuffer, ca: pathOrBuffer } }, default to special hostname "default", or the first config
>           single config: { key: pathOrBuffer, cert: pathOrBuffer, ca: pathOrBuffer }
>           key: Private keys in PEM format
>           cert: Cert chains in PEM format
>           ca: Optionally override the trusted CA certificates
>       --TLS-dhparam [ARGUMENT=1]
>           pathOrBuffer; Diffie-Hellman Key Exchange, generate with: "openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096"
>     --debug-route [ARGUMENT=0+]
>         show debug route list on "/"
>     --log-path [ARGUMENT=1]
>       --log-file-prefix [ARGUMENT=1]
>     --pid-file [ARGUMENT=1]
>       --pid-ignore-exist [ARGUMENT=0+]
>           set to enable
>     --auth-skip [ARGUMENT=0+]
>         set to enable
>     --auth-file [ARGUMENT=1]
>     --auth-file-group-path [ARGUMENT=1]
>       --auth-file-group-default-tag [ARGUMENT=1]
>       --auth-file-group-key-suffix [ARGUMENT=1]
>     --permission-type [ARGUMENT=1]
>         one of:
>           allow deny func file
>       --permission-func [ARGUMENT=1]
>       --permission-file [ARGUMENT=1]
>     --explorer-root-path [ARGUMENT=1]
>       --explorer-upload-merge-path [ARGUMENT=1]
>       --explorer-status-command-list
>     --stat-collect-path [ARGUMENT=1]
>       --stat-collect-url [ARGUMENT=1]
>       --stat-collect-interval [ARGUMENT=1]
>     --stat-report-process-tag [ARGUMENT=1]
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
>     export DR_NODE_FILE_UPLOAD_KEY="[ARGUMENT=1]"
>     export DR_NODE_FILE_UPLOAD_PATH="[ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_SERVER_URL="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_KEY="[ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_PATH="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_SERVER_URL="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_TYPE="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_KEY="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_KEY_TO="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_NAME_LIST="[ARGUMENT=1+]"
>     export DR_NODE_AUTH_GEN_TAG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_SIZE="[ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_TOKEN_SIZE="[ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_TIME_GAP="[ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_INFO="[ARGUMENT=1]"
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
>     export DR_NODE_PING_RACE="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_NODE_PING_STAT="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_NODE_HOST="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_TLS_SNI_CONFIG="[ARGUMENT=1]"
>     export DR_NODE_TLS_DHPARAM="[ARGUMENT=1]"
>     export DR_NODE_DEBUG_ROUTE="[ARGUMENT=0+]"
>     export DR_NODE_LOG_PATH="[ARGUMENT=1]"
>     export DR_NODE_LOG_FILE_PREFIX="[ARGUMENT=1]"
>     export DR_NODE_PID_FILE="[ARGUMENT=1]"
>     export DR_NODE_PID_IGNORE_EXIST="[ARGUMENT=0+]"
>     export DR_NODE_AUTH_SKIP="[ARGUMENT=0+]"
>     export DR_NODE_AUTH_FILE="[ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_PATH="[ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_DEFAULT_TAG="[ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_KEY_SUFFIX="[ARGUMENT=1]"
>     export DR_NODE_PERMISSION_TYPE="[ARGUMENT=1]"
>     export DR_NODE_PERMISSION_FUNC="[ARGUMENT=1]"
>     export DR_NODE_PERMISSION_FILE="[ARGUMENT=1]"
>     export DR_NODE_EXPLORER_ROOT_PATH="[ARGUMENT=1]"
>     export DR_NODE_EXPLORER_UPLOAD_MERGE_PATH="[ARGUMENT=1]"
>     export DR_NODE_EXPLORER_STATUS_COMMAND_LIST=""
>     export DR_NODE_STAT_COLLECT_PATH="[ARGUMENT=1]"
>     export DR_NODE_STAT_COLLECT_URL="[ARGUMENT=1]"
>     export DR_NODE_STAT_COLLECT_INTERVAL="[ARGUMENT=1]"
>     export DR_NODE_STAT_REPORT_PROCESS_TAG="[ARGUMENT=1]"
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
>     "fileUploadKey": [ "[ARGUMENT=1]" ],
>     "fileUploadPath": [ "[ARGUMENT=1]" ],
>     "fileDownloadServerUrl": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "fileDownloadKey": [ "[ARGUMENT=1]" ],
>     "fileDownloadPath": [ "[ARGUMENT=1]" ],
>     "pathActionServerUrl": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "pathActionType": [ "[ARGUMENT=1]" ],
>     "pathActionKey": [ "[ARGUMENT=1]" ],
>     "pathActionKeyTo": [ "[ARGUMENT=1]" ],
>     "pathActionNameList": [ "[ARGUMENT=1+]" ],
>     "authGenTag": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "authGenSize": [ "[ARGUMENT=1]" ],
>     "authGenTokenSize": [ "[ARGUMENT=1]" ],
>     "authGenTimeGap": [ "[ARGUMENT=1]" ],
>     "authGenInfo": [ "[ARGUMENT=1]" ],
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
>     "pingRace": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "pingStat": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "host": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "TLSSNIConfig": [ "[ARGUMENT=1]" ],
>     "TLSDhparam": [ "[ARGUMENT=1]" ],
>     "debugRoute": [ "[ARGUMENT=0+]" ],
>     "logPath": [ "[ARGUMENT=1]" ],
>     "logFilePrefix": [ "[ARGUMENT=1]" ],
>     "pidFile": [ "[ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[ARGUMENT=0+]" ],
>     "authSkip": [ "[ARGUMENT=0+]" ],
>     "authFile": [ "[ARGUMENT=1]" ],
>     "authFileGroupPath": [ "[ARGUMENT=1]" ],
>     "authFileGroupDefaultTag": [ "[ARGUMENT=1]" ],
>     "authFileGroupKeySuffix": [ "[ARGUMENT=1]" ],
>     "permissionType": [ "[ARGUMENT=1]" ],
>     "permissionFunc": [ "[ARGUMENT=1]" ],
>     "permissionFile": [ "[ARGUMENT=1]" ],
>     "explorerRootPath": [ "[ARGUMENT=1]" ],
>     "explorerUploadMergePath": [ "[ARGUMENT=1]" ],
>     "explorerStatusCommandList": [ "" ],
>     "statCollectPath": [ "[ARGUMENT=1]" ],
>     "statCollectUrl": [ "[ARGUMENT=1]" ],
>     "statCollectInterval": [ "[ARGUMENT=1]" ],
>     "statReportProcessTag": [ "[ARGUMENT=1]" ],
>   }
> ```
