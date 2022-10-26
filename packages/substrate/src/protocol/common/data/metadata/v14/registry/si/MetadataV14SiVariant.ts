import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEInt } from '../../../../scale/type/SCALEInt'
import { SCALEString } from '../../../../scale/type/SCALEString'
import { SCALEType } from '../../../../scale/type/SCALEType'

import { MetadataV14SiField } from './MetadataV14SiField'

export class MetadataV14SiVariant extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiVariant> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const fields = decoder.decodeNextArray(MetadataV14SiField.decode)
    const index = decoder.decodeNextInt(8)
    const docs = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + fields.bytesDecoded + index.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV14SiVariant(name.decoded, fields.decoded, index.decoded, docs.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.name, this.fields, this.index, this.docs]

  private constructor(
    readonly name: SCALEString,
    readonly fields: SCALEArray<MetadataV14SiField>,
    readonly index: SCALEInt,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
