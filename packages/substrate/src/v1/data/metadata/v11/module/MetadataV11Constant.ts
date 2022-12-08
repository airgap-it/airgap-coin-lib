import { SubstrateProtocolConfiguration } from '../../../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEBytes } from '../../../scale/type/SCALEBytes'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEString } from '../../../scale/type/SCALEString'

export class MetadataV11Constant extends SCALEClass {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11Constant> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const type = decoder.decodeNextString()
    const value = decoder.decodeNextBytes()
    const docs = decoder.decodeNextArray((_configuration, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + type.bytesDecoded + value.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV11Constant(name.decoded, type.decoded, value.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.type, this.value, this.docs]

  private constructor(
    readonly name: SCALEString,
    readonly type: SCALEString,
    readonly value: SCALEBytes,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
