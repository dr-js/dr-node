import {
  COMMON_LAYOUT,
  COMMON_STYLE,
  COMMON_SCRIPT,
  INJECT_GLOBAL_ENV_SCRIPT,
  DR_BROWSER_SCRIPT,
  AUTH_MASK_SCRIPT
} from 'source/resource/commonHTML'

const getHTML = (envObject) => COMMON_LAYOUT([
  COMMON_STYLE(),
  mainStyle
], [
  `<div id="control-panel" style="overflow-x: auto; display: flex; flex-flow: row nowrap; box-shadow: 0 0 12px 0 #666;"></div>`,
  `<div id="explorer-panel" style="overflow: auto; display: flex; flex-flow: column nowrap; flex: 1; min-height: 0;"></div>`,
  COMMON_SCRIPT(),
  mainScript,
  INJECT_GLOBAL_ENV_SCRIPT(envObject),
  AUTH_MASK_SCRIPT(),
  DR_BROWSER_SCRIPT()
])

const mainStyle = `<style>
  .explorer-path { margin: 12px 2px; }
  .explorer-directory, .explorer-file { display: flex; flex-flow: row nowrap; align-items: stretch; margin: 0; text-align: left; background: transparent; border-top: 1px solid #ddd; font-family: monospace; }
  .explorer-file { pointer-events: none; color: #666; }
  .explorer-name { overflow:hidden; flex: 1; align-self: center; white-space:nowrap; text-overflow: ellipsis; }
  .explorer-edit { pointer-events: auto; color: #aaa; min-width: 1.5em; min-height: auto; line-height: normal; }
</style>`

const mainScript = `<script>window.onload = () => {
  const {
    qS,
    cT,
    initAuthMask,
    PATH_CONTENT_URL,
    PATH_MODIFY_URL,
    SEND_FILE_URL,
    AUTH_CHECK_URL,
    Dr: { 
      Common: { Function: { lossyAsync }, Module: { TimedLookup: { generateCheckCode } } },
      Browser: { Resource: { createDownloadBlob } }
    }
  } = window

  const initExplorer = (timedLookupData) => {
    const getAuthCheckCode = () => generateCheckCode(timedLookupData)
    
    const fetchPathContent = async (relativePath) => {
      const response = await fetch(PATH_CONTENT_URL + '/' + encodeURI(relativePath), { method: 'GET', headers: { 'auth-check-code': getAuthCheckCode() } })
      if (!response.ok) throw new Error('[fetchPathContent] error status: ' + response.status)
      return response.json()
    }
    
    const fetchPathModify = async (modifyType, relativePathFrom, relativePathTo) => {
      const response = await fetch(PATH_MODIFY_URL, { method: 'POST', headers: { 'auth-check-code': getAuthCheckCode() }, body: JSON.stringify({ modifyType, relativePathFrom, relativePathTo }) })
      if (!response.ok) throw new Error('[fetchPathContent] error status: ' + response.status)
      return response.json()
    }
    
    const fetchSendFile = async (relativePath, fileName) => {
      const response = await fetch(SEND_FILE_URL + '/' + encodeURI(relativePath), { method: 'GET', headers: { 'auth-check-code': getAuthCheckCode() } })
      if (!response.ok) throw new Error('[fetchPathContent] error status: ' + response.status)
      createDownloadBlob(fileName, [ await response.blob() ])
    }
    
    const modifyDelete = lossyAsync(async (pathList, name) => {
      await fetchPathModify('delete', [ ...pathList, name ].join('/'))
      updatePath(pathList)
    }).trigger
    
    const sendFile = lossyAsync((pathList, name) => fetchSendFile([ ...pathList, name ].join('/'), name)).trigger
    
    const updatePath = lossyAsync(async (pathList = []) => {
      const explorerPanel = qS('#explorer-panel')
      const loadingMask = document.body.appendChild(cT('div', { style: 'position: absolute; top: 0px; left: 0px; width: 100vw; height: 100vh; background: #eee; opacity: 0; z-index: 256; transition: opacity 1s ease;' }))
      setTimeout(() => { loadingMask.style.opacity = '0.5' }, 200)
      
      const { relativePath, directoryList, fileList } = await fetchPathContent(pathList.join('/'))
      currentPathList = pathList

      // await window.Dr.Common.Time.setTimeoutAsync(500)
      
      loadingMask.remove()
      explorerPanel.innerHTML = ''
      explorerPanel.appendChild(cT('h2', { className: 'explorer-path', innerText: relativePath ? ('/' + relativePath + '/') : '[ROOT]' }))
      relativePath && explorerPanel.appendChild(cT('button', { className: 'explorer-directory', innerText: '🔙|..', onclick: () => updatePath(pathList.slice(0, -1)) }))
      directoryList.map((name) => explorerPanel.appendChild(cT(
        'button', 
        { className: 'explorer-directory', onclick: () => updatePath([ ...pathList, name ]) },
        cT('span', { className: 'explorer-name', innerText: '📁|' + name + '/' }),
        cT('button', { className: 'explorer-edit', innerText: '☓', onclick: () => modifyDelete(pathList, name) })
      )))
      fileList.map((name) => explorerPanel.appendChild(cT(
        'button', 
        { className: 'explorer-file' },
        cT('span', { className: 'explorer-name', innerText: '📄|' + name }),
        cT('button', { className: 'explorer-edit', innerText: '⇩', onclick: () => sendFile(pathList, name) }),
        cT('button', { className: 'explorer-edit', innerText: '☓', onclick: () => modifyDelete(pathList, name) })
        )))
    }).trigger
    
    qS('#control-panel').appendChild(cT('button', { innerText: 'Refresh', onclick: () => updatePath(currentPathList) }))
    qS('#control-panel').appendChild(cT('button', { innerText: 'To Root', onclick: () => updatePath([]) }))

    let currentPathList = []

    updatePath(currentPathList)
  }

  initAuthMask(AUTH_CHECK_URL, initExplorer)
}</script>`

export { getHTML }
