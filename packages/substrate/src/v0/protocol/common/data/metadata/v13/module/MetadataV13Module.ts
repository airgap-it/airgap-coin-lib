import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEInt } from '../../../scale/type/SCALEInt'
import { SCALEOptional } from '../../../scale/type/SCALEOptional'
import { SCALEString } from '../../../scale/type/SCALEString'
import { SCALEType } from '../../../scale/type/SCALEType'
import { MetadataV11Call } from '../../v11/module/MetadataV11Call'
import { MetadataV11Constant } from '../../v11/module/MetadataV11Constant'
import { MetadataV11Error } from '../../v11/module/MetadataV11Error'
import { MetadataV11Event } from '../../v11/module/MetadataV11Event'

import { MetadataV13Storage } from './storage/MetadataV13Storage'

export class MetadataV13Module extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13Module> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const storage = decoder.decodeNextOptional(MetadataV13Storage.decode)
    const calls = decoder.decodeNextOptional((network, runtimeVersion, hex) =>
      SCALEArray.decode(network, runtimeVersion, hex, MetadataV11Call.decode)
    )
    const events = decoder.decodeNextOptional((network, runtimeVersion, hex) =>
      SCALEArray.decode(network, runtimeVersion, hex, MetadataV11Event.decode)
    )
    const constants = decoder.decodeNextArray(MetadataV11Constant.decode)
    const errors = decoder.decodeNextArray(MetadataV11Error.decode)
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
      decoded: new MetadataV13Module(
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

  protected scaleFields: SCALEType[] = [this.name, this.storage, this.calls, this.events, this.constants, this.errors, this.index]

  protected constructor(
    public readonly name: SCALEString,
    public readonly storage: SCALEOptional<MetadataV13Storage>,
    public readonly calls: SCALEOptional<SCALEArray<MetadataV11Call>>,
    public readonly events: SCALEOptional<SCALEArray<MetadataV11Event>>,
    public readonly constants: SCALEArray<MetadataV11Constant>,
    public readonly errors: SCALEArray<MetadataV11Error>,
    public readonly index: SCALEInt
  ) {
    super()
  }
}
