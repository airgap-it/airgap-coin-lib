import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALECompactInt } from '../../../scale/type/SCALECompactInt'
import { SCALEInt } from '../../../scale/type/SCALEInt'
import { SCALEType } from '../../../scale/type/SCALEType'
import { MetadataV14Component } from '../MetadataV14Component'

import { MetadataV14SignedExtension } from './MetadataV14SignedExtension'

export class MetadataV14Exstrinsic extends MetadataV14Component {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14Exstrinsic> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const type = decoder.decodeNextCompactInt()
    const version = decoder.decodeNextInt(8)
    const signedExtensions = decoder.decodeNextArray(MetadataV14SignedExtension.decode)

    return {
      bytesDecoded: type.bytesDecoded + version.bytesDecoded + signedExtensions.bytesDecoded,
      decoded: new MetadataV14Exstrinsic(type.decoded, version.decoded, signedExtensions.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.type, this.version, this.signedExtensions]

  private constructor(
    type: SCALECompactInt,
    readonly version: SCALEInt,
    readonly signedExtensions: SCALEArray<MetadataV14SignedExtension>
  ) {
    super(type)
  }
}
