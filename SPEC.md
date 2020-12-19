# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/module/Auth.js](source/module/Auth.js)
  - `AUTH_FILE`, `AUTH_FILE_GROUP`, `AUTH_SKIP`, `DEFAULT_AUTH_KEY`, `configureAuth`, `configureAuthFile`, `configureAuthFileGroup`, `configureAuthSkip`, `describeAuthFile`, `generateAuthCheckCode`, `generateAuthFile`, `loadAuthFile`, `saveAuthFile`, `verifyAuthCheckCode`
+ 📄 [source/module/Compress.js](source/module/Compress.js)
  - `checkBloat`, `compressFile`, `compressFileList`, `isBufferGzip`, `isFileGzip`
+ 📄 [source/module/FactDatabase.js](source/module/FactDatabase.js)
  - `INITIAL_FACT_INFO`, `createFactDatabaseExot`, `tryDeleteExtraCache`, `tryLoadFactInfo`
+ 📄 [source/module/FsPack.js](source/module/FsPack.js)
  - `TYPE_DIRECTORY`, `TYPE_FILE`, `TYPE_SYMLINK`, `append`, `appendContentList`, `appendDirectory`, `appendFile`, `appendFromPath`, `appendSymlink`, `initFsPack`, `loadFsPack`, `saveFsPack`, `setFsPackPackRoot`, `setFsPackUnpackPath`, `unpack`, `unpackContentList`, `unpackDirectory`, `unpackFile`, `unpackSymlink`, `unpackToPath`
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
  - `getRequestBuffer`, `getRequestJSON`, `getRequestParam`, `getWebSocketProtocolListParam`, `packWebSocketProtocolListParam`
+ 📄 [source/module/RunDetached.js](source/module/RunDetached.js)
  - `findDetachedProcessAsync`, `runDetached`
+ 📄 [source/module/RuntimeDump.js](source/module/RuntimeDump.js)
  - `dumpAsync`, `getV8Extra`, `getV8HeapSnapshotReadableStream`, `setupSIGUSR2`, `writeV8HeapSnapshot`
+ 📄 [source/module/ServerExot.js](source/module/ServerExot.js)
  - `configureServerExot`, `parseHostString`
+ 📄 [source/module/ServerStatus.js](source/module/ServerStatus.js)
  - `COMMON_SERVER_STATUS_COMMAND_LIST`, `getCommonServerStatus`
+ 📄 [source/module/TerminalColor.js](source/module/TerminalColor.js)
  - `configureTerminalColor`
+ 📄 [source/module/TerminalStatusBar.js](source/module/TerminalStatusBar.js)
  - `createStatusBar`
+ 📄 [source/module/TokenCache.js](source/module/TokenCache.js)
  - `DEFAULT_TOKEN_KEY`, `createTokenCacheExot`
+ 📄 [source/module/ActionJSON/path.js](source/module/ActionJSON/path.js)
  - `ACTION_CORE_MAP`, `ACTION_TYPE`, `setupActionMap`
+ 📄 [source/module/ActionJSON/pathExtraArchive.js](source/module/ActionJSON/pathExtraArchive.js)
  - `ACTION_CORE_MAP`, `ACTION_TYPE`
+ 📄 [source/module/ActionJSON/status.js](source/module/ActionJSON/status.js)
  - `ACTION_CORE_MAP`, `ACTION_TYPE`, `setupActionMap`
+ 📄 [source/module/Software/7z.js](source/module/Software/7z.js)
  - `compressConfig`, `detect`, `extractConfig`, `getCommand`, `setCommand`
+ 📄 [source/module/Software/archive.js](source/module/Software/archive.js)
  - `REGEXP_AUTO`, `REGEXP_T7Z`, `REGEXP_TXZ`, `compress7zAsync`, `compressAutoAsync`, `compressT7zAsync`, `detect`, `extract7zAsync`, `extractAutoAsync`, `extractT7zAsync`, `repackAsync`, `repackTarAsync`
+ 📄 [source/module/Software/fspTar.js](source/module/Software/fspTar.js)
  - `REGEXP_FSP_TAR`, `compressAsync`, `compressFspAsync`, `compressFspGzAsync`, `extractAsync`, `extractFspAsync`, `extractFspGzAsync`
