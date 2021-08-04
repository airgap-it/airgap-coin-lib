import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALEEnum } from '../scale/type/SCALEEnum'
import { SCALEHash } from '../scale/type/SCALEHash'

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
      SCALEEnum.from(type), signature ? SCALEHash.from(signature) : SCALEHash.empty(SUBSTRATE_SIGNATURE_SIZE[type])
    )
  }

  public static decode<Network extends SubstrateNetwork>(
    network: Network, 
    runtimeVersion: number | undefined, 
    raw: string
  ): SCALEDecodeResult<SubstrateSignature> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const type = decoder.decodeNextEnum((value) => SubstrateSignatureType[SubstrateSignatureType[value]])
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

  protected constructor(readonly type: SCALEEnum<SubstrateSignatureType>, readonly signature: SCALEHash) {
    super()
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
