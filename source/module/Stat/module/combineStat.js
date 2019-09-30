import { roundFloat } from '@dr-js/core/module/common/math/base'
import { isNumber, isBasicArray } from '@dr-js/core/module/common/check'

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

const combineStatRaw = (statRawList) => {
  const sumList = []
  const rangeList = []
  statRawList.forEach(({ sumRawList, rangeRawList }) => {
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
  return { size: statRawList.length, sumList, rangeList }
}

const combineStat = (mergeStatList) => {
  let size = 0
  const sumList = []
  const rangeList = []
  mergeStatList.forEach((mergeStat) => {
    size += mergeStat.size
    mergeStat.sumList.forEach((value, index) => {
      if (!isNumber(value)) return
      sumList[ index ] = (sumList[ index ] || 0) + value
    })
    mergeStat.rangeList.forEach((mergeValue, index) => {
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

export {
  setSumRaw,
  setRangeRaw,
  combineStatRaw,
  combineStat
}
