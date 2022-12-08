import { SubstrateProtocolConfiguration } from '../../../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEBytes } from '../../../scale/type/SCALEBytes'
import { SCALECompactInt } from '../../../scale/type/SCALECompactInt'
import { SCALEString } from '../../../scale/type/SCALEString'
import { MetadataV14Component } from '../MetadataV14Component'

export class MetadataV14Constant extends MetadataV14Component {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14Constant> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const type = decoder.decodeNextCompactInt()
    const value = decoder.decodeNextBytes()
    const docs = decoder.decodeNextArray((_configuration, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + type.bytesDecoded + value.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV14Constant(name.decoded, type.decoded, value.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.type, this.value, this.docs]

  private constructor(
    readonly name: SCALEString,
    type: SCALECompactInt,
    readonly value: SCALEBytes,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super(type)
  }
}
