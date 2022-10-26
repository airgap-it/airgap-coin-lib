import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEString } from '../../../../scale/type/SCALEString'
import { SCALEType } from '../../../../scale/type/SCALEType'

import { MetadataV14SiTypeParameter } from './MetadataV14SiTypeParameter'
import { MetadataV14SiTypeDef } from './MetadataV14TypeDef'

export class MetadataV14SiType extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiType> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const path = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))
    const params = decoder.decodeNextArray(MetadataV14SiTypeParameter.decode)
    const def = decoder.decodeNextObject(MetadataV14SiTypeDef.decode)
    const docs = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: path.bytesDecoded + params.bytesDecoded + def.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV14SiType(path.decoded, params.decoded, def.decoded, docs.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.path, this.params, this.def, this.docs]

  private constructor(
    readonly path: SCALEArray<SCALEString>,
    readonly params: SCALEArray<MetadataV14SiTypeParameter>,
    readonly def: MetadataV14SiTypeDef,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
