import { stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { SubstrateProtocolConfiguration } from '../../../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALECompactInt } from '../../../scale/type/SCALECompactInt'
import { SCALEType } from '../../../scale/type/SCALEType'

import { MetadataV14SiType } from './si/MetadataV14SiType'

export class MetadataV14PortableType extends SCALEClass {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14PortableType> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, stripHexPrefix(raw))

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
