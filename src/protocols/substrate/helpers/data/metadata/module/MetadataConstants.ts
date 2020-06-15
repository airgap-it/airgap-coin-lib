import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALEBytes } from '../../scale/type/SCALEBytes'
import { SCALEClass } from '../../scale/type/SCALEClass'
import { SCALEString } from '../../scale/type/SCALEString'

export class MetadataConstant extends SCALEClass {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<MetadataConstant> {
    const decoder = new SCALEDecoder(network, raw)

    const name = decoder.decodeNextString()
    const type = decoder.decodeNextString()
    const value = decoder.decodeNextBytes()
    const docs = decoder.decodeNextArray((_, hex) => SCALEString.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + type.bytesDecoded + value.bytesDecoded + docs.bytesDecoded,
      decoded: new MetadataConstant(name.decoded, type.decoded, value.decoded, docs.decoded)
    }
  }

  protected scaleFields = [this.name, this.type, this.value, this.docs]

  private constructor(
    readonly name: SCALEString,
    readonly type: SCALEString,
    readonly value: SCALEBytes,
    readonly docs: SCALEArray<SCALEString>
  ) {
    super()
  }
}
