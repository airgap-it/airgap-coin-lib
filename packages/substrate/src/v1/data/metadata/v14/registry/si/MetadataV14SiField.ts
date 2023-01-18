import { SubstrateProtocolConfiguration } from '../../../../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALECompactInt } from '../../../../scale/type/SCALECompactInt'
import { SCALEOptional } from '../../../../scale/type/SCALEOptional'
import { SCALEString } from '../../../../scale/type/SCALEString'
import { SCALEType } from '../../../../scale/type/SCALEType'

export class MetadataV14SiField extends SCALEClass {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiField> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const name = decoder.decodeNextOptional((_configuration, _runtimeVersion, hex) => SCALEString.decode(hex))
    const type = decoder.decodeNextCompactInt()
    const typeName = decoder.decodeNextOptional((_configuration, _runtimeVersion, hex) => SCALEString.decode(hex))
    const docs = decoder.decodeNextArray((_configuration, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + type.bytesDecoded + typeName.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV14SiField(name.decoded, type.decoded, typeName.decoded, docs.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.name, this.type, this.typeName, this.docs]

  private constructor(
    readonly name: SCALEOptional<SCALEString>,
    readonly type: SCALECompactInt,
    readonly typeName: SCALEOptional<SCALEString>,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
