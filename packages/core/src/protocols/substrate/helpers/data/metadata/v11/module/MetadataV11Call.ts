// tslint:disable: max-classes-per-file
import { SubstrateNetwork } from '../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEString } from '../../../scale/type/SCALEString'

class MetadataV11CallArgument extends SCALEClass {
  public static decode(
    network: SubstrateNetwork,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11CallArgument> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const type = decoder.decodeNextString()

    return {
      bytesDecoded: name.bytesDecoded + type.bytesDecoded,
      decoded: new MetadataV11CallArgument(name.decoded, type.decoded)
    }
  }

  protected scaleFields = [this.name, this.type]

  private constructor(readonly name: SCALEString, readonly type: SCALEString) {
    super()
  }
}

export class MetadataV11Call extends SCALEClass {
  public static decode(network: SubstrateNetwork, runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<MetadataV11Call> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const args = decoder.decodeNextArray(MetadataV11CallArgument.decode)
    const docs = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + args.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataV11Call(name.decoded, args.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.args]

  private constructor(
    readonly name: SCALEString,
    readonly args: SCALEArray<MetadataV11CallArgument>,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
