import { BigNumber } from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
// var _ = require('underscore')
// var BN = require('@airgap/coinlib-core/dependencies/src/bn.js-4.11.8/bn')
// var numberToBN = require('number-to-bn')
const utf8 = require('@airgap/coinlib-core/dependencies/src/utf8-3.0.0/utf8')
const createKeccakHash = require('@airgap/coinlib-core/dependencies/src/keccak-1.0.2/js')

// this code was adapted from web3.js (https://github.com/ethereum/web3.js/blob/2.x/packages/web3-utils/src/Utils.js)
export class EthereumUtils {
  public static toHex(value: any): string {
    if (EthereumUtils.isAddress(value)) {
      return `0x${value.toLowerCase().replace(/^0x/i, '')}`
    }

    if (typeof value === 'boolean') {
      return value ? '0x01' : '0x00'
    }

    if (EthereumUtils.isObject(value) && !EthereumUtils.isBigNumber(value) /* && !EthereumUtils.isBN(value)*/) {
      return EthereumUtils.utf8ToHex(JSON.stringify(value))
    }

    // if its a negative number, pass it through numberToHex
    if (typeof value === 'string') {
      if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
        return EthereumUtils.numberToHex(value)
      } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
        return value
      } else if (!isFinite(Number(value))) {
        return EthereumUtils.utf8ToHex(value)
      }
    }

    return EthereumUtils.numberToHex(value)
  }

  private static readonly SHA3_NULL_S: string = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

  public static sha3(value: any): string | null {
    let valueInBytes: string | number[] = value
    if (EthereumUtils.isHexStrict(value) && /^0x/i.test(value.toString())) {
      valueInBytes = EthereumUtils.hexToBytes(value)
    }

    const hash: string = createKeccakHash('keccak256').update(valueInBytes).digest('hex')
    const returnValue: string = `0x${hash}`

    if (returnValue === EthereumUtils.SHA3_NULL_S) {
      return null
    } else {
      return returnValue
    }
  }

  private static numberToHex(value: string | number): string {
    if (value === null || value === undefined) {
      return value
    }

    if (!isFinite(Number(value)) && !EthereumUtils.isHexStrict(value)) {
      throw new InvalidValueError(Domain.UTILS, `Given input "${JSON.stringify(value)}" is not a number.`)
    }

    // var number = EthereumUtils.toBN(value)
    const myNumber: BigNumber = new BigNumber(value)
    const result: string = myNumber.toString(16)

    return myNumber.lt(new BigNumber(0)) ? `-0x${result.substr(1)}` : `0x${result}`
  }

  private static hexToBytes(value: string | number): number[] {
    let hex: string = typeof value === 'number' ? value.toString(16) : value

    if (!EthereumUtils.isHexStrict(hex)) {
      throw new InvalidValueError(Domain.UTILS, `Given value "${JSON.stringify(hex)}" is not a valid hex string.`)
    }

    hex = hex.replace(/^0x/i, '')

    const bytes: number[] = []
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16))
    }

    return bytes
  }

  private static isHexStrict(hex: unknown): boolean {
    return (typeof hex === 'string' || typeof hex === 'number') && /^(-)?0x[0-9a-f]*$/i.test(hex.toString())
  }

  private static checkAddressChecksum(value: string): boolean {
    const address: string = value.replace(/^0x/i, '')
    let addressHash: string | null = EthereumUtils.sha3(address.toLowerCase())

    if (addressHash === null) {
      return false
    }

    addressHash = addressHash.replace(/^0x/i, '')

    for (let i: number = 0; i < 40; i++) {
      if (
        (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
        (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])
      ) {
        return false
      }
    }

    return true
  }

  private static isAddress(value: string): boolean {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(value)) {
      return false
      // If it's ALL lowercase or ALL upppercase
    } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(value) || /^(0x|0X)?[0-9A-F]{40}$/.test(value)) {
      return true
      // Otherwise check each case
    } else {
      return EthereumUtils.checkAddressChecksum(value)
    }
  }

  private static isBigNumber(value: unknown): boolean {
    if (!value) {
      return false
    } else {
      return BigNumber.isBigNumber(value)
    }
  }

  private static utf8ToHex(value: string): string {
    let str: string = utf8.encode(value)
    let hex: string = ''

    // remove \u0000 padding from either side
    str = str.replace(/^(?:\u0000)*/, '')
    str = str.split('').reverse().join('')
    str = str.replace(/^(?:\u0000)*/, '')
    str = str.split('').reverse().join('')

    for (let i = 0; i < str.length; i++) {
      const code: number = str.charCodeAt(i)
      const n: string = code.toString(16)
      hex += n.length < 2 ? `0${n}` : n
    }

    return `0x${hex}`
  }

  private static isObject(value: unknown): boolean {
    const type: string = typeof value

    return type === 'function' || (type === 'object' && !!value)
  }
}
