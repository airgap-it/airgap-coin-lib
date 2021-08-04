import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEString } from '../../../scale/type/SCALEString'

export class MetadataV11Event extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network, 
    runtimeVersion: number | undefined, 
    raw: string
  ): SCALEDecodeResult<MetadataV11Event> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const args = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))
    const docs = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + args.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV11Event(name.decoded, args.decoded, docs.decoded)
    }
  }

  public scaleFields = [this.name, this.args, this.docs]

  private constructor(readonly name: SCALEString, readonly args: SCALEArray<SCALEString>, readonly docs: SCALEArray<SCALEString>) {
    super()
  }
}
