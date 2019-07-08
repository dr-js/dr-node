import { Preset } from 'dr-js/module/node/module/Option/preset'

const { parseCompact } = Preset

const StatusReportFormatConfig = parseCompact('status-report-process-tag/SS,O')
const getStatusReportOption = ({ tryGetFirst }) => ({
  statusReportProcessTag: tryGetFirst('status-report-process-tag')
})

export { StatusReportFormatConfig, getStatusReportOption }
