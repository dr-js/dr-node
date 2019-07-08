import { roundFloat } from 'dr-js/module/common/math/base'
import { isNumber, isBasicArray } from 'dr-js/module/common/check'

// combinable sum range data

const INITIAL_MERGE_VALUE = [ Infinity, -Infinity, 0, 0 ] // min, max, sum, size

const setSumRaw = (sumKeyList, sumRawList, key, value) => {
  let index = sumKeyList.indexOf(key)
  if (index === -1) {
    index = sumKeyList.length
    sumKeyList = [ ...sumKeyList, key ]
  }
  sumRawList[ index ] = roundFloat(value)
  return sumKeyList
}

const setRangeRaw = (rangeKeyList, rangeRawList, key, value, valueSize = 1) => {
  let index = rangeKeyList.indexOf(key)
  if (index === -1) {
    index = rangeKeyList.length
    rangeKeyList = [ ...rangeKeyList, key ]
  }
  rangeRawList[ index ] = [ roundFloat(value), roundFloat(valueSize) ]
  return rangeKeyList
}

const combineStatusRaw = (statusRawList) => {
  const sumList = []
  const rangeList = []
  statusRawList.forEach(({ sumRawList, rangeRawList }) => {
    sumRawList.forEach((sumRaw, index) => {
      if (!isNumber(sumRaw)) return
      sumList[ index ] = (sumList[ index ] || 0) + sumRaw
    })
    rangeRawList.forEach((rangeRaw, index) => {
      if (!isBasicArray(rangeRaw)) return
      const [ value, valueSize ] = rangeRaw
      const [ min, max, sum, size ] = rangeList[ index ] || INITIAL_MERGE_VALUE
      rangeList[ index ] = [
        Math.min(min, value), // min
        Math.max(max, value), // max
        roundFloat(sum + value * valueSize), // sum
        roundFloat(size + valueSize) // size
      ]
    })
  })
  return { size: statusRawList.length, sumList, rangeList }
}

const combineStatus = (mergeStatusList) => {
  let size = 0
  const sumList = []
  const rangeList = []
  mergeStatusList.forEach((mergeStatus) => {
    size += mergeStatus.size
    mergeStatus.sumList.forEach((value, index) => {
      if (!isNumber(value)) return
      sumList[ index ] = (sumList[ index ] || 0) + value
    })
    mergeStatus.rangeList.forEach((mergeValue, index) => {
      if (!isBasicArray(mergeValue)) return
      const [ min, max, sum, size ] = rangeList[ index ] || INITIAL_MERGE_VALUE
      rangeList[ index ] = [
        Math.min(min, mergeValue[ 0 ]), // min
        Math.max(max, mergeValue[ 1 ]), // max
        roundFloat(sum + mergeValue[ 2 ]), // sum
        roundFloat(size + mergeValue[ 3 ]) // size
      ]
    })
  })
  return { size, sumList, rangeList }
}

export { setSumRaw, setRangeRaw, combineStatusRaw, combineStatus }
