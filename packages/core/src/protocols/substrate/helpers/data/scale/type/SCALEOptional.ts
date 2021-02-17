import { stripHexPrefix, toHexStringRaw } from '../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { DecoderMethod, SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export enum SCALEOptionalType {
  None = 0,
  Some
}

export class SCALEOptional<T extends SCALEType> extends SCALEType {
  public static empty<T extends SCALEType>(): SCALEOptional<T> {
    return new SCALEOptional<T>(undefined)
  }

  public static from<T extends SCALEType>(value: T): SCALEOptional<T> {
    return new SCALEOptional(value)
  }

  public static decode<T extends SCALEType>(
    network: SubstrateNetwork,
    runtimeVersion: number | undefined,
    hex: string,
    decodeValue: DecoderMethod<T>
  ): SCALEDecodeResult<SCALEOptional<T>> {
    const _hex = stripHexPrefix(hex)

    const prefix = parseInt(_hex.substr(0, 2), 16)
    switch (prefix) {
      case SCALEOptionalType.None:
        return {
          bytesDecoded: 1,
          decoded: SCALEOptional.empty()
        }
      case SCALEOptionalType.Some:
        const value = decodeValue(network, runtimeVersion, _hex.slice(2))

        return {
          bytesDecoded: 1 + value.bytesDecoded,
          decoded: SCALEOptional.from(value.decoded)
        }
      default:
        throw new Error('SCALEOptional#decode: Unknown optional type')
    }
  }

  private readonly type: SCALEOptionalType

  private constructor(readonly value: T | undefined) {
    super()
    this.type = value ? 1 : 0
  }

  public toString(): string {
    return `Optional<${this.value?.toString() || 'EMPTY'}>`
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    return toHexStringRaw(this.type, 2) + (this.value?.encode(config) || '')
  }
}
