import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { indentLine } from 'dr-js/module/common/string'

import { collectSourceRouteMap } from 'dr-dev/module/node/export/parse'
import { generateExportInfo } from 'dr-dev/module/node/export/generate'
import { autoAppendMarkdownHeaderLink, renderMarkdownFileLink, renderMarkdownExportPath } from 'dr-dev/module/node/export/renderMarkdown'
import { runMain } from 'dr-dev/module/main'

import { formatUsage } from 'source-bin/option'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownBinOptionFormat = () => [
  renderMarkdownFileLink('source-bin/option.js'),
  '> ```',
  indentLine(formatUsage(), '> '),
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
    ...autoAppendMarkdownHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      '',
      '#### Bin Option Format',
      ...renderMarkdownBinOptionFormat()
    ),
    ''
  ].join('\n'))
}, 'generate-spec')
