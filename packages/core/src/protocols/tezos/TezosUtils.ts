import * as sodium from 'libsodium-wrappers'

import * as bigInt from '../../dependencies/src/big-integer-1.6.45/BigInteger'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import { OperationFailedError, UnsupportedError } from '../../errors'
import { Domain } from '../../errors/coinlib-error'
import { stripHexPrefix } from '../../utils/hex'
import { TezosNetwork } from './TezosProtocol'

import { MichelsonList } from './types/michelson/generics/MichelsonList'
import { MichelsonPair } from './types/michelson/generics/MichelsonPair'
import { MichelsonType } from './types/michelson/MichelsonType'
import { MichelsonTypeUtils } from './types/michelson/MichelsonTypeUtils'
import { MichelsonBytes } from './types/michelson/primitives/MichelsonBytes'
import { MichelsonInt } from './types/michelson/primitives/MichelsonInt'
import { MichelsonString } from './types/michelson/primitives/MichelsonString'

export class TezosUtils {
  // Tezos - We need to wrap these in Buffer due to non-compatible browser polyfills
  public static readonly tezosPrefixes: {
    tz1: Buffer
    tz2: Buffer
    tz3: Buffer
    kt: Buffer
    edpk: Buffer
    edsk: Buffer
    edsig: Buffer
    branch: Buffer
    sask: Buffer
    zet1: Buffer
    expr: Buffer
  } = {
    tz1: Buffer.from(new Uint8Array([6, 161, 159])),
    tz2: Buffer.from(new Uint8Array([6, 161, 161])),
    tz3: Buffer.from(new Uint8Array([6, 161, 164])),
    kt: Buffer.from(new Uint8Array([2, 90, 121])),
    edpk: Buffer.from(new Uint8Array([13, 15, 37, 217])),
    edsk: Buffer.from(new Uint8Array([43, 246, 78, 7])),
    edsig: Buffer.from(new Uint8Array([9, 245, 205, 134, 18])),
    branch: Buffer.from(new Uint8Array([1, 52])),
    sask: Buffer.from(new Uint8Array([11, 237, 20, 92])),
    zet1: Buffer.from(new Uint8Array([18, 71, 40, 223])),
    expr: Buffer.from(new Uint8Array([13, 44, 64, 27]))
  }

  public static readonly watermark: {
    block: string
    endorsement: string
    operation: string
    message: string
  } = {
    block: '01',
    endorsement: '02',
    operation: '03',
    message: '05'
  }

  public static parseAddress(bytes: string | Buffer): string {
    let rawHexAddress: string = typeof bytes === 'string' ? bytes : bytes.toString('hex')

    if (rawHexAddress.startsWith('0x')) {
      rawHexAddress = rawHexAddress.slice(2)
    }
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const contractIdTag: string = result
    if (contractIdTag === '00') {
      // tz address
      return this.parseTzAddress(rest)
    } else if (contractIdTag === '01') {
      // kt address
      return this.prefixAndBase58CheckEncode(rest.slice(0, -2), this.tezosPrefixes.kt)
    } else {
      throw new UnsupportedError(Domain.TEZOS, `address format not supported (${rawHexAddress})`)
    }
  }

  public static encodeAddress(address: string): Buffer {
    if (address.startsWith('tz')) {
      // tz address
      return Buffer.concat([Buffer.from([0]), this.encodeTzAddress(address)])
    } else if (address.startsWith('KT')) {
      // kt address
      return Buffer.concat([Buffer.from([1]), this.prefixAndBase58CheckDecode(address, this.tezosPrefixes.kt)])
    } else {
      throw new Error(`address format not supported (${address})`)
    }
  }

  public static packMichelsonType(type: MichelsonType): string {
    return `${TezosUtils.watermark.message}${type.encode()}`
  }

