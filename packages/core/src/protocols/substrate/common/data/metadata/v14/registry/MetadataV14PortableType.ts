import { stripHexPrefix } from '../../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALECompactInt } from '../../../scale/type/SCALECompactInt'
import { SCALEType } from '../../../scale/type/SCALEType'

import { MetadataV14SiType } from './si/MetadataV14SiType'

export class MetadataV14PortableType extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14PortableType> {
    const decoder = new SCALEDecoder(network, runtimeVersion, stripHexPrefix(raw))

    const id = decoder.decodeNextCompactInt()
    const type = decoder.decodeNextObject(MetadataV14SiType.decode)

    return {
      bytesDecoded: id.bytesDecoded + type.bytesDecoded,
      decoded: new MetadataV14PortableType(id.decoded, type.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.id, this.type]

  private constructor(readonly id: SCALECompactInt, readonly type: MetadataV14SiType) {
    super()
  }
}
