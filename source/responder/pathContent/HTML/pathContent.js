const pathContentStyle = `<style>
h2, h6 { margin: 0.5em 4px; }
.select, .directory, .file { display: flex; flex-flow: row nowrap; align-items: stretch; }
.directory:hover, .file:hover { background: #eee; }
.name { overflow:hidden; flex: 1; white-space:nowrap; text-overflow: ellipsis; background: transparent; }
.select .name, .file .name { pointer-events: none; color: #666; }
.edit { pointer-events: auto; min-width: 1.5em; min-height: auto; line-height: normal; }
</style>`

// TODO: add batch modify, mostly batch delete
// TODO: add drag selection

const initPathContent = (URL_PATH_MODIFY, URL_PATH_BATCH_MODIFY, URL_FILE_SERVE) => {
  const {
    prompt, confirm,
    cE, aCL,
    Dr: {
      Common: { Format, Compare: { compareString } },
      Browser: { Resource: { createDownloadWithBlob } }
    }
  } = window

  const SORT_FUNC = { // ([ nameA, sizeA, mtimeMsA ], [ nameB, sizeB, mtimeMsB ]) => 0,
    NAME: ([ nameA ], [ nameB ]) => compareString(nameA, nameB),
    TIME: ([ , , mtimeMsA = 0 ], [ , , mtimeMsB = 0 ]) => mtimeMsB - mtimeMsA, // newer forst
    SIZE: ([ , sizeA ], [ , sizeB ]) => sizeB - sizeA // bigger first
  }
  const SORT_TYPE_LIST = Object.keys(SORT_FUNC)

  const initialPathContentState = {
    pathFragList: [ /* pathFrag */ ],
    pathSortType: SORT_TYPE_LIST[ 0 ],
    selectNameSet: new Set(),
    pathContent: {
      relativePath: '',
      directoryList: [ /* name */ ],
      fileList: [ /* [ name, size, mtimeMs ] */ ]
    }
  }

  const cyclePathSortType = (pathContentStore, pathSortType = pathContentStore.getState().pathSortType) => {
    const nextSortIndex = (SORT_TYPE_LIST.indexOf(pathSortType) + 1) % SORT_TYPE_LIST.length
    pathContentStore.setState({ pathSortType: SORT_TYPE_LIST[ nextSortIndex ] })
  }

  const doLoadPath = async (pathContentStore, pathFragList = pathContentStore.getState().pathFragList, authFetch) => {
    const response = await authFetch(URL_PATH_MODIFY, {
      method: 'POST',
      body: JSON.stringify({ modifyType: 'path-content', relativePathFrom: pathFragList.join('/') })
    })
    const { relativePathFrom: relativePath, directoryList, fileList } = await response.json()
    pathContentStore.setState({ pathFragList, selectNameSet: new Set(), pathContent: { relativePath, directoryList, fileList } })
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
  const getModifyPathBatchAsync = (pathContentStore, authFetch) => async (nameList, modifyType, relativePathFrom, relativePathTo) => {
    if ((modifyType === 'move' || modifyType === 'copy') && (!relativePathTo || relativePathTo === relativePathFrom)) return
    const response = await authFetch(URL_PATH_BATCH_MODIFY, {
      method: 'POST',
      body: JSON.stringify({ nameList, modifyType, relativePathFrom, relativePathTo })
    })
    await response.json()
    await doLoadPath(pathContentStore, undefined, authFetch)
  }
  const getFetchFileAsync = (pathContentStore, authFetch) => async (pathList, fileName) => {
    const response = await authFetch(`${URL_FILE_SERVE}/${encodeURIComponent([ ...pathList, fileName ].join('/'))}`)
    createDownloadWithBlob(fileName, await response.blob())
  }

  const renderPathContent = (pathContentStore, parentElement, loadPath, modifyPath, modifyPathBatch, fetchFile) => {
    const {
      pathFragList,
      pathSortType,
      selectNameSet,
      pathContent: { relativePath, directoryList, fileList }
    } = pathContentStore.getState()

    const selectButton = (name) => {
      const isSelect = selectNameSet.has(name)
      const onclick = () => {
        const nextSelectNameSet = new Set(selectNameSet)
        nextSelectNameSet[ isSelect ? 'delete' : 'add' ](name)
        pathContentStore.setState({ selectNameSet: nextSelectNameSet })
      }
      return cE('button', { className: isSelect ? 'edit select' : 'edit', innerText: isSelect ? '☑' : '☐', onclick })
    }

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
      cE('div', { className: 'select' }, [
        selectNameSet.size
          ? cE('button', { className: 'edit', innerText: '🗃️☐', onclick: () => pathContentStore.setState({ selectNameSet: new Set() }) })
          : cE('button', { className: 'edit', innerText: '🗃️☑', onclick: () => pathContentStore.setState({ selectNameSet: new Set([ ...directoryList, ...fileList.map(([ name ]) => name) ]) }) }),
        cE('span', { className: 'name button', innerText: `${selectNameSet.size} selected` }),
        selectNameSet.size && cE('button', { className: 'edit', innerText: '🗃️✂️', onclick: () => modifyPathBatch([ ...selectNameSet ], 'move', relativePath, prompt(`Batch Move ${selectNameSet.size} Path To`, relativePath)) }),
        selectNameSet.size && cE('button', { className: 'edit', innerText: '🗃️📋', onclick: () => modifyPathBatch([ ...selectNameSet ], 'copy', relativePath, prompt(`Batch Copy ${selectNameSet.size} Path To`, relativePath)) }),
        selectNameSet.size && cE('button', { className: 'edit', innerText: '🗃️🗑️', onclick: () => confirm(`Batch Delete ${selectNameSet.size} Path In: ${relativePath}?`) && modifyPathBatch([ ...selectNameSet ], 'delete', relativePath) })
      ]),
      ...directoryList
        .sort((nameA, nameB) => SORT_FUNC[ pathSortType ]([ nameA ], [ nameB ]))
        .map((name) => cE('div', { className: 'directory' }, [
          selectButton(name),
          cE('span', { className: 'name button', innerText: `📁|${name}/`, onclick: () => loadPath([ ...pathFragList, name ]) }),
          ...commonEdit([ ...pathFragList, name ].join('/'))
        ])),
      ...fileList
        .sort(SORT_FUNC[ pathSortType ])
        .map(([ name, size, mtimeMs ]) => cE('div', { className: 'file' }, [
          selectButton(name),
          cE('span', { className: 'name button', innerText: `📄|${name} - ${new Date(mtimeMs).toLocaleString()}` }),
          cE('button', { className: 'edit', innerText: `${Format.binary(size)}B|💾`, onclick: () => fetchFile(pathFragList, name) }),
          ...commonEdit([ ...pathFragList, name ].join('/'))
        ]))
    ])
  }

  return {
    initialPathContentState,
    cyclePathSortType,
    getLoadPathAsync,
    getModifyPathAsync,
    getModifyPathBatchAsync,
    getFetchFileAsync,
    renderPathContent
  }
}

export { pathContentStyle, initPathContent }
