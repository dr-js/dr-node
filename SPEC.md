# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/function.js](source/function.js)
  - `isPrivateAddress`
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
+ 📄 [source/feature/Explorer/configureFeaturePack.js](source/feature/Explorer/configureFeaturePack.js)
  - `configureFeaturePack`
+ 📄 [source/feature/Explorer/responder.js](source/feature/Explorer/responder.js)
  - `createResponderFileChunkUpload`, `createResponderPathBatchModify`, `createResponderPathModify`, `createResponderServeFile`, `createResponderStorageStatus`
+ 📄 [source/feature/Explorer/HTML/main.js](source/feature/Explorer/HTML/main.js)
  - `getHTML`
+ 📄 [source/feature/Explorer/HTML/pathContent.js](source/feature/Explorer/HTML/pathContent.js)
  - `initPathContent`, `pathContentStyle`
+ 📄 [source/feature/Explorer/HTML/uploader.js](source/feature/Explorer/HTML/uploader.js)
  - `initFileUpload`, `initUploader`
+ 📄 [source/feature/Explorer/task/getFileChunkUpload.js](source/feature/Explorer/task/getFileChunkUpload.js)
  - `createFileChunkUpload`, `uploadFileByChunk`
+ 📄 [source/feature/Explorer/task/getPathModify.js](source/feature/Explorer/task/getPathModify.js)
  - `createGetPathModify`
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
+ 📄 [source/feature/StatusReport/task/getStatusReport.js](source/feature/StatusReport/task/getStatusReport.js)
  - `createGetStatusReport`
+ 📄 [source/featureNode/clientFile.js](source/featureNode/clientFile.js)
  - `clientFileDownload`, `clientFileModify`, `clientFileUpload`
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
>   --config -c [OPTIONAL] [ARGUMENT=1]
>       # from JSON: set to 'path/to/config.json'
>       # from ENV: set to 'env'
>   --version -v [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --help -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --server-explorer --se [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --file-upload-root-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-upload-merge-path [OPTIONAL-CHECK] [ARGUMENT=1]
>   --server-status-collect --ssc [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --status-collect-path [OPTIONAL-CHECK] [ARGUMENT=1]
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
>     --log-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --log-file-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>     --pid-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --pid-ignore-exist [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>     --token-cache-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --token-cache-expire-time [OPTIONAL-CHECK] [ARGUMENT=1]
>       --token-cache-token-size [OPTIONAL-CHECK] [ARGUMENT=1]
>       --token-cache-size [OPTIONAL-CHECK] [ARGUMENT=1]
>     --auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
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
>     export DR_SERVER_SERVER_EXPLORER="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_FILE_UPLOAD_ROOT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_FILE_UPLOAD_MERGE_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_SERVER_STATUS_COLLECT="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_SERVER_STATUS_COLLECT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
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
>     export DR_SERVER_LOG_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_LOG_FILE_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PID_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_PID_IGNORE_EXIST="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_SERVER_TOKEN_CACHE_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_TOKEN_CACHE_EXPIRE_TIME="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_TOKEN_CACHE_TOKEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_TOKEN_CACHE_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_SERVER_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
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
>     "serverExplorer": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "fileUploadRootPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileUploadMergePath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serverStatusCollect": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "statusCollectPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
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
>     "logPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "logFilePrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "tokenCacheFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tokenCacheExpireTime": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tokenCacheTokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tokenCacheSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGen": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authGenTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTimeGap": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
