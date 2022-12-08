import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEInt } from '../../../scale/type/SCALEInt'
import { SCALEOptional } from '../../../scale/type/SCALEOptional'
import { SCALEString } from '../../../scale/type/SCALEString'
import { SCALEType } from '../../../scale/type/SCALEType'

import { MetadataV14Call } from './MetadataV14Call'
import { MetadataV14Constant } from './MetadataV14Constant'
import { MetadataV14Error } from './MetadataV14Error'
import { MetadataV14Event } from './MetadataV14Event'
import { MetadataV14Storage } from './storage/MetadataV14Storage'

export class MetadataV14Pallet extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14Pallet> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const storage = decoder.decodeNextOptional(MetadataV14Storage.decode)
    const calls = decoder.decodeNextOptional(MetadataV14Call.decode)
    const events = decoder.decodeNextOptional(MetadataV14Event.decode)
    const constants = decoder.decodeNextArray(MetadataV14Constant.decode)
    const errors = decoder.decodeNextOptional(MetadataV14Error.decode)
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
      decoded: new MetadataV14Pallet(
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
    public readonly storage: SCALEOptional<MetadataV14Storage>,
    public readonly calls: SCALEOptional<MetadataV14Call>,
    public readonly events: SCALEOptional<MetadataV14Event>,
    public readonly constants: SCALEArray<MetadataV14Constant>,
    public readonly errors: SCALEOptional<MetadataV14Error>,
    public readonly index: SCALEInt
  ) {
    super()
  }
}
