import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { stripHexPrefix, toHexStringRaw } from '@airgap/coinlib-core/utils/hex'
import { SubstrateProtocolConfiguration } from '../../../types/configuration'
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

  public static decode<T extends SCALEType, C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    hex: string,
    decodeValue: DecoderMethod<T, C>
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
        const value = decodeValue(configuration, runtimeVersion, _hex.slice(2))

        return {
          bytesDecoded: 1 + value.bytesDecoded,
          decoded: SCALEOptional.from(value.decoded)
        }
      default:
        throw new InvalidValueError(Domain.SUBSTRATE, 'SCALEOptional#decode: Unknown optional type')
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
