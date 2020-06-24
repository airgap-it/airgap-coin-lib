import * as bigInt from '../../dependencies/src/big-integer-1.6.45/BigInteger'
import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'

import { MichelsonInt } from './contract/michelson/MichelsonInt'
import { MichelsonList } from './contract/michelson/MichelsonList'
import { MichelsonPair } from './contract/michelson/MichelsonPair'
import { MichelsonString } from './contract/michelson/MichelsonString'
import { MichelsonTypeMapping } from './contract/michelson/MichelsonTypeMapping'


export class TezosUtils {
  // Tezos - We need to wrap these in Buffer due to non-compatible browser polyfills
  private static readonly tezosPrefixes: {
    tz1: Buffer
    tz2: Buffer
    tz3: Buffer
    kt: Buffer
    edpk: Buffer
    edsk: Buffer
    edsig: Buffer
    branch: Buffer
  } = {
    tz1: Buffer.from(new Uint8Array([6, 161, 159])),
    tz2: Buffer.from(new Uint8Array([6, 161, 161])),
    tz3: Buffer.from(new Uint8Array([6, 161, 164])),
    kt: Buffer.from(new Uint8Array([2, 90, 121])),
    edpk: Buffer.from(new Uint8Array([13, 15, 37, 217])),
    edsk: Buffer.from(new Uint8Array([43, 246, 78, 7])),
    edsig: Buffer.from(new Uint8Array([9, 245, 205, 134, 18])),
    branch: Buffer.from(new Uint8Array([1, 52]))
  }

  public static parseAddress(rawHexAddress: string): string {
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const contractIdTag: string = result
    if (contractIdTag === '00') {
      // tz address
      return this.parseTzAddress(rest)
    } else if (contractIdTag === '01') {
      // kt address
      return this.prefixAndBase58CheckEncode(rest.slice(0, -2), this.tezosPrefixes.kt)
    } else {
      throw new Error('address format not supported')
    }
  }

  public static parseHex(rawHex: string | string[]): string | number | MichelsonTypeMapping {
    let hex: string[]
    if (typeof rawHex === 'string') {
      hex = TezosUtils.hexStringToArray(rawHex)
    } else {
      hex = rawHex
    }
    const type = hex.shift()
    switch (type) {
      case '07': // prim
        const primType = hex.shift()
        if (primType === '07') {
          // pair
          return TezosUtils.parsePair(hex)
        }
        throw new Error('Prim type not supported')
      case '00': // int
        const intBytes: string[] = []
        let byte: string | undefined
        do {
          byte = hex.shift()
          if (byte === undefined) {
            break
          }
          intBytes.push(byte)
        } while (parseInt(byte, 16) >= 127)

        return TezosUtils.decodeSignedInt(intBytes.join(''))
      case '01': // string
        const lengthBytes = TezosUtils.hexToLength(hex.splice(0, 4))

        return TezosUtils.hexToString(hex.splice(0, lengthBytes))
      case '05': // single arg prim
        return TezosUtils.parseHex(hex)
      case '02': // list
        return TezosUtils.parseList(hex)
      default:
        throw new Error('Type not supported')
    }
  }

  private static decodeSignedInt(hex: string): number {
    const positive = Buffer.from(hex.slice(0, 2), 'hex')[0] & 0x40 ? false : true
    const arr = Buffer.from(hex, 'hex').map((v, i) => (i === 0 ? v & 0x3f : v & 0x7f))
    let n = bigInt.zero
    for (let i = arr.length - 1; i >= 0; i--) {
      if (i === 0) {
        n = n.or(arr[i])
      } else {
        n = n.or(bigInt(arr[i]).shiftLeft(7 * i - 1))
      }
    }

    return positive ? n.toJSNumber() : n.negate().toJSNumber()
  }

  private static hexStringToArray(hexString: string): string[] {
    if (hexString.startsWith('0x')) {
      hexString = hexString.slice(2)
    }
    const hexBytes: RegExpMatchArray | null = hexString.match(/.{2}/g)
    if (hexBytes === null) {
      throw new Error('Cannot parse contract code')
    }

    return hexBytes
  }

  private static parsePair(hex: string[]): MichelsonPair {
    const first = TezosUtils.parseHex(hex)
    const second = TezosUtils.parseHex(hex)

    const mappingFunction = (value: string | number | MichelsonTypeMapping) => {
      if (typeof value === 'string') {
        return new MichelsonString(value)
      } else if (typeof value === 'number') {
        return new MichelsonInt(value)
      } else {
        return value
      }
    }

    return MichelsonPair.from([first, second], mappingFunction, mappingFunction)
  }

  private static parseList(hex: string[]): MichelsonList {
    const items: (string | number | MichelsonTypeMapping)[] = []
    const lengthBytes = TezosUtils.hexToLength(hex.splice(0, 4))
    if (lengthBytes > 0) {
      const listBytes = hex.splice(0, lengthBytes)
      while (listBytes.length > 0) {
        const item = TezosUtils.parseHex(listBytes)
        items.push(item)
      }
    }

    return MichelsonList.from(
      items, 
      (item: string | number | MichelsonTypeMapping) => {
        if (typeof item === 'string') {
          return new MichelsonString(item)
        } else if (typeof item === 'number') {
          return new MichelsonInt(item)
        } else {
          return item
        }
      }
    )
  }

  private static hexToString(hex: string[]): string {
    return hex.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('')
  }

  private static hexToLength(hex: string[]): number {
    const stringValue = hex.reduce((previous, next) => {
      if (next === '00') {
        return previous
      }

      return `${previous}${next}`
    }, '')

    if (stringValue.length > 0) {
      return parseInt(stringValue, 16)
    }

    return 0
  }

  private static splitAndReturnRest(payload: string, length: number): { result: string; rest: string } {
    const result: string = payload.substr(0, length)
    const rest: string = payload.substr(length, payload.length - length)

    return { result, rest }
  }

  private static parseTzAddress(rawHexAddress: string): string {
    // tz1 address
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const publicKeyHashTag: string = result
    if (publicKeyHashTag === '00') {
      return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.tz1)
    } else {
      throw new Error('address format not supported')
    }
  }

  private static prefixAndBase58CheckEncode(hexStringPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex: string = Buffer.from(tezosPrefix).toString('hex')

    return bs58check.encode(Buffer.from(prefixHex + hexStringPayload, 'hex'))
  }
}
