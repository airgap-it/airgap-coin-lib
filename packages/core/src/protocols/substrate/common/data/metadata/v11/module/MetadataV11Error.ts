import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEString } from '../../../scale/type/SCALEString'

export class MetadataV11Error extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network, 
    runtimeVersion: number | undefined, 
    raw: string
  ): SCALEDecodeResult<MetadataV11Error> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const docs = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV11Error(name.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.docs]

  private constructor(readonly name: SCALEString, readonly docs: SCALEArray<SCALEString>) {
    super()
  }
}