+ 📄 [source/module/Software/function.js](source/module/Software/function.js)
  - `createCommandWrap`, `createDetect`, `withTempPath`
+ 📄 [source/module/Software/git.js](source/module/Software/git.js)
  - `detect`, `getCommand`, `getGitBranch`, `getGitCommitHash`, `setCommand`
+ 📄 [source/module/Software/npm.js](source/module/Software/npm.js)
  - `fetchLikeRequestWithProxy`, `findUpPackageRoot`, `fromGlobalNodeModules`, `fromNpmNodeModules`, `getPathNpm`, `getPathNpmExecutable`, `getPathNpmGlobalRoot`, `parsePackageNameAndVersion`, `toPackageTgzName`
+ 📄 [source/module/Software/npmTar.js](source/module/Software/npmTar.js)
  - `REGEXP_NPM_TAR`, `REGEXP_TGZ`, `compressAsync`, `createCompressStream`, `createExtractStream`, `detect`, `extractAsync`, `extractPackageJson`, `getNpmTar`
+ 📄 [source/module/Software/tar.js](source/module/Software/tar.js)
  - `compressConfig`, `detect`, `extractConfig`, `getCommand`, `setCommand`
+ 📄 [source/module/Stat/StatCollect.js](source/module/Stat/StatCollect.js)
  - `createStatCollectExot`
+ 📄 [source/module/Stat/StatReport.js](source/module/Stat/StatReport.js)
  - `createGetStatReport`
+ 📄 [source/module/Stat/module/applyStatFact.js](source/module/Stat/module/applyStatFact.js)
  - `applyStatFact`
+ 📄 [source/module/Stat/module/combineStat.js](source/module/Stat/module/combineStat.js)
  - `combineStat`, `combineStatRaw`, `setRangeRaw`, `setSumRaw`
+ 📄 [source/server/feature/ActionJSON/client.js](source/server/feature/ActionJSON/client.js)
  - `actionJson`
+ 📄 [source/server/feature/ActionJSON/setup.js](source/server/feature/ActionJSON/setup.js)
  - `PERMISSION_CHECK_ACTION_JSON`, `PERMISSION_CHECK_ACTION_JSON_PUBLIC`, `setup`
+ 📄 [source/server/feature/Auth/HTML.js](source/server/feature/Auth/HTML.js)
  - `initAuthMask`
+ 📄 [source/server/feature/Auth/option.js](source/server/feature/Auth/option.js)
  - `AuthCommonFormatConfig`, `AuthFileFormatConfig`, `AuthFileGroupFormatConfig`, `AuthSkipFormatConfig`, `getAuthCommonOption`, `getAuthFileGroupOption`, `getAuthFileOption`, `getAuthSkipOption`
+ 📄 [source/server/feature/Auth/setup.js](source/server/feature/Auth/setup.js)
  - `setup`
+ 📄 [source/server/feature/Explorer/option.js](source/server/feature/Explorer/option.js)
  - `ExplorerFormatConfig`, `getExplorerOption`
+ 📄 [source/server/feature/Explorer/setup.js](source/server/feature/Explorer/setup.js)
  - `setup`
+ 📄 [source/server/feature/Explorer/HTML/main.js](source/server/feature/Explorer/HTML/main.js)
  - `getHTML`
+ 📄 [source/server/feature/Explorer/HTML/pathContent.js](source/server/feature/Explorer/HTML/pathContent.js)
  - `initPathContent`, `pathContentStyle`
+ 📄 [source/server/feature/Explorer/HTML/uploader.js](source/server/feature/Explorer/HTML/uploader.js)
  - `initUploader`
+ 📄 [source/server/feature/File/client.js](source/server/feature/File/client.js)
  - `fileDownload`, `fileUpload`
+ 📄 [source/server/feature/File/option.js](source/server/feature/File/option.js)
  - `FileFormatConfig`, `getFileOption`
+ 📄 [source/server/feature/File/responder.js](source/server/feature/File/responder.js)
  - `createResponderFileChunkUpload`, `createResponderServeFile`
+ 📄 [source/server/feature/File/setup.js](source/server/feature/File/setup.js)
  - `PERMISSION_CHECK_FILE_UPLOAD_START`, `setup`
