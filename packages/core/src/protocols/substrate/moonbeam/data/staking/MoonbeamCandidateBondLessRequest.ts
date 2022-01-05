import { SCALEDecoder, SCALEDecodeResult } from '../../../common/data/scale/SCALEDecoder'
import { SCALEClass } from '../../../common/data/scale/type/SCALEClass'
import { SCALEInt } from '../../../common/data/scale/type/SCALEInt'
import { SCALEType } from '../../../common/data/scale/type/SCALEType'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export class MoonbeamCandidateBondLessRequest extends SCALEClass {
  public static decode(runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<MoonbeamCandidateBondLessRequest> {
    const decoder = new SCALEDecoder(SubstrateNetwork.MOONBEAM, runtimeVersion, raw)

    const amount = decoder.decodeNextInt(128)
    const whenExecutable = decoder.decodeNextInt(32)

    return {
      bytesDecoded: amount.bytesDecoded + whenExecutable.bytesDecoded,
      decoded: new MoonbeamCandidateBondLessRequest(amount.decoded, whenExecutable.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.amount]

  private constructor(public readonly amount: SCALEInt, public readonly whenExecutable: SCALEInt) {
    super()
  }
}
