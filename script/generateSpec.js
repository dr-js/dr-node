import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { stringIndentLine } from 'dr-js/module/common/format'
import { formatUsage } from 'source-bin/option'

import { argvFlag, runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { collectSourceRouteMap } from 'dev-dep-tool/library/ExportIndex/parseExport'
import { generateExportInfo } from 'dev-dep-tool/library/ExportIndex/generateInfo'
import { getMarkdownHeaderLink, renderMarkdownFileLink, renderMarkdownExportPath } from 'dev-dep-tool/library/ExportIndex/renderMarkdown'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownBinOptionFormat = () => [
  renderMarkdownFileLink('source-bin/option.js'),
  '> ```',
  stringIndentLine(formatUsage(), '> '),
  '> ```'
]

runMain(async (logger) => {
  logger.padLog(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ pathRootList: [ fromRoot('source') ], logger })

  logger.padLog(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...[ 'Export Path', 'Bin Option Format' ]
      .map((text) => `* ${getMarkdownHeaderLink(text)}`),
    '',
    '#### Export Path',
    ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
    '',
    '#### Bin Option Format',
    ...renderMarkdownBinOptionFormat(),
    ''
  ].join('\n'))
}, getLogger('generate-spec', argvFlag('quiet')))
