import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEInt } from '../../../scale/type/SCALEInt'
import { SCALEOptional } from '../../../scale/type/SCALEOptional'
import { SCALEString } from '../../../scale/type/SCALEString'

import { MetadataV12Call } from './MetadataV12Call'
import { MetadataV12Constant } from './MetadataV12Constants'
import { MetadataV12Error } from './MetadataV12Error'
import { MetadataV12Event } from './MetadataV12Event'
import { MetadataV12Storage } from './storage/MetadataV12Storage'

export class MetadataV12Module extends SCALEClass {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<MetadataV12Module> {
    const decoder = new SCALEDecoder(network, raw)

    const name = decoder.decodeNextString()
    const storage = decoder.decodeNextOptional(MetadataV12Storage.decode)
    const calls = decoder.decodeNextOptional((network, hex) => SCALEArray.decode(network, hex, MetadataV12Call.decode))
    const events = decoder.decodeNextOptional((network, hex) => SCALEArray.decode(network, hex, MetadataV12Event.decode))
    const constants = decoder.decodeNextArray(MetadataV12Constant.decode)
    const errors = decoder.decodeNextArray(MetadataV12Error.decode)
    const index = decoder.decodeNextInt(8)

    return {
      bytesDecoded:
        name.bytesDecoded + 
        storage.bytesDecoded + 
        calls.bytesDecoded + 
        events.bytesDecoded + 
        constants.bytesDecoded + 
        errors.bytesDecoded +
        index.bytesDecoded,
      decoded: new MetadataV12Module(
        name.decoded, 
        storage.decoded, 
        calls.decoded, 
        events.decoded, 
        constants.decoded, 
        errors.decoded, 
        index.decoded
      )
    }
  }

  protected scaleFields = [this.name, this.storage, this.calls, this.events, this.constants, this.errors]

  private constructor(
    readonly name: SCALEString,
    readonly storage: SCALEOptional<MetadataV12Storage>,
    readonly calls: SCALEOptional<SCALEArray<MetadataV12Call>>,
    readonly events: SCALEOptional<SCALEArray<MetadataV12Event>>,
    readonly constants: SCALEArray<MetadataV12Constant>,
    readonly errors: SCALEArray<MetadataV12Error>,
    readonly index: SCALEInt
  ) {
    super()
  }
}
