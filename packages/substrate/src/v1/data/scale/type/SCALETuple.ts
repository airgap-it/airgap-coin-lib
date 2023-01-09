import { stripHexPrefix } from '@airgap/coinlib-core/utils/hex'

import { SubstrateProtocolConfiguration } from '../../../types/configuration'
import { DecoderMethod, SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export class SCALETuple<T extends SCALEType, R extends SCALEType> extends SCALEType {
  public static from<T extends SCALEType, R extends SCALEType>(first: T, second: R): SCALETuple<T, R>
  public static from<T extends SCALEType, R extends SCALEType>(tuple: [T, R]): SCALETuple<T, R>
  public static from<T extends SCALEType, R extends SCALEType>(firstParamOrTuple: T | [T, R], secondParam?: R): SCALETuple<T, R> {
    const tuple: [T, R] = secondParam !== undefined ? [firstParamOrTuple as T, secondParam] : (firstParamOrTuple as [T, R])

    return new SCALETuple(tuple[0], tuple[1])
  }

  public static decode<T extends SCALEType, R extends SCALEType, C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    hex: string,
    decodeFirst: DecoderMethod<T, C>,
    decodeSecond: DecoderMethod<R, C>
  ): SCALEDecodeResult<SCALETuple<T, R>> {
    const _hex = stripHexPrefix(hex)

    const first = decodeFirst(configuration, runtimeVersion, _hex)
    const second = decodeSecond(configuration, runtimeVersion, _hex.slice(first.bytesDecoded * 2))

    return {
      bytesDecoded: first.bytesDecoded + second.bytesDecoded,
      decoded: SCALETuple.from(first.decoded, second.decoded)
    }
  }

  private constructor(readonly first: T, readonly second: R) {
    super()
  }

  public toString(): string {
    return `(${this.first.toString()}, ${this.second.toString()})`
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    return this.first.encode(config) + this.second.encode(config)
  }
}
