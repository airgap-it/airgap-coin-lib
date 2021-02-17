import { stripHexPrefix } from '../../../../../utils/hex'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

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

export type DecoderMethod<T> = (network: SubstrateNetwork, runtimeVersion: number | undefined, hex: string) => SCALEDecodeResult<T>
export type DecoderPartialMethod<T> = (hex: string) => SCALEDecodeResult<T>

export interface SCALEDecodeResult<T> {
  bytesDecoded: number
  decoded: T
}

export class SCALEDecoder {
  private hex: string

  constructor(
    private readonly network: SubstrateNetwork,
    private readonly runtimeVersion: number | undefined,
    bytes: string | Uint8Array | Buffer
  ) {
    this.hex = typeof bytes === 'string' ? stripHexPrefix(bytes) : Buffer.from(bytes).toString('hex')
  }

  public decodeNextAccountId(): SCALEDecodeResult<SCALEAccountId> {
    return this.decodeNextValue((network, _, hex) => SCALEAccountId.decode(network, hex))
  }

  public decodeNextArray<T extends SCALEType>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<SCALEArray<T>> {
    return this.decodeNextValue((network, runtimeVersion, hex) => SCALEArray.decode(network, runtimeVersion, hex, decoderMethod))
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
    return this.decodeNextValue((_network, _runtimeVersion, hex) => SCALEHash.decode(hex, bitLength))
  }

  public decodeNextInt(bitLength: number): SCALEDecodeResult<SCALEInt> {
    return this.decodeNextValue((_network, _runtimeVersion, hex) => SCALEInt.decode(hex, bitLength))
  }

  public decodeNextMultiAccount<T extends SCALEMultiAddressType>(type?: T): SCALEDecodeResult<SCALEMultiAddress<T>> {
    return this.decodeNextValue((network, runtimeVersion, hex) => SCALEMultiAddress.decode(network, hex, type, runtimeVersion))
  }

  public decodeNextOptional<T extends SCALEType>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<SCALEOptional<T>> {
    return this.decodeNextValue((network, runtimeVersion, hex) => SCALEOptional.decode(network, runtimeVersion, hex, decoderMethod))
  }

  public decodeNextString(): SCALEDecodeResult<SCALEString> {
    return this.decodeNextValuePartial(SCALEString.decode)
  }

  public decodeNextTuple<T extends SCALEType, R extends SCALEType>(
    firstDecoderMethod: DecoderMethod<T>,
    secondDecoderMethod: DecoderMethod<R>
  ): SCALEDecodeResult<SCALETuple<T, R>> {
    return this.decodeNextValue((network, runtimeVersion, hex) =>
      SCALETuple.decode(network, runtimeVersion, hex, firstDecoderMethod, secondDecoderMethod)
    )
  }

  public decodeNextEnum<T>(getEnumValue: (value: number) => T | null): SCALEDecodeResult<SCALEEnum<T>> {
    return this.decodeNextValue((_network, _runtimeVersion, hex) => SCALEEnum.decode(hex, getEnumValue))
  }

  public decodeNextData(): SCALEDecodeResult<SCALEData> {
    return this.decodeNextValue((_network, _runtimeVersion, hex) => SCALEData.decode(hex))
  }

  public decodeNextObject<T>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<T> {
    return this.decodeNextValue(decoderMethod)
  }

  private decodeNextValuePartial<T>(decoderPartialMethod: DecoderPartialMethod<T>, nibbleLength?: number): SCALEDecodeResult<T> {
    return this.decodeNextValue((_network, _runtimeVersion, hex) => decoderPartialMethod(hex), nibbleLength)
  }

  private decodeNextValue<T>(decoderMethod: DecoderMethod<T>, nibbleLength?: number): SCALEDecodeResult<T> {
    const decoded = decoderMethod(this.network, this.runtimeVersion, this.hex.substr(0, nibbleLength))
    this.moveCursor(decoded.bytesDecoded)

    return decoded
  }

  private moveCursor(bytes: number) {
    this.hex = this.hex.slice(bytes * 2)
  }
}
