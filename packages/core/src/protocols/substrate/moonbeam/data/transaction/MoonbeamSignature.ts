import { SCALEDecoder, SCALEDecodeResult } from '../../../common/data/scale/SCALEDecoder'
import { SCALEEnum } from '../../../common/data/scale/type/SCALEEnum'
import { SCALEHash } from '../../../common/data/scale/type/SCALEHash'
import { SUBSTRATE_SIGNATURE_SIZE, SubstrateSignature, SubstrateSignatureType } from '../../../common/data/transaction/SubstrateSignature'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export class MoonbeamSignature extends SubstrateSignature {
  public static create(
    type: SubstrateSignatureType = SubstrateSignatureType.Ecdsa,
    signature?: string | Uint8Array | Buffer
  ): MoonbeamSignature {
    return new MoonbeamSignature(
      SCALEEnum.from(type),
      signature ? SCALEHash.from(signature) : SCALEHash.empty(SUBSTRATE_SIGNATURE_SIZE[type])
    )
  }

  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<SubstrateSignature> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const type = SubstrateSignatureType.Ecdsa
    const signature = decoder.decodeNextHash(SUBSTRATE_SIGNATURE_SIZE[type])

    return {
      bytesDecoded: signature.bytesDecoded,
      decoded: new MoonbeamSignature(SCALEEnum.from(type), signature.decoded)
    }
  }

  protected scaleFields = [this.signature]
}
