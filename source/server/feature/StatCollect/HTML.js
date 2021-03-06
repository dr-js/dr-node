import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT } from '@dr-js/core/module/node/server/commonHTML'
import { DR_BROWSER_SCRIPT_TAG } from '@dr-js/core/module/node/resource'

import { initAuthMask } from 'source/server/feature/Auth/HTML'

const getHTML = ({
  URL_AUTH_CHECK_ABBR,
  URL_STAT_STATE,
  CONFIG_RENDER_PRESET
}) => COMMON_LAYOUT([
  '<title>Stat Visualize</title>',
  COMMON_STYLE(),
  mainStyle
], [
  '<div id="control-panel" style="overflow-x: auto; display: flex; flex-flow: row nowrap; box-shadow: 0 0 8px 0 #888;"></div>',
  '<div id="chart-panel" style="overflow: auto; flex: 1; min-height: 0;"></div>',
  COMMON_SCRIPT({
    INIT: [ // NOTE: shorter after minify
      URL_AUTH_CHECK_ABBR, URL_STAT_STATE,
      CONFIG_RENDER_PRESET
    ],
    initAuthMask,
    onload: onLoadFunc
  }),
  DR_BROWSER_SCRIPT_TAG()
])

const mainStyle = `<style>
h2, h4 { padding: 4px 2px 2px; }

.chart { user-select: none; position: relative; overflow: visible; margin: 10px; outline: none; }
.chart-panel-vertical { pointer-events: none; position: absolute; left: 0; top: 0; overflow: visible; }
.chart-label-vertical { position: absolute; left: 0; transform: translateY(50%); color: #888; z-index: 1; }
.chart-main { display: flex; flex-flow: row nowrap; position: relative; overflow-x: auto; box-shadow: 0 0 2px 0 #8884; }
.chart-label-horizontal { pointer-events: none; position: relative; overflow: visible; width: 0; box-shadow: 0 0 0 1px #8886; z-index: 1; }
.chart-label-horizontal-tag { position: absolute; top: 0; color: #8886; }
.chart-bar { position: relative; overflow: visible; flex: 0 0; height: 100%; }
.chart-bar-value { position: absolute; left: 0; bottom: 0; width: 100%; background: var(--c-dr); }
.chart-bar-value-range { position: absolute; left: 0; width: 100%; box-shadow: inset 0 0 2px 0 #888; }
.chart-bar-tag { display: none; pointer-events: none; position: absolute; left: 100%; top: 0; background: #8884; white-space: pre; z-index: 2; }
.chart-bar:hover { box-shadow: 0 0 8px 0 #888; z-index: 2; }
.chart-bar:hover .chart-bar-tag { display: initial; }

.chart-panel-vertical, .chart-main { height: 100px; }
.chart:focus .chart-panel-vertical, .chart:focus .chart-main { height: 300px; }
</style>`