+ 📄 [source/server/feature/Permission/option.js](source/server/feature/Permission/option.js)
  - `PermissionFormatConfig`, `getPermissionOption`
+ 📄 [source/server/feature/Permission/setup.js](source/server/feature/Permission/setup.js)
  - `setup`
+ 📄 [source/server/feature/ServerFetch/HTML.js](source/server/feature/ServerFetch/HTML.js)
  - `initServerFetch`
+ 📄 [source/server/feature/ServerFetch/responder.js](source/server/feature/ServerFetch/responder.js)
  - `responderServerFetch`
+ 📄 [source/server/feature/StatCollect/HTML.js](source/server/feature/StatCollect/HTML.js)
  - `getHTML`
+ 📄 [source/server/feature/StatCollect/option.js](source/server/feature/StatCollect/option.js)
  - `StatCollectFormatConfig`, `getStatCollectOption`
+ 📄 [source/server/feature/StatCollect/responder.js](source/server/feature/StatCollect/responder.js)
  - `createResponderStatCollect`, `createResponderStatState`
+ 📄 [source/server/feature/StatCollect/setup.js](source/server/feature/StatCollect/setup.js)
  - `setup`
+ 📄 [source/server/feature/StatReport/option.js](source/server/feature/StatReport/option.js)
  - `StatReportFormatConfig`, `getStatReportOption`
+ 📄 [source/server/feature/StatReport/setup.js](source/server/feature/StatReport/setup.js)
  - `setup`
+ 📄 [source/server/feature/TokenCache/option.js](source/server/feature/TokenCache/option.js)
  - `TokenCacheFormatConfig`, `getTokenCacheOption`
+ 📄 [source/server/feature/TokenCache/responder.js](source/server/feature/TokenCache/responder.js)
  - `createResponderAssignTokenCookie`, `createResponderAssignTokenHeader`, `createResponderCheckToken`
+ 📄 [source/server/feature/WebSocketTunnelDev/client.js](source/server/feature/WebSocketTunnelDev/client.js)
  - `setupClientWebSocketTunnel`
+ 📄 [source/server/feature/WebSocketTunnelDev/option.js](source/server/feature/WebSocketTunnelDev/option.js)
  - `WebSocketTunnelFormatConfig`, `getWebSocketTunnelOption`
+ 📄 [source/server/feature/WebSocketTunnelDev/setup.js](source/server/feature/WebSocketTunnelDev/setup.js)
  - `setup`
+ 📄 [source/server/share/configure.js](source/server/share/configure.js)
  - `configureFeature`, `runServer`, `runServerExotGroup`, `setupServerExotGroup`
+ 📄 [source/server/share/option.js](source/server/share/option.js)
  - `LogFormatConfig`, `PidFormatConfig`, `getLogOption`, `getPidOption`, `getServerExotFormatConfig`, `getServerExotOption`
+ 📄 [source/server/share/HTML/LoadingMask.js](source/server/share/HTML/LoadingMask.js)
  - `initLoadingMask`
+ 📄 [source/server/share/HTML/Modal.js](source/server/share/HTML/Modal.js)
  - `initModal`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from JS/JSON: set to "path/to/config.js|json"
