import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

export function quantile(
  values: (string | number | BigNumber)[],
  q: number,
  options: {
    isSorted: boolean
    roundingMode?: BigNumber.RoundingMode
  } = { isSorted: false }
): BigNumber {
  const bigNumberValues: BigNumber[] = values.map((value: string | number | BigNumber) =>
    BigNumber.isBigNumber(value) ? value : new BigNumber(value)
  )

  const sortedValues: BigNumber[] = options.isSorted ? bigNumberValues : bigNumberValues.sort()
  const index = Math.floor((sortedValues.length - 1) * q)

  if (sortedValues.length % 2 !== 0 || index === sortedValues.length - 1) {
    return sortedValues[index]
  } else {
    const avg = sortedValues[index].plus(sortedValues[index + 1]).div(2)

    return options.roundingMode ? avg.integerValue(options.roundingMode) : avg
  }
}