  public static parseHex(rawHex: string | string[]): MichelsonType {
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
        if (primType === MichelsonTypeUtils.primPrefixes.pair.toString('hex')) {
          return TezosUtils.parsePair(hex)
        }
        throw new UnsupportedError(Domain.TEZOS, 'Prim type not supported')
      case MichelsonTypeUtils.literalPrefixes.int.toString('hex'):
        const intBytes: string[] = []
        let byte: string | undefined
        do {
          byte = hex.shift()
          if (byte === undefined) {
            break
          }
          intBytes.push(byte)
        } while (parseInt(byte, 16) >= 127)

        return MichelsonInt.from(TezosUtils.decodeSignedInt(intBytes.join('')))
      case MichelsonTypeUtils.literalPrefixes.string.toString('hex'):
        const stringLength = TezosUtils.hexToLength(hex.splice(0, 4))

        return MichelsonString.from(TezosUtils.hexToString(hex.splice(0, stringLength)))
      case '05': // single arg prim
        return TezosUtils.parseHex(hex)
      case MichelsonTypeUtils.sequencePrefixes.list.toString('hex'):
        return TezosUtils.parseList(hex)
      case MichelsonTypeUtils.literalPrefixes.bytes.toString('hex'):
        const bytesLength = TezosUtils.hexToLength(hex.splice(0, 4))

        return MichelsonBytes.from(hex.splice(0, bytesLength).join(''))
      default:
        throw new UnsupportedError(Domain.TEZOS, `Type not supported ${type}`)
    }
  }

  public static async encodeExpr(value: MichelsonType): Promise<string> {
    await sodium.ready

    const packed: Buffer = Buffer.from(TezosUtils.packMichelsonType(value), 'hex')
    const hash: Uint8Array = sodium.crypto_generichash(32, packed)

    return bs58check.encode(Buffer.concat([TezosUtils.tezosPrefixes.expr, Buffer.from(hash)]))
  }

  public static resolveNetwork(network: string): TezosNetwork | undefined {
    const knownNetworks: string[] = Object.values(TezosNetwork)
    return knownNetworks.includes(network) ? (network as TezosNetwork) : undefined
  }

  private static decodeSignedInt(hex: string): BigNumber {
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

    return new BigNumber(positive ? n.toString() : n.negate().toString())
  }

  private static hexStringToArray(hexString: string): string[] {
    const hexBytes: RegExpMatchArray | null = stripHexPrefix(hexString).match(/.{2}/g)
    if (hexBytes === null) {
      throw new OperationFailedError(Domain.TEZOS, 'Cannot parse contract code')
    }

    return hexBytes
  }

  private static parsePair(hex: string[]): MichelsonPair {
    const first = TezosUtils.parseHex(hex)
    const second = TezosUtils.parseHex(hex)

    return MichelsonPair.from([first, second])
  }

  private static parseList(hex: string[]): MichelsonList {
    const items: MichelsonType[] = []
    const lengthBytes = TezosUtils.hexToLength(hex.splice(0, 4))
    if (lengthBytes > 0) {
      const listBytes = hex.splice(0, lengthBytes)
      while (listBytes.length > 0) {
        const item = TezosUtils.parseHex(listBytes)
        items.push(item)
      }
    }

    return MichelsonList.from(items)
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

  public static parseTzAddress(bytes: string | Buffer): string {
    const rawHexAddress: string = typeof bytes === 'string' ? bytes : bytes.toString('hex')

    // tz1 address
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const publicKeyHashTag: string = result
    switch (publicKeyHashTag) {
      case '00':
        return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.tz1)
      case '01':
        return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.tz2)
      case '02':
        return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.tz3)
      default:
        throw new UnsupportedError(Domain.TEZOS, `address format not supported (${rawHexAddress})`)
    }
  }

  private static encodeTzAddress(address: string): Buffer {
    if (address.startsWith('tz1')) {
      return Buffer.concat([Buffer.from([0]), this.prefixAndBase58CheckDecode(address, this.tezosPrefixes.tz1)])
    } else if (address.startsWith('tz2')) {
      return Buffer.concat([Buffer.from([1]), this.prefixAndBase58CheckDecode(address, this.tezosPrefixes.tz2)])
    } else if (address.startsWith('tz3')) {
      return Buffer.concat([Buffer.from([2]), this.prefixAndBase58CheckDecode(address, this.tezosPrefixes.tz3)])
    } else {
      throw new Error(`address format not supported (${address})`)
    }
  }

  private static prefixAndBase58CheckEncode(hexStringPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex: string = Buffer.from(tezosPrefix).toString('hex')

    return bs58check.encode(Buffer.from(prefixHex + hexStringPayload, 'hex'))
  }

  private static prefixAndBase58CheckDecode(address: string, tezosPrefix: Uint8Array): Buffer {
    const decoded: Buffer = bs58check.decode(address)

    return decoded.slice(tezosPrefix.length)
  }
}
