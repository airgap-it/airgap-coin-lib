import { SCALEDecoder } from '../../../common/data/scale/SCALEDecoder'
import { SCALEAccountId } from '../../../common/data/scale/type/SCALEAccountId'
import { SCALEArray } from '../../../common/data/scale/type/SCALEArray'
import { SCALEEnum } from '../../../common/data/scale/type/SCALEEnum'
import { SCALEInt } from '../../../common/data/scale/type/SCALEInt'
import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { MoonbeamBond } from './MoonbeamBond'

export enum MoonbeamNominatorStatus {
  ACTIVE = 0,
  LEAVING
}

export class MoonbeamNominator {
  public static decode(runtimeVersion: number | undefined, raw: string): MoonbeamNominator {
    const decoder = new SCALEDecoder(SubstrateNetwork.MOONBEAM, runtimeVersion, raw)

    const nominations = decoder.decodeNextArray((_, runtimeVersion, hex) => MoonbeamBond.decode(runtimeVersion, hex))
    const revocations = decoder.decodeNextArray((network, _, hex) => SCALEAccountId.decode(network, hex, 20))
    const total = decoder.decodeNextInt(128)
    const scheduledRevocationsCount = decoder.decodeNextInt(32)
    const scheduledRevocationsTotal = decoder.decodeNextInt(128)
    const status = decoder.decodeNextEnum((value) => MoonbeamNominatorStatus[MoonbeamNominatorStatus[value]])

    return new MoonbeamNominator(
      nominations.decoded,
      revocations.decoded,
      total.decoded,
      scheduledRevocationsCount.decoded,
      scheduledRevocationsTotal.decoded,
      status.decoded
    )
  }

  private constructor(
    public readonly nominations: SCALEArray<MoonbeamBond>,
    public readonly revocations: SCALEArray<SCALEAccountId<SubstrateNetwork.MOONBEAM>>,
    public readonly total: SCALEInt,
    public readonly scheduledRevocationsCount: SCALEInt,
    public readonly sechduledRevocationsTotal: SCALEInt,
    public readonly status: SCALEEnum<MoonbeamNominatorStatus>
  ) {}
}
