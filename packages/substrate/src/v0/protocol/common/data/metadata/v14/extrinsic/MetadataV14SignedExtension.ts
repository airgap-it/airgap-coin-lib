import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALECompactInt } from '../../../scale/type/SCALECompactInt'
import { SCALEString } from '../../../scale/type/SCALEString'
import { SCALEType } from '../../../scale/type/SCALEType'
import { MetadataV14Component } from '../MetadataV14Component'

export class MetadataV14SignedExtension extends MetadataV14Component {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SignedExtension> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const identifier = decoder.decodeNextString()
    const type = decoder.decodeNextCompactInt()
    const additionalSigned = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: identifier.bytesDecoded + type.bytesDecoded + additionalSigned.bytesDecoded,
      decoded: new MetadataV14SignedExtension(identifier.decoded, type.decoded, additionalSigned.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.identifier, this.type, this.additionalSigned]

  private constructor(readonly identifier: SCALEString, type: SCALECompactInt, readonly additionalSigned: SCALECompactInt) {
    super(type)
  }
}
