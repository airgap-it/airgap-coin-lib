import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { decode, encode } from '@airgap/coinlib-core/dependencies/src/cbor-sync-1.0.4/index'
import { gzip, ungzip } from '@airgap/coinlib-core/dependencies/src/pako-2.0.3'

import { IACMessageDefinitionObjectV3, isMessageDefinitionArray, MessageDefinitionArray } from './message'
import { Payload } from './payload'
import { SerializerV3 } from './serializer'

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

  public encoded(serializer: SerializerV3 = SerializerV3.getInstance()): string {
    const arr: IACMessageWrapperArrayEncoded = [this.version, this.payload.asArray(serializer)]

    const buffer: Buffer = encode(arr)

    console.log(buffer.toString('hex'))

    const deflated: Uint8Array = gzip(buffer)

    return bs58check.encode(Buffer.from(deflated))
  }

  public static fromDecoded(data: IACMessageDefinitionObjectV3[]): IACMessageWrapper {
    const payload: Payload = Payload.fromDecoded(data)

    return new IACMessageWrapper(payload)
  }

  public static fromEncoded(data: string, serializer: SerializerV3 = SerializerV3.getInstance()): IACMessageWrapper {
    const buffer: Buffer = bs58check.decode(data)

    const inflated: Uint8Array = ungzip(buffer)

    const decoded: IACMessageWrapperArrayEncoded = decode(Buffer.from(inflated))

    if (parseInt(decoded[0].toString(), 10) !== SERIALIZER_VERSION) {
      throw new Error('Unsupported version')
    }

    if (decoded[1].some((el) => !isMessageDefinitionArray(el))) {
      throw new Error('Decoded message has wrong format')
    }

    const payload: MessageDefinitionArray[] = decoded[1]

    const finalPayload: Payload = Payload.fromEncoded(payload, serializer)

    return new IACMessageWrapper(finalPayload)
  }
}
