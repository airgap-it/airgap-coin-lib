import { gzip, ungzip } from 'pako'

const cbor = require('cbor-sync')

import * as bs58check from '../dependencies/src/bs58check-2.1.2/index'

import { IACMessageDefinitionObjectV3, isMessageDefinitionArray, MessageDefinitionArray } from './message'
import { Payload } from './payload'

export type IACMessageWrapperVersion = number
export type IACMessageWrapperArray = [IACMessageWrapperVersion, Payload]
export type IACMessageWrapperArrayEncoded = [IACMessageWrapperVersion, MessageDefinitionArray[]]

const SERIALIZER_VERSION = 3

export class IACMessageWrapper {
  public readonly version: number = SERIALIZER_VERSION
  public payload: Payload

  constructor(data: Payload) {
    this.payload = data
  }

  public decoded(): IACMessageWrapperArray {
    return [this.version, this.payload]
  }

  public encoded(): string {
    const arr: IACMessageWrapperArrayEncoded = [this.version, this.payload.asArray()]

    const buffer: Buffer = cbor.encode(arr)

    console.log(buffer.toString('hex'))

    const deflated: Uint8Array = gzip(buffer)

    return bs58check.encode(Buffer.from(deflated))
  }

  public static fromDecoded(data: IACMessageDefinitionObjectV3[]): IACMessageWrapper {
    const payload: Payload = Payload.fromDecoded(data)

    return new IACMessageWrapper(payload)
  }

  public static fromEncoded(data: string): IACMessageWrapper {
    const buffer: Buffer = bs58check.decode(data)

    const inflated: Uint8Array = ungzip(buffer)

    const decoded: IACMessageWrapperArrayEncoded = cbor.decode(Buffer.from(inflated))

    if (parseInt(decoded[0].toString(), 10) !== SERIALIZER_VERSION) {
      throw new Error('Unsupported version')
    }

    if (decoded[1].some((el) => !isMessageDefinitionArray(el))) {
      throw new Error('Decoded message has wrong format')
    }

    const payload: MessageDefinitionArray[] = decoded[1]

    const finalPayload: Payload = Payload.fromEncoded(payload)

    return new IACMessageWrapper(finalPayload)
  }
}
