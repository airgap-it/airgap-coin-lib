// tslint:disable: max-classes-per-file
import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEString } from '../../../scale/type/SCALEString'

class MetadataV12CallArgument extends SCALEClass {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<MetadataV12CallArgument> {
    const decoder = new SCALEDecoder(network, raw)

    const name = decoder.decodeNextString()
    const type = decoder.decodeNextString()

    return {
      bytesDecoded: name.bytesDecoded + type.bytesDecoded,
      decoded: new MetadataV12CallArgument(name.decoded, type.decoded)
    }
  }

  protected scaleFields = [this.name, this.type]

  private constructor(readonly name: SCALEString, readonly type: SCALEString) {
    super()
  }
}

export class MetadataV12Call extends SCALEClass {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<MetadataV12Call> {
    const decoder = new SCALEDecoder(network, raw)

    const name = decoder.decodeNextString()
    const args = decoder.decodeNextArray(MetadataV12CallArgument.decode)
    const docs = decoder.decodeNextArray((_, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + args.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV12Call(name.decoded, args.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.args]

  private constructor(readonly name: SCALEString, readonly args: SCALEArray<MetadataV12CallArgument>, readonly docs: SCALEArray<SCALEString>) {
    super()
  }
}
