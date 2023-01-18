import { SubstrateProtocolConfiguration } from '../../../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { MetadataV14Component } from '../MetadataV14Component'

export class MetadataV14Error extends MetadataV14Component {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14Error> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const type = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: type.bytesDecoded,
      decoded: new MetadataV14Error(type.decoded)
    }
  }
}
