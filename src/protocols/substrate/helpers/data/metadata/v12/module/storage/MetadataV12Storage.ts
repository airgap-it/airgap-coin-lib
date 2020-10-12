import { stripHexPrefix } from '../../../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEString } from '../../../../scale/type/SCALEString'

import { MetadataV12StorageEntry } from './MetadataV12StorageEntry'

export class MetadataV12Storage extends SCALEClass {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<MetadataV12Storage> {
    const decoder = new SCALEDecoder(network, stripHexPrefix(raw))

    const prefix = decoder.decodeNextString()
    const storageEntries = decoder.decodeNextArray(MetadataV12StorageEntry.decode)

    return {
      bytesDecoded: prefix.bytesDecoded + storageEntries.bytesDecoded,
      decoded: new MetadataV12Storage(prefix.decoded, storageEntries.decoded)
    }
  }

  protected scaleFields = [this.prefix]

  private constructor(readonly prefix: SCALEString, readonly storageEntries: SCALEArray<MetadataV12StorageEntry>) {
    super()
  }
}
