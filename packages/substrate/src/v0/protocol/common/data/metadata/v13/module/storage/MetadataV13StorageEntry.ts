import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEBytes } from '../../../../scale/type/SCALEBytes'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEEnum } from '../../../../scale/type/SCALEEnum'
import { SCALEString } from '../../../../scale/type/SCALEString'

import { MetadataV13StorageEntryType } from './MetadataV13StorageEntryType'

enum StorageEntryModifier {
  Optional = 0,
  Default
}

export class MetadataV13StorageEntry extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13StorageEntry> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const modifier = decoder.decodeNextEnum((value) => StorageEntryModifier[StorageEntryModifier[value]])
    const type = decoder.decodeNextObject(MetadataV13StorageEntryType.decode)
    const fallback = decoder.decodeNextBytes()
    const docs = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + modifier.bytesDecoded + type.bytesDecoded + fallback.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV13StorageEntry(name.decoded, modifier.decoded, type.decoded, fallback.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.modifier, this.type, this.fallback]

  private constructor(
    readonly name: SCALEString,
    readonly modifier: SCALEEnum<StorageEntryModifier>,
    readonly type: MetadataV13StorageEntryType,
    readonly fallback: SCALEBytes,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
