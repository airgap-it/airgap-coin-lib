import { BigNumber } from 'bignumber.js'

// var _ = require('underscore')
// var BN = require('bn.js')
// var numberToBN = require('number-to-bn')
var utf8 = require('utf8')
var Hash = require('eth-lib/lib/hash')

// this code was adapted from web3.js (https://github.com/ethereum/web3.js/blob/2.x/packages/web3-utils/src/Utils.js)
export class EthereumUtils {
  public static toHex(value: any): string {
    if (EthereumUtils.isAddress(value)) {
      return '0x' + value.toLowerCase().replace(/^0x/i, '')
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

  private static SHA3_NULL_S = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
  public static sha3(value: any): string | null {
    if (EthereumUtils.isHexStrict(value) && /^0x/i.test(value.toString())) {
      value = EthereumUtils.hexToBytes(value)
    }

    var returnValue = Hash.keccak256(value) // jshint ignore:line

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
      throw new Error('Given input "' + value + '" is not a number.')
    }

    // var number = EthereumUtils.toBN(value)
    var number = new BigNumber(value)
    var result = number.toString(16)

    return number.lt(new BigNumber(0)) ? '-0x' + result.substr(1) : '0x' + result
  }

  private static hexToBytes(hex: string | number): number[] {
    if (typeof hex === 'number') {
      hex = hex.toString(16)
    }

    if (!EthereumUtils.isHexStrict(hex)) {
      throw new Error('Given value "' + hex + '" is not a valid hex string.')
    }

    hex = hex.replace(/^0x/i, '')

    let bytes: number[] = []
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
  }

  private static isHexStrict(hex: any): boolean {
    return (typeof hex === 'string' || typeof hex === 'number') && /^(-)?0x[0-9a-f]*$/i.test(hex.toString())
  }

  private static checkAddressChecksum(address: string) {
    address = address.replace(/^0x/i, '')
    var addressHash = EthereumUtils.sha3(address.toLowerCase())

    if (addressHash === null) {
      return false
    }

    addressHash = addressHash.replace(/^0x/i, '')

    for (var i = 0; i < 40; i++) {
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

  private static isBigNumber(value: any): boolean {
    return value && value.constructor && value.constructor.name === 'BigNumber'
  }

  private static utf8ToHex(value: string): string {
    let str = utf8.encode(value)
    let hex = ''

    // remove \u0000 padding from either side
    str = str.replace(/^(?:\u0000)*/, '')
    str = str
      .split('')
      .reverse()
      .join('')
    str = str.replace(/^(?:\u0000)*/, '')
    str = str
      .split('')
      .reverse()
      .join('')

    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i)
      var n = code.toString(16)
      hex += n.length < 2 ? '0' + n : n
    }

    return '0x' + hex
  }

  private static isObject(value: any): boolean {
    var type = typeof value
    return type === 'function' || (type === 'object' && !!value)
  }
}
