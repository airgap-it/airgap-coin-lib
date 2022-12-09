import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALEEnum } from '../scale/type/SCALEEnum'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEEncodeConfig, SCALEType } from '../scale/type/SCALEType'

export enum SubstrateSignatureType {
  Ed25519 = 0,
  Sr25519,
  Ecdsa
}

export const SUBSTRATE_SIGNATURE_SIZE: Record<SubstrateSignatureType, number> = {
  [SubstrateSignatureType.Ed25519]: 64 * 8,
  [SubstrateSignatureType.Sr25519]: 64 * 8,
  [SubstrateSignatureType.Ecdsa]: (32 * 2 + 1) * 8
}

export class SubstrateSignature extends SCALEClass {
  public static create(type: SubstrateSignatureType, signature?: string | Uint8Array | Buffer): SubstrateSignature {
    return new SubstrateSignature(
      SCALEEnum.from(type),
      signature ? SCALEHash.from(signature) : SCALEHash.empty(SUBSTRATE_SIGNATURE_SIZE[type])
    )
  }

  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<SubstrateSignature> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const type = configuration.signature?.fixedType
      ? { bytesDecoded: 0, decoded: SCALEEnum.from(configuration.signature.fixedType) }
      : decoder.decodeNextEnum((value) => SubstrateSignatureType[SubstrateSignatureType[value]])

    const signature = decoder.decodeNextHash(SUBSTRATE_SIGNATURE_SIZE[type.decoded.value])

    return {
      bytesDecoded: type.bytesDecoded + signature.bytesDecoded,
      decoded: new SubstrateSignature(type.decoded, signature.decoded)
    }
  }

  protected scaleFields = [this.type, this.signature]

  public get isSigned(): boolean {
    return !this.signature.isEmpty
  }

  private constructor(readonly type: SCALEEnum<SubstrateSignatureType>, readonly signature: SCALEHash) {
    super()
  }

  public encode(config?: SCALEEncodeConfig): string {
    if (config?.configuration?.signature?.fixedType === undefined) {
      return super.encode(config)
    }

    return [this.signature].reduce((encoded: string, current: SCALEType) => encoded + current.encode(config), '')
  }

  public toString(): string {
    return JSON.stringify(
      {
        type: SubstrateSignatureType[this.type.value],
        isSigned: this.isSigned,
        signature: this.signature.toString()
      },
      null,
      2
    )
  }
}
