import { readFileSync } from 'fs'

const DR_BROWSER_SCRIPT = () => `<script>${readFileSync(require.resolve('dr-js/library/Dr.browser'), 'utf8')}</script>`

export { DR_BROWSER_SCRIPT }
