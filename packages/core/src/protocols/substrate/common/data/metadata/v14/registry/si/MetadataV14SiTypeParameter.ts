import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALECompactInt } from '../../../../scale/type/SCALECompactInt'
import { SCALEOptional } from '../../../../scale/type/SCALEOptional'
import { SCALEString } from '../../../../scale/type/SCALEString'
import { SCALEType } from '../../../../scale/type/SCALEType'

export class MetadataV14SiTypeParameter extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiTypeParameter> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()
    const type = decoder.decodeNextOptional((_network, _runtimeVersion, hex) => SCALECompactInt.decode(hex))

    return {
      bytesDecoded: name.bytesDecoded + type.bytesDecoded,
      decoded: new MetadataV14SiTypeParameter(name.decoded, type.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.name, this.type]

  private constructor(readonly name: SCALEString, readonly type: SCALEOptional<SCALECompactInt>) {
    super()
  }
}
