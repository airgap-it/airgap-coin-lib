import { stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { SubstrateProtocolConfiguration } from '../../../../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEString } from '../../../../scale/type/SCALEString'

import { MetadataV13StorageEntry } from './MetadataV13StorageEntry'

export class MetadataV13Storage extends SCALEClass {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13Storage> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, stripHexPrefix(raw))

    const prefix = decoder.decodeNextString()
    const storageEntries = decoder.decodeNextArray(MetadataV13StorageEntry.decode)

    return {
      bytesDecoded: prefix.bytesDecoded + storageEntries.bytesDecoded,
      decoded: new MetadataV13Storage(prefix.decoded, storageEntries.decoded)
    }
  }

  protected scaleFields = [this.prefix]

  private constructor(readonly prefix: SCALEString, readonly storageEntries: SCALEArray<MetadataV13StorageEntry>) {
    super()
  }
}
