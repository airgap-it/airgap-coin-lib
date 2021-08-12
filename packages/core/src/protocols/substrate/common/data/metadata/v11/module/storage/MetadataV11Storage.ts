import { stripHexPrefix } from '../../../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEString } from '../../../../scale/type/SCALEString'

import { MetadataV11StorageEntry } from './MetadataV11StorageEntry'

export class MetadataV11Storage extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11Storage> {
    const decoder = new SCALEDecoder(network, runtimeVersion, stripHexPrefix(raw))

    const prefix = decoder.decodeNextString()
    const storageEntries = decoder.decodeNextArray(MetadataV11StorageEntry.decode)

    return {
      bytesDecoded: prefix.bytesDecoded + storageEntries.bytesDecoded,
      decoded: new MetadataV11Storage(prefix.decoded, storageEntries.decoded)
    }
  }

  protected scaleFields = [this.prefix]

  private constructor(readonly prefix: SCALEString, readonly storageEntries: SCALEArray<MetadataV11StorageEntry>) {
    super()
  }
}
