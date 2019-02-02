import { parseCompactFormat as parse } from 'dr-js/module/node/module/Option/preset'

const parseList = (...args) => args.map(parse)

// protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
const getServerFormatConfig = (extendFormatList = []) => ({
  ...parse('host,H/SS,O|set "hostname:port"'),
  extendFormatList: [
    {
      ...parse('https,S/T'),
      extendFormatList: parseList(
        'file-SSL-key/SS',
        'file-SSL-cert/SS',
        'file-SSL-chain/SS',
        'file-SSL-dhparam/SS'
      )
    },
    ...extendFormatList
  ]
})
const getServerOption = ({ tryGet, tryGetFirst }) => {
  const host = tryGetFirst('host') || ''
  const [ hostname, port ] = host.split(':')
  return {
    protocol: tryGet('https') ? 'https:' : 'http:',
    hostname: hostname || undefined,
    port: Number(port) || undefined,
    fileSSLKey: tryGetFirst('file-SSL-key'),
    fileSSLCert: tryGetFirst('file-SSL-cert'),
    fileSSLChain: tryGetFirst('file-SSL-chain'),
    fileSSLDHParam: tryGetFirst('file-SSL-dhparam')
  }
}

// uploadRootPath, uploadMergePath
const ExplorerFormatConfig = {
  ...parse('explorer-root-path/SP,O'),
  extendFormatList: parseList('explorer-upload-merge-path/SP')
}
const getExplorerOption = ({ tryGetFirst }) => ({
  explorerRootPath: tryGetFirst('explorer-root-path'),
  explorerUploadMergePath: tryGetFirst('explorer-upload-merge-path')
})

// statusCollectPath, statusCollectUrl, statusCollectInterval
const StatusCollectFormatConfig = {
  ...parse('status-collect-path/SP,O'),
  extendFormatList: parseList(
    'status-collect-url/SS,O',
    'status-collect-interval/SI,O'
  )
}
const getStatusCollectOption = ({ tryGetFirst }) => ({
  statusCollectPath: tryGetFirst('status-collect-path'),
  statusCollectUrl: tryGetFirst('status-collect-url'),
  statusCollectInterval: tryGetFirst('status-collect-interval')
})

// statusReportProcessTag
const StatusReportFormatConfig = parse('status-report-process-tag/SS,O')
const getStatusReportOption = ({ tryGetFirst }) => ({
  statusReportProcessTag: tryGetFirst('status-report-process-tag')
})

const TaskRunnerFormatConfig = parse('task-runner-root-path/SP,O')
const getTaskRunnerOption = ({ tryGetFirst }) => ({
  taskRunnerRootPath: tryGetFirst('task-runner-root-path')
})

export {
  getServerFormatConfig, getServerOption,

  ExplorerFormatConfig, getExplorerOption,
  StatusCollectFormatConfig, getStatusCollectOption,
  StatusReportFormatConfig, getStatusReportOption,
  TaskRunnerFormatConfig, getTaskRunnerOption
}
