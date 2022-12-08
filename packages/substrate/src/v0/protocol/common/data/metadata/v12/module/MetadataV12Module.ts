import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEInt } from '../../../scale/type/SCALEInt'
import { SCALEOptional } from '../../../scale/type/SCALEOptional'
import { SCALEString } from '../../../scale/type/SCALEString'
import { SCALEType } from '../../../scale/type/SCALEType'
import { MetadataV11Call } from '../../v11/module/MetadataV11Call'
import { MetadataV11Constant } from '../../v11/module/MetadataV11Constant'
import { MetadataV11Error } from '../../v11/module/MetadataV11Error'
import { MetadataV11Event } from '../../v11/module/MetadataV11Event'
import { MetadataV11Module } from '../../v11/module/MetadataV11Module'
import { MetadataV11Storage } from '../../v11/module/storage/MetadataV11Storage'

export class MetadataV12Module extends MetadataV11Module {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV12Module> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const v11 = decoder.decodeNextObject(MetadataV11Module.decode)
    const index = decoder.decodeNextInt(8)

    return {
      bytesDecoded: v11.bytesDecoded + index.bytesDecoded,
      decoded: new MetadataV12Module(
        v11.decoded.name,
        v11.decoded.storage,
        v11.decoded.calls,
        v11.decoded.events,
        v11.decoded.constants,
        v11.decoded.errors,
        index.decoded
      )
    }
  }

  protected scaleFields: SCALEType[] = [this.name, this.storage, this.calls, this.events, this.constants, this.errors, this.index]

  protected constructor(
    name: SCALEString,
    storage: SCALEOptional<MetadataV11Storage>,
    calls: SCALEOptional<SCALEArray<MetadataV11Call>>,
    events: SCALEOptional<SCALEArray<MetadataV11Event>>,
    constants: SCALEArray<MetadataV11Constant>,
    errors: SCALEArray<MetadataV11Error>,
    readonly index: SCALEInt
  ) {
    super(name, storage, calls, events, constants, errors)
  }
}
