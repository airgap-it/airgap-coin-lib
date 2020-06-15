import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEBytes } from '../../../scale/type/SCALEBytes'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEEnum } from '../../../scale/type/SCALEEnum'
import { SCALEString } from '../../../scale/type/SCALEString'

import { MetadataStorageEntryType } from './MetadataStorageEntryType'

enum StorageEntryModifier {
  Optional = 0,
  Default
}

export class MetadataStorageEntry extends SCALEClass {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<MetadataStorageEntry> {
    const decoder = new SCALEDecoder(network, raw)

    const name = decoder.decodeNextString()
    const modifier = decoder.decodeNextEnum((value) => StorageEntryModifier[StorageEntryModifier[value]])
    const type = decoder.decodeNextObject(MetadataStorageEntryType.decode)
    const defaultValue = decoder.decodeNextBytes()
    const docs = decoder.decodeNextArray((_, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + modifier.bytesDecoded + type.bytesDecoded + defaultValue.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataStorageEntry(name.decoded, modifier.decoded, type.decoded, defaultValue.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.modifier, this.type, this.defaultValue]

  private constructor(
    readonly name: SCALEString,
    readonly modifier: SCALEEnum<StorageEntryModifier>,
    readonly type: MetadataStorageEntryType,
    readonly defaultValue: SCALEBytes,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
