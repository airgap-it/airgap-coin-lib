import { stripHexPrefix } from '../../../../../utils/hex'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

import { SCALEAccountId } from './type/SCALEAccountId'
import { SCALEArray } from './type/SCALEArray'
import { SCALEBoolean } from './type/SCALEBoolean'
import { SCALEBytes } from './type/SCALEBytes'
import { SCALECompactInt } from './type/SCALECompactInt'
import { SCALEEnum } from './type/SCALEEnum'
import { SCALEEra } from './type/SCALEEra'
import { SCALEHash } from './type/SCALEHash'
import { SCALEInt } from './type/SCALEInt'
import { SCALEOptional } from './type/SCALEOptional'
import { SCALEString } from './type/SCALEString'
import { SCALETuple } from './type/SCALETuple'
import { SCALEType } from './type/SCALEType'

export type DecoderMethod<T> = (network: SubstrateNetwork, hex: string) => SCALEDecodeResult<T>
export type DecoderPartialMethod<T> = (hex: string) => SCALEDecodeResult<T>

export interface SCALEDecodeResult<T> {
  bytesDecoded: number
  decoded: T
}

export class SCALEDecoder {
  private hex: string

  constructor(private readonly network: SubstrateNetwork, bytes: string | Uint8Array | Buffer) {
    this.hex = typeof bytes === 'string' ? stripHexPrefix(bytes) : Buffer.from(bytes).toString('hex')
  }

  public decodeNextAccountId(): SCALEDecodeResult<SCALEAccountId> {
    return this.decodeNextValue(SCALEAccountId.decode)
  }

  public decodeNextArray<T extends SCALEType>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<SCALEArray<T>> {
    return this.decodeNextValue((network, hex) => SCALEArray.decode(network, hex, decoderMethod))
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
    return this.decodeNextValue((_, hex) => SCALEHash.decode(hex, bitLength))
  }

  public decodeNextInt(bitLength: number): SCALEDecodeResult<SCALEInt> {
    return this.decodeNextValue((_, hex) => SCALEInt.decode(hex, bitLength))
  }

  public decodeNextOptional<T extends SCALEType>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<SCALEOptional<T>> {
    return this.decodeNextValue((network, hex) => SCALEOptional.decode(network, hex, decoderMethod))
  }

  public decodeNextString(): SCALEDecodeResult<SCALEString> {
    return this.decodeNextValuePartial(SCALEString.decode)
  }

  public decodeNextTuple<T extends SCALEType, R extends SCALEType>(
    firstDecoderMethod: DecoderMethod<T>,
    secondDecoderMethod: DecoderMethod<R>
  ): SCALEDecodeResult<SCALETuple<T, R>> {
    return this.decodeNextValue((network, hex) => SCALETuple.decode(network, hex, firstDecoderMethod, secondDecoderMethod))
  }

  public decodeNextEnum<T>(getEnumValue: (value: number) => T | null): SCALEDecodeResult<SCALEEnum<T>> {
    return this.decodeNextValue((_, hex) => SCALEEnum.decode(hex, getEnumValue))
  }

  public decodeNextObject<T>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<T> {
    return this.decodeNextValue(decoderMethod)
  }

  private decodeNextValuePartial<T>(decoderPartialMethod: DecoderPartialMethod<T>, nibbleLength?: number): SCALEDecodeResult<T> {
    return this.decodeNextValue((_, hex) => decoderPartialMethod(hex), nibbleLength)
  }

  private decodeNextValue<T>(decoderMethod: DecoderMethod<T>, nibbleLength?: number): SCALEDecodeResult<T> {
    const decoded = decoderMethod(this.network, this.hex.substr(0, nibbleLength))
    this.moveCursor(decoded.bytesDecoded)

    return decoded
  }

  private moveCursor(bytes: number) {
    this.hex = this.hex.slice(bytes * 2)
  }
}