>       from ENV: set to "env" to enable, default not check env
>       from ENV JSON: set to "json-env:$env-name" to read the ENV string as JSON
>       from CLI JSON: set to "json-cli:$json-string" to read the appended string as JSON
>   --help --h -h [OPTIONAL] [ARGUMENT=0-1]
>       show full help
>   --version --v -v [OPTIONAL] [ARGUMENT=0-1]
>       show version
>   --note --N -N [OPTIONAL] [ARGUMENT=1+]
>       noop, tag for ps/htop
>   --quiet --q -q [OPTIONAL] [ARGUMENT=0-1]
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
>           path.visible path.stat path.copy path.rename
>           path.delete path.dir.create path.dir.content path.dir.all-file-list
>           path.compress-tar path.extract-tar path.compress-auto path.extract-auto
>     --path-action-key [ARGUMENT=1]
>     --path-action-key-to [ARGUMENT=1]
>     --path-action-name-list [ARGUMENT=1+]
>   --websocket-tunnel-server-url --wtsu [OPTIONAL] [ARGUMENT=1]
>       require provide "auth-file" or "auth-file-group", and "websocket-tunnel-host"
>   --auth-gen-tag --agt [OPTIONAL] [ARGUMENT=1]
>       generate auth file: -O=outputFile
>     --auth-gen-size [ARGUMENT=1]
>     --auth-gen-token-size [ARGUMENT=1]
>     --auth-gen-time-gap [ARGUMENT=1]
>     --auth-gen-info [ARGUMENT=1]
>   --auth-file-describe --afd [OPTIONAL] [ARGUMENT=0-1]
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
>   --compress --a -a [OPTIONAL] [ARGUMENT=0-1]
>       compress tar/zip/7z/fsp: -I=inputDirectory, -O=outputFile
>   --extract --x -x [OPTIONAL] [ARGUMENT=0-1]
>       extract tar/zip/7z/fsp: -I=inputFile, -O=outputPath
>   --git-branch --gb [OPTIONAL] [ARGUMENT=0-1]
>       print git branch
>   --git-commit-hash --gch [OPTIONAL] [ARGUMENT=0-1]
>       print git commit hash
>   --ping-race --pr [OPTIONAL] [ARGUMENT=1+]
>       tcp-ping list of url to find the fastest
>   --ping-stat --ps [OPTIONAL] [ARGUMENT=1+]
>       tcp-ping list of url and print result
>   --quick-server-explorer --qse [OPTIONAL] [ARGUMENT=0-2]
>       start a no-auth explorer server, for LAN use mostly, caution with public ip: -I=rootPath/cwd, $@=hostname/127.0.0.1,port/auto
>   --eval --e -e [OPTIONAL] [ARGUMENT=0+]
>       eval file or string: -O=outputFile, -I/$0=scriptFile/scriptString, $@=...evalArgv
>   --repl --i -i [OPTIONAL] [ARGUMENT=0-1]
>       start node REPL
>   --fetch --f -f [OPTIONAL] [ARGUMENT=1-4]
>       fetch url with http_proxy env support: -I=requestBody/null, -O=outputFile/stdout, $@=initialUrl,method/GET,jumpMax/4,timeout/0
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
>     --debug-route [ARGUMENT=0-1]
>         show debug route list on "/"
>     --log-path [ARGUMENT=1]
>       --log-file-prefix [ARGUMENT=1]
>     --pid-file [ARGUMENT=1]
>       --pid-ignore-exist [ARGUMENT=0-1]
>           set to ANY value to enable, except "false/no/n/0"
>     --auth-key [ARGUMENT=1]
>         set for non-default key
>     --auth-skip [ARGUMENT=0-1]
>         set to ANY value to enable, except "false/no/n/0"
>     --auth-file [ARGUMENT=1]
>     --auth-file-group-path [ARGUMENT=1]
>       --auth-file-group-default-tag [ARGUMENT=1]
>       --auth-file-group-key-suffix [ARGUMENT=1]
>     --permission-type [ARGUMENT=1]
>         one of:
>           allow deny func file
>       --permission-func [ARGUMENT=1]
>       --permission-file [ARGUMENT=1]
>     --file-root-path [ARGUMENT=1]
>       --file-root-path-public [ARGUMENT=1]
>       --file-upload-merge-path [ARGUMENT=1]
>     --explorer [ARGUMENT=0-1]
>         set to ANY value to enable, except "false/no/n/0"
>     --stat-collect-path [ARGUMENT=1]
>       --stat-collect-url [ARGUMENT=1]
>       --stat-collect-interval [ARGUMENT=1]
>     --stat-report-process-tag [ARGUMENT=1]
>     --websocket-tunnel-host [ARGUMENT=1]
>         [under DEV] use format: "hostname:port", default hostname: 127.0.0.1
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_NODE_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_HELP="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_VERSION="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_NOTE="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_NODE_QUIET="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_INPUT_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_OUTPUT_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_FILE_UPLOAD_SERVER_URL="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_NODE_FUSU]"
>     export DR_NODE_FILE_UPLOAD_KEY="[ARGUMENT=1]"
>     export DR_NODE_FILE_UPLOAD_PATH="[ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_SERVER_URL="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_NODE_FDSU]"
>     export DR_NODE_FILE_DOWNLOAD_KEY="[ARGUMENT=1]"
>     export DR_NODE_FILE_DOWNLOAD_PATH="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_SERVER_URL="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_NODE_PASU]"
>     export DR_NODE_PATH_ACTION_TYPE="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_KEY="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_KEY_TO="[ARGUMENT=1]"
>     export DR_NODE_PATH_ACTION_NAME_LIST="[ARGUMENT=1+]"
>     export DR_NODE_WEBSOCKET_TUNNEL_SERVER_URL="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_NODE_WTSU]"
>     export DR_NODE_AUTH_GEN_TAG="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_NODE_AGT]"
>     export DR_NODE_AUTH_GEN_SIZE="[ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_TOKEN_SIZE="[ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_TIME_GAP="[ARGUMENT=1]"
>     export DR_NODE_AUTH_GEN_INFO="[ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_DESCRIBE="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_NODE_AFD]"
>     export DR_NODE_AUTH_CHECK_CODE_GENERATE="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_NODE_ACCG]"
>     export DR_NODE_AUTH_CHECK_CODE_VERIFY="[OPTIONAL] [ARGUMENT=1-2] [ALIAS=DR_NODE_ACCV]"
>     export DR_NODE_FILE_LIST="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_NODE_LS]"
>     export DR_NODE_FILE_LIST_ALL="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_NODE_LS_R,DR_NODE_LLA]"
>     export DR_NODE_FILE_TREE="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_NODE_TREE]"
>     export DR_NODE_COMPRESS="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_EXTRACT="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_GIT_BRANCH="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_NODE_GB]"
>     export DR_NODE_GIT_COMMIT_HASH="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_NODE_GCH]"
>     export DR_NODE_PING_RACE="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_NODE_PR]"
>     export DR_NODE_PING_STAT="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_NODE_PS]"
>     export DR_NODE_QUICK_SERVER_EXPLORER="[OPTIONAL] [ARGUMENT=0-2] [ALIAS=DR_NODE_QSE]"
>     export DR_NODE_EVAL="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_NODE_REPL="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_NODE_FETCH="[OPTIONAL] [ARGUMENT=1-4]"
>     export DR_NODE_HOST="[OPTIONAL] [ARGUMENT=1]"
>     export DR_NODE_TLS_SNI_CONFIG="[ARGUMENT=1]"
>     export DR_NODE_TLS_DHPARAM="[ARGUMENT=1]"
>     export DR_NODE_DEBUG_ROUTE="[ARGUMENT=0-1]"
>     export DR_NODE_LOG_PATH="[ARGUMENT=1]"
>     export DR_NODE_LOG_FILE_PREFIX="[ARGUMENT=1]"
>     export DR_NODE_PID_FILE="[ARGUMENT=1]"
>     export DR_NODE_PID_IGNORE_EXIST="[ARGUMENT=0-1]"
>     export DR_NODE_AUTH_KEY="[ARGUMENT=1]"
>     export DR_NODE_AUTH_SKIP="[ARGUMENT=0-1]"
>     export DR_NODE_AUTH_FILE="[ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_PATH="[ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_DEFAULT_TAG="[ARGUMENT=1]"
>     export DR_NODE_AUTH_FILE_GROUP_KEY_SUFFIX="[ARGUMENT=1]"
>     export DR_NODE_PERMISSION_TYPE="[ARGUMENT=1]"
>     export DR_NODE_PERMISSION_FUNC="[ARGUMENT=1]"
>     export DR_NODE_PERMISSION_FILE="[ARGUMENT=1]"
>     export DR_NODE_FILE_ROOT_PATH="[ARGUMENT=1]"
>     export DR_NODE_FILE_ROOT_PATH_PUBLIC="[ARGUMENT=1]"
>     export DR_NODE_FILE_UPLOAD_MERGE_PATH="[ARGUMENT=1]"
>     export DR_NODE_EXPLORER="[ARGUMENT=0-1]"
>     export DR_NODE_STAT_COLLECT_PATH="[ARGUMENT=1]"
>     export DR_NODE_STAT_COLLECT_URL="[ARGUMENT=1]"
>     export DR_NODE_STAT_COLLECT_INTERVAL="[ARGUMENT=1]"
>     export DR_NODE_STAT_REPORT_PROCESS_TAG="[ARGUMENT=1]"
>     export DR_NODE_WEBSOCKET_TUNNEL_HOST="[ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "note": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "inputFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "outputFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "fileUploadServerUrl": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=fusu]" ],
>     "fileUploadKey": [ "[ARGUMENT=1]" ],
>     "fileUploadPath": [ "[ARGUMENT=1]" ],
>     "fileDownloadServerUrl": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=fdsu]" ],
>     "fileDownloadKey": [ "[ARGUMENT=1]" ],
>     "fileDownloadPath": [ "[ARGUMENT=1]" ],
>     "pathActionServerUrl": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=pasu]" ],
>     "pathActionType": [ "[ARGUMENT=1]" ],
>     "pathActionKey": [ "[ARGUMENT=1]" ],
>     "pathActionKeyTo": [ "[ARGUMENT=1]" ],
>     "pathActionNameList": [ "[ARGUMENT=1+]" ],
>     "websocketTunnelServerUrl": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=wtsu]" ],
>     "authGenTag": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=agt]" ],
>     "authGenSize": [ "[ARGUMENT=1]" ],
>     "authGenTokenSize": [ "[ARGUMENT=1]" ],
>     "authGenTimeGap": [ "[ARGUMENT=1]" ],
>     "authGenInfo": [ "[ARGUMENT=1]" ],
>     "authFileDescribe": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=afd]" ],
>     "authCheckCodeGenerate": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=accg]" ],
>     "authCheckCodeVerify": [ "[OPTIONAL] [ARGUMENT=1-2] [ALIAS=accv]" ],
>     "fileList": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=ls]" ],
>     "fileListAll": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=lsR,lla]" ],
>     "fileTree": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=tree]" ],
>     "compress": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "extract": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "gitBranch": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=gb]" ],
>     "gitCommitHash": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=gch]" ],
>     "pingRace": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=pr]" ],
>     "pingStat": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=ps]" ],
>     "quickServerExplorer": [ "[OPTIONAL] [ARGUMENT=0-2] [ALIAS=qse]" ],
>     "eval": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "repl": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "fetch": [ "[OPTIONAL] [ARGUMENT=1-4]" ],
>     "host": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "TLSSNIConfig": [ "[ARGUMENT=1]" ],
>     "TLSDhparam": [ "[ARGUMENT=1]" ],
>     "debugRoute": [ "[ARGUMENT=0-1]" ],
>     "logPath": [ "[ARGUMENT=1]" ],
>     "logFilePrefix": [ "[ARGUMENT=1]" ],
>     "pidFile": [ "[ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[ARGUMENT=0-1]" ],
>     "authKey": [ "[ARGUMENT=1]" ],
>     "authSkip": [ "[ARGUMENT=0-1]" ],
>     "authFile": [ "[ARGUMENT=1]" ],
>     "authFileGroupPath": [ "[ARGUMENT=1]" ],
>     "authFileGroupDefaultTag": [ "[ARGUMENT=1]" ],
>     "authFileGroupKeySuffix": [ "[ARGUMENT=1]" ],
>     "permissionType": [ "[ARGUMENT=1]" ],
>     "permissionFunc": [ "[ARGUMENT=1]" ],
>     "permissionFile": [ "[ARGUMENT=1]" ],
>     "fileRootPath": [ "[ARGUMENT=1]" ],
>     "fileRootPathPublic": [ "[ARGUMENT=1]" ],
>     "fileUploadMergePath": [ "[ARGUMENT=1]" ],
>     "explorer": [ "[ARGUMENT=0-1]" ],
>     "statCollectPath": [ "[ARGUMENT=1]" ],
>     "statCollectUrl": [ "[ARGUMENT=1]" ],
>     "statCollectInterval": [ "[ARGUMENT=1]" ],
>     "statReportProcessTag": [ "[ARGUMENT=1]" ],
>     "websocketTunnelHost": [ "[ARGUMENT=1]" ],
>   }
> ```
