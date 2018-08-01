const pathContentStyle = `<style>
h2, h6 { margin: 0.5em 4px; }
.directory, .file { display: flex; flex-flow: row nowrap; align-items: stretch; }
.directory:hover, .file:hover { background: #eee; }
.name { overflow:hidden; flex: 1; white-space:nowrap; text-overflow: ellipsis; background: transparent; }
.file .name { pointer-events: none; color: #666; }
.edit { pointer-events: auto; min-width: 1.5em; min-height: auto; line-height: normal; }
</style>`

const initPathContent = (URL_PATH_MODIFY, URL_FILE_SERVE) => {
  const {
    prompt, confirm,
    cE, aCL,
    Dr: {
      Common: { Format },
      Browser: { Resource: { createDownloadWithBlob } }
    }
  } = window

  const initialPathContentState = {
    pathFragList: [ /* pathFrag */ ],
    pathContent: {
      relativePath: '',
      directoryList: [ /* name */ ],
      fileList: [ /* name */ ]
    }
  }

  const doLoadPath = async (pathContentStore, pathFragList = pathContentStore.getState().pathFragList, authFetch) => {
    const response = await authFetch(URL_PATH_MODIFY, {
      method: 'POST',
      body: JSON.stringify({ modifyType: 'path-content', relativePathFrom: pathFragList.join('/') })
    })
    const { relativePathFrom: relativePath, directoryList, fileList } = await response.json()
    pathContentStore.setState({ pathFragList, pathContent: { relativePath, directoryList, fileList } })
  }

  const getLoadPathAsync = (pathContentStore, authFetch) => async (pathFragList) => doLoadPath(pathContentStore, pathFragList, authFetch)
  const getModifyPathAsync = (pathContentStore, authFetch) => async (modifyType, relativePathFrom, relativePathTo) => {
    if ((modifyType === 'move' || modifyType === 'copy') && (!relativePathTo || relativePathTo === relativePathFrom)) return
    const response = await authFetch(URL_PATH_MODIFY, {
      method: 'POST',
      body: JSON.stringify({ modifyType, relativePathFrom, relativePathTo })
    })
    await response.json()
    await doLoadPath(pathContentStore, undefined, authFetch)
  }
  const getFetchFileAsync = (pathContentStore, authFetch) => async (pathList, fileName) => {
    const response = await authFetch(`${URL_FILE_SERVE}/${encodeURIComponent([ ...pathList, fileName ].join('/'))}`)
    createDownloadWithBlob(fileName, await response.blob())
  }

  const renderPathContent = (pathContentStore, parentElement, loadPath, modifyPath, fetchFile) => {
    const { pathFragList, pathContent: { relativePath, directoryList, fileList } } = pathContentStore.getState()

    const commonEdit = (relativePath) => [
      cE('button', { className: 'edit', innerText: '✂️', onclick: () => modifyPath('move', relativePath, prompt('Move To', relativePath)) }),
      cE('button', { className: 'edit', innerText: '📋', onclick: () => modifyPath('copy', relativePath, prompt('Copy To', relativePath)) }),
      cE('button', { className: 'edit', innerText: '🗑️', onclick: () => confirm(`Delete path: ${relativePath}?`) && modifyPath('delete', relativePath) })
    ]

    parentElement.innerHTML = ''

    aCL(parentElement, [
      cE('h2', { innerText: relativePath ? (`/${relativePath}/`) : '[ROOT]' }),
      cE('h6', { innerText: `${directoryList.length} directory, ${fileList.length} file (${Format.binary(fileList.reduce((o, [ , size ]) => o + size, 0))}B)` }),
      relativePath && cE('div', { className: 'directory' }, [
        cE('span', { className: 'name button', innerText: '🔙|..', onclick: () => loadPath(pathFragList.slice(0, -1)) })
      ]),
      ...directoryList.map((name) => cE('div', { className: 'directory' }, [
        cE('span', { className: 'name button', innerText: `📁|${name}/`, onclick: () => loadPath([ ...pathFragList, name ]) }),
        ...commonEdit([ ...pathFragList, name ].join('/'))
      ])),
      ...fileList.map(([ name, size, mtimeMs ]) => cE('div', { className: 'file' }, [
        cE('span', { className: 'name button', innerText: `📄|${name} - ${new Date(mtimeMs).toLocaleString()}` }),
        cE('button', { className: 'edit', innerText: `${Format.binary(size)}B|💾`, onclick: () => fetchFile(pathFragList, name) }),
        ...commonEdit([ ...pathFragList, name ].join('/'))
      ]))
    ])
  }

  return {
    initialPathContentState,
    getLoadPathAsync,
    getModifyPathAsync,
    getFetchFileAsync,
    renderPathContent
  }
}

export { pathContentStyle, initPathContent }
