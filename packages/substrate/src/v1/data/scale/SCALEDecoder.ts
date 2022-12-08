import { stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { scaleAddressFactory, TypedSCALEAddress } from '../account/address/SubstrateAddressFactory'

import { SCALEAccountId } from './type/SCALEAccountId'
import { SCALEArray } from './type/SCALEArray'
import { SCALEBoolean } from './type/SCALEBoolean'
import { SCALEBytes } from './type/SCALEBytes'
import { SCALECompactInt } from './type/SCALECompactInt'
import { SCALEData } from './type/SCALEData'
import { SCALEEnum } from './type/SCALEEnum'
import { SCALEEra } from './type/SCALEEra'
import { SCALEHash } from './type/SCALEHash'
import { SCALEInt } from './type/SCALEInt'
import { SCALEMultiAddress, SCALEMultiAddressType } from './type/SCALEMultiAddress'
import { SCALEOptional } from './type/SCALEOptional'
import { SCALEString } from './type/SCALEString'
import { SCALETuple } from './type/SCALETuple'
import { SCALEType } from './type/SCALEType'

export type DecoderMethod<T, C extends SubstrateProtocolConfiguration> = (
  configuration: C,
  runtimeVersion: number | undefined,
  hex: string
) => SCALEDecodeResult<T>
export type DecoderPartialMethod<T> = (hex: string) => SCALEDecodeResult<T>

export interface SCALEDecodeResult<T> {
  bytesDecoded: number
  decoded: T
}

export class SCALEDecoder<C extends SubstrateProtocolConfiguration> {
  private hex: string

  constructor(private readonly configuration: C, private readonly runtimeVersion: number | undefined, bytes: string | Uint8Array | Buffer) {
    this.hex = typeof bytes === 'string' ? stripHexPrefix(bytes) : Buffer.from(bytes).toString('hex')
  }

  public decodeNextAccount(): SCALEDecodeResult<TypedSCALEAddress<C>> {
    return this.decodeNextValue((configuration, runtimeVersion, hex) =>
      scaleAddressFactory(this.configuration).decode(configuration, runtimeVersion, hex)
    )
  }

  public decodeNextAccountId(byteLength: number = 32): SCALEDecodeResult<SCALEAccountId<C>> {
    return this.decodeNextValue((configuration, _, hex) => SCALEAccountId.decode(configuration, hex, byteLength))
  }

  public decodeNextArray<T extends SCALEType>(decoderMethod: DecoderMethod<T, C>): SCALEDecodeResult<SCALEArray<T>> {
    return this.decodeNextValue((configuration, runtimeVersion, hex) =>
      SCALEArray.decode(configuration, runtimeVersion, hex, decoderMethod)
    )
  }

  public decodeNextBoolean(): SCALEDecodeResult<SCALEBoolean> {
    return this.decodeNextValuePartial(SCALEBoolean.decode)
  }

  public decodeNextBytes(): SCALEDecodeResult<SCALEBytes> {
    return this.decodeNextValuePartial(SCALEBytes.decode)
  }

  public decodeNextCompactInt(): SCALEDecodeResult<SCALECompactInt> {
    return this.decodeNextValuePartial(SCALECompactInt.decode)
  }

  public decodeNextEra(): SCALEDecodeResult<SCALEEra> {
    return this.decodeNextValuePartial(SCALEEra.decode)
  }

  public decodeNextHash(bitLength: number): SCALEDecodeResult<SCALEHash> {
    return this.decodeNextValue((_configuration, _runtimeVersion, hex) => SCALEHash.decode(hex, bitLength))
  }

  public decodeNextInt(bitLength: number): SCALEDecodeResult<SCALEInt> {
    return this.decodeNextValue((_configuration, _runtimeVersion, hex) => SCALEInt.decode(hex, bitLength))
  }

  public decodeNextMultiAccount<T extends SCALEMultiAddressType>(type?: T): SCALEDecodeResult<SCALEMultiAddress<T, C>> {
    return this.decodeNextValue((configuration, runtimeVersion, hex) => SCALEMultiAddress.decode(configuration, hex, type, runtimeVersion))
  }

  public decodeNextOptional<T extends SCALEType>(decoderMethod: DecoderMethod<T, C>): SCALEDecodeResult<SCALEOptional<T>> {
    return this.decodeNextValue((configuration, runtimeVersion, hex) =>
      SCALEOptional.decode(configuration, runtimeVersion, hex, decoderMethod)
    )
  }

  public decodeNextString(): SCALEDecodeResult<SCALEString> {
    return this.decodeNextValuePartial(SCALEString.decode)
  }

  public decodeNextTuple<T extends SCALEType, R extends SCALEType>(
    firstDecoderMethod: DecoderMethod<T, C>,
    secondDecoderMethod: DecoderMethod<R, C>
  ): SCALEDecodeResult<SCALETuple<T, R>> {
    return this.decodeNextValue((configuration, runtimeVersion, hex) =>
      SCALETuple.decode(configuration, runtimeVersion, hex, firstDecoderMethod, secondDecoderMethod)
    )
  }

  public decodeNextEnum<T>(getEnumValue: (value: number) => T | null): SCALEDecodeResult<SCALEEnum<T>> {
    return this.decodeNextValue((_configuration, _runtimeVersion, hex) => SCALEEnum.decode(hex, getEnumValue))
  }

  public decodeNextData(): SCALEDecodeResult<SCALEData> {
    return this.decodeNextValue((_configuration, _runtimeVersion, hex) => SCALEData.decode(hex))
  }

  public decodeNextObject<T>(decoderMethod: DecoderMethod<T, C>): SCALEDecodeResult<T> {
    return this.decodeNextValue(decoderMethod)
  }

  private decodeNextValuePartial<T>(decoderPartialMethod: DecoderPartialMethod<T>, nibbleLength?: number): SCALEDecodeResult<T> {
    return this.decodeNextValue((_configuration, _runtimeVersion, hex) => decoderPartialMethod(hex), nibbleLength)
  }

  private decodeNextValue<T>(decoderMethod: DecoderMethod<T, C>, nibbleLength?: number): SCALEDecodeResult<T> {
    const decoded = decoderMethod(this.configuration, this.runtimeVersion, this.hex.substr(0, nibbleLength))
    this.moveCursor(decoded.bytesDecoded)

    return decoded
  }

  private moveCursor(bytes: number) {
    this.hex = this.hex.slice(bytes * 2)
  }
}