const onLoadFunc = () => {
  const {
    alert, location,
    qS, cE,
    INIT: [
      URL_AUTH_CHECK_ABBR, URL_STAT_STATE,
      CONFIG_RENDER_PRESET
    ],
    initAuthMask,
    Dr: {
      Common: {
        Format,
        Math: { roundFloat, clamp },
        Compare: { compareString },
        Function: { lossyAsync }
      }
    }
  } = window

  const renderChartMain = ({
    dataList, positionScale = 2, horizontalDelta = 50, formatPosition = String,
    prevHorizontalPosition = Infinity
  }) => [
    '<div class="chart-main">',
    '<div class="chart-bar" style="pointer-events: none; flex-basis: 64px;"></div>',
    ...dataList.reduce((o, [ tag, [ from, to, value, min, max ] ]) => {
      if (prevHorizontalPosition - horizontalDelta >= from) {
        o.push(`<div class="chart-label-horizontal"><div class="chart-label-horizontal-tag">${formatPosition(from)}</div></div>`)
        prevHorizontalPosition = from
      }
      o.push(
        `<div class="chart-bar" style="flex-basis: ${clamp(Math.abs((from - to) * positionScale), 4, 256)}px;${value === undefined ? ' pointer-events: none;' : ''}">`,
        tag && `<div class="chart-bar-tag">${tag}</div>`,
        ...(value === undefined ? [] : min !== max ? [
          `<div class="chart-bar-value" style="height: ${value}%;"></div>`,
          `<div class="chart-bar-value-range" style="bottom: ${min}%; height: ${max - min}%"></div>`
        ] : [
          `<div class="chart-bar-value" style="height: ${value}%;"></div>`
        ]),
        '</div>'
      )
      return o
    }, []),
    '<div class="chart-bar" style="pointer-events: none; flex-basis: 256px;"></div>',
    '</div>'
  ]

  const renderChart = ({
    title,
    labelVerticalDataList,
    dataList, positionScale, horizontalDelta, formatPosition
  }) => [
    `<h4>${title}</h4>`,
    '<div class="chart" tabindex="0">',
    '<div class="chart-panel-vertical">',
    ...labelVerticalDataList.map(([ percent, label ]) => `<div class="chart-label-vertical" style="bottom: ${percent}%;">${label}</div>`),
    '</div>',
    ...renderChartMain({ dataList, positionScale, horizontalDelta, formatPosition }),
    '</div>'
  ]

  // will mark value gap with undefined
  const getValueTrack = (
    dataList,
    getPositionData, parsePositionToRange,
    getValueData, parseValue,
    preset = {}
  ) => {
    let resultTrackList = [] // [ from , to, value, min, max ]
    let { valueMin = Infinity, valueMax = -Infinity, mergeGapMax = 0 } = preset
    let prevPositionTo

    dataList.forEach((data) => {
      const positionData = getPositionData(data)
      const valueData = getValueData(data)
      if (!positionData || !valueData) return
      const [ from, to ] = parsePositionToRange(positionData)
      const [ value, min, max ] = parseValue(valueData)
      valueMin = Math.min(valueMin, min)
      valueMax = Math.max(valueMax, max)
      prevPositionTo && prevPositionTo !== from && resultTrackList.push([ prevPositionTo, from ])
      resultTrackList.push([ from, to, value, min, max ])
      prevPositionTo = to
    })

    if (mergeGapMax) { // reduce interval gaps
      let prevTrack
      resultTrackList = resultTrackList.reduce((o, track) => {
        const [ from, to, value ] = track
        if (value) {
          o.push(track)
          prevTrack = track
        } else {
          if (prevTrack && Math.abs(from - to) <= mergeGapMax) prevTrack[ 1 ] = to
          else o.push(track)
          prevTrack = undefined
        }
        return o
      }, [])
    }

    return {
      ...preset,
      resultTrackList,
      positionFrom: resultTrackList.length ? resultTrackList[ 0 ][ 0 ] : Infinity,
      positionTo: resultTrackList.length ? resultTrackList[ resultTrackList.length - 1 ][ 1 ] : -Infinity,
      valueMin,
      valueMax
    }
  }

  const parseTimestampRawToMinMax = ([ value ]) => [ value, value - 1 ]
  const parseTimestampToMinMax = ([ min, max ]) => [ max, min - 1 ]

  const parseNumberToValueMinMax = (value) => [ value, value, value ]
  const parseRangeRawToValueMinMax = ([ value ]) => [ value, value, value ]
  const parseRangeToValueMinMax = ([ min, max, sum, size ]) => [ roundFloat(sum / size), min, max ]

  const renderValueTrackList = ({
    title, resultTrackList,
    positionFrom, positionTo,
    valueMin, valueMax,
    formatPosition = String, formatValue = roundFloat,
    positionScale, horizontalDelta
  }) => {
    const valueRange = valueMax - valueMin
    const normalizeValue = valueRange
      ? (value) => (value - valueMin) / valueRange * 100
      : () => 50
    const labelVerticalDataList = [ 0, 0.25, 0.50, 0.75, 1 ]
      .map((value) => [ value * 100, formatValue(valueMin + value * valueRange) ])
    const dataList = resultTrackList
      .map(([ from, to, value, min, max ]) => {
        if (value === undefined) return [ '', [ from, to ] ] // gap, no value
        const tagList = [
          `from:  ${formatPosition(from)}`,
          `to:    ${formatPosition(to)}`,
          `value: ${formatValue(value)}`
        ]
        min !== max && tagList.push(
          `min:   ${formatValue(min)}`,
          `max:   ${formatValue(max)}`
        )
        const valueData = [ from, to, normalizeValue(value) ]
        min !== max && valueData.push(normalizeValue(min), normalizeValue(max))
        return [ tagList.join('\n'), valueData ]
      })
    return renderChart({
      title,
      labelVerticalDataList,
      dataList,
      positionScale,
      horizontalDelta,
      formatPosition
    })
  }

  const renderStatList = (
    { dataList, getPositionData, parsePositionData, preset = {} },
    { statKeyList, statPresetList, statSkipIndexSet, getStatData, parseStatData }
  ) => statKeyList.map((key, keyIndex) => !statSkipIndexSet.has(keyIndex) && getValueTrack(
    dataList,
    getPositionData,
    parsePositionData,
    (data) => getStatData(data, keyIndex),
    parseStatData,
    { title: key, ...preset, ...(statPresetList[ keyIndex ] || {}) }
  )).filter((v) => v && v.resultTrackList.length)

  const renderStatRawList = ({ dataList, getPositionData = GET_STATE().getTimestampRawData, parsePositionData = parseTimestampRawToMinMax, preset }) => [
    ...renderStatList(
      { dataList, getPositionData, parsePositionData, preset },
      { ...GET_STATE().packSum, getStatData: (data, keyIndex) => data.sumRawList[ keyIndex ], parseStatData: parseNumberToValueMinMax }
    ),
    ...renderStatList(
      { dataList, getPositionData, parsePositionData, preset },
      { ...GET_STATE().packRange, getStatData: (data, keyIndex) => data.rangeRawList[ keyIndex ], parseStatData: parseRangeRawToValueMinMax }
    )
  ]

  const renderMergeList = ({ dataList, getPositionData = GET_STATE().getTimestampData, parsePositionData = parseTimestampToMinMax, preset }) => [
    ...renderStatList(
      { dataList, getPositionData, parsePositionData, preset },
      { ...GET_STATE().packSum, getStatData: (data, keyIndex) => data.sumList[ keyIndex ], parseStatData: parseNumberToValueMinMax }
    ),
    ...renderStatList(
      { dataList, getPositionData, parsePositionData, preset },
      { ...GET_STATE().packRange, getStatData: (data, keyIndex) => data.rangeList[ keyIndex ], parseStatData: parseRangeToValueMinMax }
    )
  ]

  const createRenderStatButton = (id, title, renderFunc, getDataList, preset) => {
    if (qS(`#${id}`)) return
    const renderChart = () => qS('#chart-panel', [
      `<h2>${title}</h2>`,
      ...renderFunc({ dataList: getDataList(), preset })
        .sort((a, b) => a.order - b.order || compareString(a.title, b.title))
        .map((valueTrack) => renderValueTrackList(valueTrack).join('\n'))
    ].join('<br />'))
    qS('#control-panel').appendChild(cE('button', { id, innerText: title, onclick: renderChart }))
  }

  const formatTimestamp = (value) => {
    const [ , date, time ] = /(\d+-\d+-\d+)T(\d+:\d+:\d+)/.exec(new Date(value * 1000).toISOString())
    return `${time} ${date.replace(/-/g, '.')}`
  }
  const formatBinaryData = (value) => `${Format.binary(value)}B`

  const fetchStatState = lossyAsync(async (authRevoke, authFetch) => {
    const {
      sumKeyList,
      rangeKeyList,
      statRawList,
      merge0List,
      merge1List,
      merge2List
    } = await (await authFetch(URL_STAT_STATE)).json()

    const sumPresetList = []
    sumPresetList[ sumKeyList.indexOf('error') ] = { order: 0, title: 'error count', valueMin: 0 }
    sumPresetList[ sumKeyList.indexOf('retryCount') ] = { order: 0, title: 'retry count', valueMin: 0 }

    const rangePresetList = []
    rangePresetList[ rangeKeyList.indexOf('timeOk') ] = { order: 1, valueMin: 0, valueMax: 100, formatValue: Format.time }
    rangePresetList[ rangeKeyList.indexOf('timeDownload') ] = { order: 1, valueMin: 0, valueMax: 10, formatValue: Format.time }
    rangePresetList[ rangeKeyList.indexOf('systemMemoryUsed') ] = { order: 2, valueMin: 0, valueMax: 1, formatValue: Format.percent }
    rangePresetList[ rangeKeyList.indexOf('processMemoryRSS') ] = { order: 2, valueMin: 0, valueMax: 48 * 1024 * 1024, formatValue: formatBinaryData }
    rangePresetList[ rangeKeyList.indexOf('processMemoryHeap') ] = { order: 2, valueMin: 0, valueMax: 48 * 1024 * 1024, formatValue: formatBinaryData }
    rangeKeyList.forEach((rangeKey, index) => {
      if (!rangeKey.includes('ProcessorUsed')) return
      rangePresetList[ index ] = { order: 2, valueMin: 0, valueMax: 1, formatValue: Format.percent }
    })

    const timestampIndex = rangeKeyList.indexOf('timestamp')
    const getTimestampRawData = (data) => data.rangeRawList[ timestampIndex ]
    const getTimestampData = (data) => data.rangeList[ timestampIndex ]
    const sumSkipIndexSet = new Set([])
    const rangeSkipIndexSet = new Set([ rangeKeyList.indexOf('timestamp'), rangeKeyList.indexOf('timestampStat') ])

    STATE = {
      statRawList,
      merge0List,
      merge1List,
      merge2List,
      getTimestampRawData,
      getTimestampData,
      packSum: { statKeyList: sumKeyList, statPresetList: sumPresetList, statSkipIndexSet: sumSkipIndexSet },
      packRange: { statKeyList: rangeKeyList, statPresetList: rangePresetList, statSkipIndexSet: rangeSkipIndexSet }
    }

    qS('#chart-panel', '')
    createRenderStatButton('render-stat-raw', 'RenderStatRaw', renderStatRawList, () => GET_STATE().statRawList, { ...CONFIG_RENDER_PRESET.StatRaw, formatPosition: formatTimestamp })
    createRenderStatButton('render-merge-0', 'RenderMerge0', renderMergeList, () => GET_STATE().merge0List, { ...CONFIG_RENDER_PRESET.Merge0, formatPosition: formatTimestamp })
    createRenderStatButton('render-merge-1', 'RenderMerge1', renderMergeList, () => GET_STATE().merge1List, { ...CONFIG_RENDER_PRESET.Merge1, formatPosition: formatTimestamp })
    createRenderStatButton('render-merge-2', 'RenderMerge2', renderMergeList, () => GET_STATE().merge2List, { ...CONFIG_RENDER_PRESET.Merge2, formatPosition: formatTimestamp })

    qS('#render-stat-raw').click()
  }).trigger

  let STATE
  const GET_STATE = () => {
    if (STATE) return STATE
    alert('data not ready!')
    throw new Error('data not ready!')
  }

  initAuthMask({
    URL_AUTH_CHECK_ABBR,
    onAuthPass: ({ authRevoke, authFetch }) => {
      qS('#control-panel').appendChild(cE('button', { innerHTML: 'ReloadData', onclick: () => fetchStatState(authRevoke, authFetch) }))
      fetchStatState(authRevoke, authFetch)
      qS('#control-panel').appendChild(cE('button', { innerText: 'Auth Revoke', onclick: () => authRevoke().then(() => location.reload()) }))
    }
  })
}

export { getHTML }
