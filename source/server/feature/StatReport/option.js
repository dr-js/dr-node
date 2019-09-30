import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact } = Preset

const StatReportFormatConfig = parseCompact('stat-report-process-tag/SS,O')
const getStatReportOption = ({ tryGetFirst }) => ({
  statReportProcessTag: tryGetFirst('stat-report-process-tag')
})

export { StatReportFormatConfig, getStatReportOption }
