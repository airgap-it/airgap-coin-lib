import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALEClass } from '../../scale/type/SCALEClass'
import { SCALEOptional } from '../../scale/type/SCALEOptional'
import { SCALEString } from '../../scale/type/SCALEString'

import { MetadataCall } from './MetadataCall'
import { MetadataConstant } from './MetadataConstants'
import { MetadataError } from './MetadataError'
import { MetadataEvent } from './MetadataEvent'
import { MetadataStorage } from './storage/MetadataStorage'

export class MetadataModule extends SCALEClass {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<MetadataModule> {
    const decoder = new SCALEDecoder(network, raw)

    const name = decoder.decodeNextString()
    const storage = decoder.decodeNextOptional(MetadataStorage.decode)
    const calls = decoder.decodeNextOptional((network, hex) => SCALEArray.decode(network, hex, MetadataCall.decode))
    const events = decoder.decodeNextOptional((network, hex) => SCALEArray.decode(network, hex, MetadataEvent.decode))
    const constants = decoder.decodeNextArray(MetadataConstant.decode)
    const errors = decoder.decodeNextArray(MetadataError.decode)

    return {
      bytesDecoded:
        name.bytesDecoded + storage.bytesDecoded + calls.bytesDecoded + events.bytesDecoded + constants.bytesDecoded + errors.bytesDecoded,
      decoded: new MetadataModule(name.decoded, storage.decoded, calls.decoded, events.decoded, constants.decoded, errors.decoded)
    }
  }

  protected scaleFields = [this.name, this.storage, this.calls, this.events, this.constants, this.errors]

  private constructor(
    readonly name: SCALEString,
    readonly storage: SCALEOptional<MetadataStorage>,
    readonly calls: SCALEOptional<SCALEArray<MetadataCall>>,
    readonly events: SCALEOptional<SCALEArray<MetadataEvent>>,
    readonly constants: SCALEArray<MetadataConstant>,
    readonly errors: SCALEArray<MetadataError>
  ) {
    super()
  }
}
