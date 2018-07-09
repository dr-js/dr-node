# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/clientFile.js](source/clientFile.js)
  - `clientFileDownload`, `clientFileModify`, `clientFileUpload`
+ 📄 [source/option.js](source/option.js)
  - `AuthFormatConfig`, `FileUploadFormatConfig`, `StatusCollectFormatConfig`, `StatusReportFormatConfig`, `TokenCacheFormatConfig`, `getServerFormatConfig`
+ 📄 [source/configure/auth.js](source/configure/auth.js)
  - `configureAuthTimedLookup`, `loadLookupFile`, `saveLookupFile`
+ 📄 [source/configure/filePid.js](source/configure/filePid.js)
  - `configureFilePid`
+ 📄 [source/configure/logger.js](source/configure/logger.js)
  - `configureLogger`
+ 📄 [source/configure/serverBase.js](source/configure/serverBase.js)
  - `configureServerBase`
+ 📄 [source/configure/tokenCache.js](source/configure/tokenCache.js)
  - `configureTokenCache`
+ 📄 [source/configure/status/Collector.js](source/configure/status/Collector.js)
  - `configureStatusCollector`
+ 📄 [source/configure/status/applyStatusFact.js](source/configure/status/applyStatusFact.js)
  - `applyFact`
+ 📄 [source/configure/status/combine.js](source/configure/status/combine.js)
  - `combineStatus`, `combineStatusRaw`, `setRangeRaw`, `setSumRaw`
+ 📄 [source/responder/function.js](source/responder/function.js)
  - `initAuthMask`, `prepareBufferData`, `prepareBufferDataHTML`, `prepareBufferDataJSON`, `prepareBufferDataPNG`
+ 📄 [source/responder/routeList.js](source/responder/routeList.js)
  - `createResponderRouteList`
+ 📄 [source/responder/pathContent/Explorer.js](source/responder/pathContent/Explorer.js)
  - `createResponderExplorer`, `createResponderFileChunkUpload`, `createResponderPathModify`, `createResponderServeFile`
+ 📄 [source/responder/pathContent/explorerHTML.js](source/responder/pathContent/explorerHTML.js)
  - `getHTML`
+ 📄 [source/responder/status/Report.js](source/responder/status/Report.js)
  - `createResponderStatusReport`
+ 📄 [source/responder/status/Visualize.js](source/responder/status/Visualize.js)
  - `createResponderStatusState`, `createResponderStatusVisualize`
+ 📄 [source/responder/status/visualizeHTML.js](source/responder/status/visualizeHTML.js)
  - `getHTML`
+ 📄 [source/task/getFileChunkUpload.js](source/task/getFileChunkUpload.js)
  - `createFileChunkUpload`, `uploadFileByChunk`
+ 📄 [source/task/getPathModify.js](source/task/getPathModify.js)
  - `createGetPathModify`
+ 📄 [source/task/getStatusReport.js](source/task/getStatusReport.js)
  - `createGetStatusReport`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config -c [OPTIONAL] [ARGUMENT=1]
>       # from JSON: set to 'path/to/config.json'
>       # from ENV: set to 'env'
>   --version -v [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --help -h [OPTIONAL] [ARGUMENT=0+]
>       show help
>   --server-path-content --spc [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-upload-root [OPTIONAL-CHECK] [ARGUMENT=1]
>       --path-upload-merge [OPTIONAL-CHECK] [ARGUMENT=1]
>   --server-status-collect --ssc [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-status-collect [OPTIONAL-CHECK] [ARGUMENT=1]
>       --status-collect-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --status-collect-interval [OPTIONAL-CHECK] [ARGUMENT=1]
>   --server-status-report --ssr [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --status-report-process-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>   --client-file-upload --cfu [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --file-upload-server-url [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-upload-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-upload-path [OPTIONAL-CHECK] [ARGUMENT=1]
>   --client-file-download --cfd [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --file-download-server-url [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-download-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-download-path [OPTIONAL-CHECK] [ARGUMENT=1]
>   --client-file-modify --cfm [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --file-modify-server-url [OPTIONAL-CHECK] [ARGUMENT=1]
>     --modify-type [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-modify-key [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-modify-key-to [OPTIONAL-CHECK] [ARGUMENT=1]
>   --hostname -H [OPTIONAL] [ARGUMENT=1]
>     --port -P [OPTIONAL-CHECK] [ARGUMENT=1]
>     --https -S [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --file-SSL-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-cert [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-chain [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-dhparam [OPTIONAL-CHECK] [ARGUMENT=1]
>     --path-log [OPTIONAL-CHECK] [ARGUMENT=1]
>       --prefix-log-file [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-pid [OPTIONAL-CHECK] [ARGUMENT=1]
>       --pid-ignore-exist [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>     --file-token-cache [OPTIONAL-CHECK] [ARGUMENT=1]
>       --token-size [OPTIONAL-CHECK] [ARGUMENT=1]
>       --token-expire-time [OPTIONAL-CHECK] [ARGUMENT=1]
>     --file-auth-config [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-gen [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>         --auth-gen-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-token-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-time-gap [OPTIONAL-CHECK] [ARGUMENT=1]
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_SERVER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_SERVER_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_SERVER_PATH_CONTENT="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_PATH_UPLOAD_ROOT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_UPLOAD_MERGE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_SERVER_STATUS_COLLECT="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_PATH_STATUS_COLLECT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_STATUS_COLLECT_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_STATUS_COLLECT_INTERVAL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_SERVER_STATUS_REPORT="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_STATUS_REPORT_PROCESS_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_CLIENT_FILE_UPLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_UPLOAD_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_UPLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_UPLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_CLIENT_FILE_DOWNLOAD="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_DOWNLOAD_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_DOWNLOAD_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_DOWNLOAD_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_CLIENT_FILE_MODIFY="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_MODIFY_SERVER_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_MODIFY_TYPE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_MODIFY_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_MODIFY_KEY_TO="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_HOSTNAME="[OPTIONAL] [ARGUMENT=1]"
>     export DR_SERVER_PORT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_HTTPS="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_SSL_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_SSL_CERT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_SSL_CHAIN="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_SSL_DHPARAM="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PATH_LOG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PREFIX_LOG_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_PID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PID_IGNORE_EXIST="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_TOKEN_CACHE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_TOKEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_TOKEN_EXPIRE_TIME="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_AUTH_CONFIG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_AUTH_GEN_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN_TOKEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_GEN_TIME_GAP="[OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> JSON Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "serverPathContent": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathUploadRoot": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathUploadMerge": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serverStatusCollect": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathStatusCollect": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statusCollectUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "statusCollectInterval": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serverStatusReport": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "statusReportProcessTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "clientFileUpload": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "fileUploadServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "clientFileDownload": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "fileDownloadServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileDownloadPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "clientFileModify": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "fileModifyServerUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "modifyType": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileModifyKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileModifyKeyTo": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "hostname": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "port": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "https": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileSSLKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLCert": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLChain": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLDhparam": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathLog": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "prefixLogFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "filePid": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileTokenCache": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tokenExpireTime": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileAuthConfig": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGen": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authGenTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTimeGap": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
