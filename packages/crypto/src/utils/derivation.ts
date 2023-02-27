import { DerivationIndex } from '../types/derivation'

const MASK_HARD_DERIVATION: number = 0x80000000
const MASK_SOFT_DERIVATION: number = 0x00000000

export function createDerivationIndexFromNumber(value: number, isHardened: boolean): DerivationIndex {
  const mask: number = isHardened ? MASK_HARD_DERIVATION : MASK_SOFT_DERIVATION

  return {
    value,
    // tslint:disable-next-line: no-bitwise
    masked: parseInt((BigInt(mask) | BigInt(value)).toString(), 10),
    isHardened
  }
}

export function createDerivationIndexFromString(value: string): DerivationIndex {
  const isHardened: boolean = ['h', `'`].includes(value.slice(-1))
  const index: number = parseInt(isHardened ? value.slice(0, -1) : value, 10)

  return createDerivationIndexFromNumber(index, isHardened)
}

export function splitDerivationPath(path: string): DerivationIndex[] {
  if (path.length === 0 || !path.startsWith('m/') || path === 'm/') {
    return []
  }

  return path.slice(2).split('/').map(createDerivationIndexFromString)
}

export function incIndex(current: DerivationIndex): DerivationIndex {
  return createDerivationIndexFromNumber(current.value + 1, current.isHardened)
}
