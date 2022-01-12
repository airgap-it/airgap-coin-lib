import { SCALEDecoder, SCALEDecodeResult } from '../../../common/data/scale/SCALEDecoder'
import { SCALEAccountId } from '../../../common/data/scale/type/SCALEAccountId'
import { SCALEClass } from '../../../common/data/scale/type/SCALEClass'
import { SCALEEnum } from '../../../common/data/scale/type/SCALEEnum'
import { SCALEInt } from '../../../common/data/scale/type/SCALEInt'
import { SCALEType } from '../../../common/data/scale/type/SCALEType'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export enum MoonbeamDelegationChange {
  REVOKE = 0,
  DECREASE
}

export class MoonbeamDelegationRequest extends SCALEClass {
  public static decode(runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<MoonbeamDelegationRequest> {
    const decoder = new SCALEDecoder(SubstrateNetwork.MOONBEAM, runtimeVersion, raw)

    const collator = decoder.decodeNextAccountId(20)
    const amount = decoder.decodeNextInt(128)
    const whenExecutable = decoder.decodeNextInt(32)
    const action = decoder.decodeNextEnum((value) => MoonbeamDelegationChange[MoonbeamDelegationChange[value]])

    return {
      bytesDecoded: collator.bytesDecoded + amount.bytesDecoded + whenExecutable.bytesDecoded + action.bytesDecoded,
      decoded: new MoonbeamDelegationRequest(collator.decoded, amount.decoded, whenExecutable.decoded, action.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.amount]

  private constructor(
    public readonly collator: SCALEAccountId<SubstrateNetwork.MOONBEAM>,
    public readonly amount: SCALEInt,
    public readonly whenExecutable: SCALEInt,
    public readonly action: SCALEEnum<MoonbeamDelegationChange>
  ) {
    super()
  }
}
