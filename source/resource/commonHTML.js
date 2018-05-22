import { readFileSync } from 'fs'

const COMMON_LAYOUT = (extraHeadList = [], extraBodyList = []) => [
  `<!DOCTYPE html><html>`,
  `<head>`,
  `<meta charset="utf-8">`,
  `<meta name="viewport" content="minimum-scale=1, width=device-width">`,
  ...extraHeadList,
  `</head>`,
  `<body style="overflow: hidden; display: flex; flex-flow: column; width: 100vw; height: 100vh; font-family: monospace;">`,
  ...extraBodyList,
  `</body>`,
  `</html>`
].join('\n')

const COMMON_STYLE = () => `<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.3); }
  .button { cursor: pointer; }
  button, .button { text-decoration: none; margin: 2px 4px; padding: 2px 4px; border: 0; background: #ddd; }
  button:hover, .button:hover { background: #eee; box-shadow: inset 0 0 0 1px #aaa; }
  @media (pointer: coarse) { button, .button { min-height: 32px; font-size: 18px; } }
  @media (pointer: fine) { button, .button { min-height: 20px; font-size: 14px; } }
</style>`

const COMMON_SCRIPT = () => `<script>Object.assign(window, {
  qS: (selector) => document.querySelector(selector),
  qSS: (selector, innerHTML) => (qS(selector).innerHTML = innerHTML),
  cT: (tagName, attributeMap, ...childTagList) => {
    const tag = Object.assign(document.createElement(tagName), attributeMap)
    childTagList.forEach((childTag) => childTag && tag.appendChild(childTag))
    return tag
  }
})</script>`

const INJECT_GLOBAL_ENV_SCRIPT = (envObject) => `<script>Object.assign(window, ${JSON.stringify(envObject)})</script>`

const DR_BROWSER_SCRIPT = () => `<script>${readFileSync(require.resolve('dr-js/library/Dr.browser'), 'utf8')}</script>`

const AUTH_MASK_SCRIPT = () => `<script>window.initAuthMask = (authCheckUrl, onAuthPass) => {
  const { 
    cT, 
    Dr: {
      Common: { Function: { lossyAsync }, Error: { catchSync, catchAsync }, Module: { TimedLookup: { generateCheckCode, packDataString, parseDataString } } },
      Browser: { DOM: { applyDragFileListListener }, Module: { TimedLookup: { parseLookupBlob } } }
    }
  } = window
  const SAVE_KEY = 'timedLookupData'
  const saveTimedLookupData = (timedLookupData) => localStorage.setItem(SAVE_KEY, packDataString(timedLookupData)) 
  const loadTimedLookupData = () => parseDataString(localStorage.getItem(SAVE_KEY))
  const clearTimedLookupData = () => localStorage.removeItem(SAVE_KEY)
  const authCheck = async (timedLookupData) => {
    const checkCode = generateCheckCode(timedLookupData)
    const { ok } = await fetch(authCheckUrl, { headers: { 'auth-check-code': checkCode } })
    if (!ok) throw new Error('[authCheck] failed for timedLookupData')
    return timedLookupData
  }
  const authCheckFileBlob = lossyAsync(async (fileBlob) => {
    const { result: timedLookupData,  error } = await catchAsync(authCheck, await parseLookupBlob(fileBlob))
    if (error) {
      authInfoPre.innerText = 'auth invalid for file: ' + fileBlob.name
      return
    }
    authMaskDiv.remove()
    onAuthPass(timedLookupData)
    catchSync(saveTimedLookupData, timedLookupData)
  }).trigger
  const authInfoPre = cT('pre', { innerText: 'select auth file', style: 'flex: 1;' })
  const authKeyInput = cT('input', { type: 'file' })
  const authMainDiv = cT('div', { 
    style: 'display: flex; flex: 1; flex-flow: column; padding: 12px; width: 100%; height: 100%; max-width: 480px; max-height: 480px; box-shadow: 0 0 2px 0 #666;' 
  }, authInfoPre, authKeyInput)
  const authMaskDiv = cT('div', { 
    style: 'position: fixed; display: flex; align-items: center; justify-content: center; top: 0px; left: 0px; width: 100vw; height: 100vh; z-index: 256;'
  }, authMainDiv)
  const tryAuthCheck = () => {
    const fileBlob = authKeyInput.files[ 0 ]
    authInfoPre.innerText = fileBlob ? fileBlob.name : 'select auth file'
    fileBlob && authCheckFileBlob(fileBlob)
  }
  applyDragFileListListener(authMaskDiv, (fileList) => { 
    authKeyInput.files = fileList
    tryAuthCheck()
  })
  authKeyInput.addEventListener('change', tryAuthCheck)
  return catchAsync(authCheck, catchSync(loadTimedLookupData).result).then(({ result: timedLookupData, error }) => {
    if (!error) return onAuthPass(timedLookupData)
    document.body.appendChild(authMaskDiv)
    catchSync(clearTimedLookupData)
  })
}</script>`

export {
  COMMON_LAYOUT,
  COMMON_STYLE,
  COMMON_SCRIPT,
  INJECT_GLOBAL_ENV_SCRIPT,
  DR_BROWSER_SCRIPT,
  AUTH_MASK_SCRIPT
}
