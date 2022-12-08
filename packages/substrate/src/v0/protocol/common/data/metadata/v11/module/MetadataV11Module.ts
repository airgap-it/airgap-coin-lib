import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEOptional } from '../../../scale/type/SCALEOptional'
import { SCALEString } from '../../../scale/type/SCALEString'
import { SCALEType } from '../../../scale/type/SCALEType'

import { MetadataV11Call } from './MetadataV11Call'
import { MetadataV11Constant } from './MetadataV11Constant'
import { MetadataV11Error } from './MetadataV11Error'
import { MetadataV11Event } from './MetadataV11Event'
import { MetadataV11Storage } from './storage/MetadataV11Storage'

export class MetadataV11Module extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11Module> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const storage = decoder.decodeNextOptional(MetadataV11Storage.decode)
    const calls = decoder.decodeNextOptional((network, runtimeVersion, hex) =>
      SCALEArray.decode(network, runtimeVersion, hex, MetadataV11Call.decode)
    )
    const events = decoder.decodeNextOptional((network, runtimeVersion, hex) =>
      SCALEArray.decode(network, runtimeVersion, hex, MetadataV11Event.decode)
    )
    const constants = decoder.decodeNextArray(MetadataV11Constant.decode)
    const errors = decoder.decodeNextArray(MetadataV11Error.decode)

    return {
      bytesDecoded:
        name.bytesDecoded + storage.bytesDecoded + calls.bytesDecoded + events.bytesDecoded + constants.bytesDecoded + errors.bytesDecoded,
      decoded: new MetadataV11Module(name.decoded, storage.decoded, calls.decoded, events.decoded, constants.decoded, errors.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.name, this.storage, this.calls, this.events, this.constants, this.errors]

  protected constructor(
    readonly name: SCALEString,
    readonly storage: SCALEOptional<MetadataV11Storage>,
    readonly calls: SCALEOptional<SCALEArray<MetadataV11Call>>,
    readonly events: SCALEOptional<SCALEArray<MetadataV11Event>>,
    readonly constants: SCALEArray<MetadataV11Constant>,
    readonly errors: SCALEArray<MetadataV11Error>
  ) {
    super()
  }
}
