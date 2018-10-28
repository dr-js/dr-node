const pathContentStyle = `<style>
h2, h6 { margin: 0.5em 4px; }
.select, .directory, .file { display: flex; flex-flow: row nowrap; align-items: stretch; }
.directory:hover, .file:hover { background: #eee; }
.name { overflow:hidden; flex: 1; white-space:nowrap; text-align: left; text-overflow: ellipsis; background: transparent; }
.select .name, .file .name { pointer-events: none; color: #666; }
.edit { pointer-events: auto; min-width: 1.5em; min-height: auto; line-height: normal; }
</style>`

// TODO: add batch modify, mostly batch delete
// TODO: add drag selection

const initPathContent = (URL_PATH_MODIFY, URL_PATH_BATCH_MODIFY, URL_FILE_SERVE, withConfirmModal, withPromptModal) => {
  const {
    qS, cE, aCL,
    Dr: { Common: { Format, Compare: { compareString } } }
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
  const getModifyPathBatchAsync = (pathContentStore, authFetch) => async (nameList, modifyType, relativePathFrom, relativePathTo) => {
    if ((modifyType === 'move' || modifyType === 'copy') && (!relativePathTo || relativePathTo === relativePathFrom)) return
    const response = await authFetch(URL_PATH_BATCH_MODIFY, {
      method: 'POST',
      body: JSON.stringify({ nameList, modifyType, relativePathFrom, relativePathTo })
    })
    await response.json()
    await doLoadPath(pathContentStore, undefined, authFetch)
  }
  const getDownloadFileAsync = (pathContentStore, authDownload) => async (pathList, fileName) => authDownload(
    `${URL_FILE_SERVE}/${encodeURIComponent([ ...pathList, fileName ].join('/'))}`,
    fileName
  )

  const renderPathContent = (pathContentStore, parentElement, loadPath, modifyPath, modifyPathBatch, downloadFile) => {
    const {
      pathFragList,
      pathSortType,
      pathContent: { relativePath, directoryList, fileList }
    } = pathContentStore.getState()

    const selectToggleMap = {}
    const selectNameSet = new Set()

    const selectEditSelectNone = cE('button', {
      className: 'edit',
      innerText: '🗃️☑',
      onclick: () => {
        selectNameSet.forEach((name) => selectToggleMap[ name ]())
        updateSelectStatus()
      }
    })
    const selectEditSelectAll = cE('button', {
      className: 'edit',
      innerText: '🗃️☐',
      onclick: () => {
        Object.entries(selectToggleMap).forEach(([ name, toggle ]) => !selectNameSet.has(name) && toggle())
        updateSelectStatus()
      }
    })

    const selectEditMove = cE('button', { className: 'edit', innerText: '🗃️✂️', onclick: async () => modifyPathBatch([ ...selectNameSet ], 'move', relativePath, await withPromptModal(`Batch Move ${selectNameSet.size} Path To`, relativePath)) })
    const selectEditCopy = cE('button', { className: 'edit', innerText: '🗃️📋', onclick: async () => modifyPathBatch([ ...selectNameSet ], 'copy', relativePath, await withPromptModal(`Batch Copy ${selectNameSet.size} Path To`, relativePath)) })
    const selectEditDelete = cE('button', { className: 'edit', innerText: '🗃️🗑️', onclick: async () => (await withConfirmModal(`Batch Delete ${selectNameSet.size} Path In: ${relativePath || 'ROOT'}?`)) && modifyPathBatch([ ...selectNameSet ], 'delete', relativePath) })

    const updateSelectStatus = () => aCL(qS('.select', ''), [
      selectNameSet.size ? selectEditSelectNone : selectEditSelectAll,
      selectNameSet.size && selectEditMove,
      selectNameSet.size && selectEditCopy,
      selectNameSet.size && selectEditDelete,
      cE('span', { className: 'name button', innerText: `${selectNameSet.size} selected` })
    ])

    const renderSelectButton = (name) => {
      const toggle = () => {
        const prevIsSelect = selectNameSet.has(name)
        selectNameSet[ prevIsSelect ? 'delete' : 'add' ](name)
        const isSelect = !prevIsSelect
        element.className = isSelect ? 'edit select' : 'edit'
        element.innerText = isSelect ? '☑' : '☐'
      }
      const element = cE('button', {
        className: 'edit',
        innerText: '☐',
        onclick: () => {
          toggle()
          updateSelectStatus()
        }
      })
      selectToggleMap[ name ] = toggle
      return element
    }

    const renderCommonEditList = (relativePath) => [
      cE('button', { className: 'edit', innerText: '✂️', onclick: async () => modifyPath('move', relativePath, await withPromptModal('Move To', relativePath)) }),
      cE('button', { className: 'edit', innerText: '📋', onclick: async () => modifyPath('copy', relativePath, await withPromptModal('Copy To', relativePath)) }),
      cE('button', { className: 'edit', innerText: '🗑️', onclick: async () => (await withConfirmModal(`Delete path: ${relativePath}?`)) && modifyPath('delete', relativePath) })
    ]

    parentElement.innerHTML = ''

    aCL(parentElement, [
      cE('h2', { innerText: relativePath ? (`/${relativePath}/`) : '[ROOT]' }),
      cE('h6', { innerText: `${directoryList.length} directory, ${fileList.length} file (${Format.binary(fileList.reduce((o, [ , size ]) => o + size, 0))}B)` }),
      relativePath && cE('div', { className: 'directory' }, [
        cE('button', { className: 'name', innerText: '🔙|..', onclick: () => loadPath(pathFragList.slice(0, -1)) })
      ]),
      cE('div', { className: 'select' }),
      ...directoryList
        .sort((nameA, nameB) => SORT_FUNC[ pathSortType ]([ nameA ], [ nameB ]))
        .map((name) => cE('div', { className: 'directory' }, [
          renderSelectButton(name),
          cE('button', { className: 'name', innerText: `📁|${name}/`, onclick: () => loadPath([ ...pathFragList, name ]) }),
          ...renderCommonEditList([ ...pathFragList, name ].join('/'))
        ])),
      ...fileList
        .sort(SORT_FUNC[ pathSortType ])
        .map(([ name, size, mtimeMs ]) => cE('div', { className: 'file' }, [
          renderSelectButton(name),
          cE('span', { className: 'name button', innerText: `📄|${name} - ${new Date(mtimeMs).toLocaleString()}` }),
          cE('button', { className: 'edit', innerText: `${Format.binary(size)}B|💾`, onclick: () => downloadFile(pathFragList, name) }),
          ...renderCommonEditList([ ...pathFragList, name ].join('/'))
        ]))
    ])

    updateSelectStatus()
  }

  return {
    initialPathContentState,
    cyclePathSortType,
    getLoadPathAsync,
    getModifyPathAsync,
    getModifyPathBatchAsync,
    getDownloadFileAsync,
    renderPathContent
  }
}

export { pathContentStyle, initPathContent }
