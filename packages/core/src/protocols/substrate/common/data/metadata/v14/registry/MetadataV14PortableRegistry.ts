import { stripHexPrefix } from '../../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEType } from '../../../scale/type/SCALEType'

import { MetadataV14PortableType } from './MetadataV14PortableType'

export class MetadataV14PortableRegistry extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14PortableRegistry> {
    const decoder = new SCALEDecoder(network, runtimeVersion, stripHexPrefix(raw))

    const types = decoder.decodeNextArray(MetadataV14PortableType.decode)

    return {
      bytesDecoded: types.bytesDecoded,
      decoded: new MetadataV14PortableRegistry(types.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.types]

  private typesRecord: Record<string, MetadataV14PortableType> | undefined

  private constructor(readonly types: SCALEArray<MetadataV14PortableType>) {
    super()
  }

  public get(id: string): MetadataV14PortableType | undefined {
    return this.getTypesRecord()[id]
  }

  private getTypesRecord(): Record<string, MetadataV14PortableType> {
    if (!this.typesRecord) {
      this.typesRecord = this.types.elements.reduce(
        (obj: Record<string, MetadataV14PortableType>, next: MetadataV14PortableType) => Object.assign(obj, { [next.id.toString()]: next }),
        {}
      )
    }

    return this.typesRecord
  }
}
