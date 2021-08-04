import { SCALEDecoder } from '../../../common/data/scale/SCALEDecoder'
import { SCALEAccountId } from '../../../common/data/scale/type/SCALEAccountId'
import { SCALEArray } from '../../../common/data/scale/type/SCALEArray'
import { SCALEEnum } from '../../../common/data/scale/type/SCALEEnum'
import { SCALEInt } from '../../../common/data/scale/type/SCALEInt'
import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { MoonbeamBond } from './MoonbeamBond'

export enum MoonbeamCollatorStatus {
  ACTIVE = 0,
  IDLE,
  LEAVING
}

export class MoonbeamCollator {
  public static decode(runtimeVersion: number | undefined, raw: string): MoonbeamCollator {
    const decoder = new SCALEDecoder(SubstrateNetwork.MOONBEAM, runtimeVersion, raw)

    const id = decoder.decodeNextAccountId(20)
    const bond = decoder.decodeNextInt(128)
    const nominators = decoder.decodeNextArray((network, _, hex) => SCALEAccountId.decode(network, hex, 20))
    const topNominators = decoder.decodeNextArray((_, runtimeVersion, hex) => MoonbeamBond.decode(runtimeVersion, hex))
    const bottomNominators = decoder.decodeNextArray((_, runtimeVersion, hex) => MoonbeamBond.decode(runtimeVersion, hex))
    const totalCounted = decoder.decodeNextInt(128)
    const totalBacking = decoder.decodeNextInt(128)
    const status = decoder.decodeNextEnum((value) => MoonbeamCollatorStatus[MoonbeamCollatorStatus[value]])

    return new MoonbeamCollator(
      id.decoded,
      bond.decoded,
      nominators.decoded,
      topNominators.decoded,
      bottomNominators.decoded,
      totalCounted.decoded,
      totalBacking.decoded,
      status.decoded
    )
  }

  private constructor(
    public readonly id: SCALEAccountId<SubstrateNetwork.MOONBEAM>,
    public readonly bond: SCALEInt,
    public readonly nominators: SCALEArray<SCALEAccountId<SubstrateNetwork.MOONBEAM>>,
    public readonly topNominators: SCALEArray<MoonbeamBond>,
    public readonly bottomNominators: SCALEArray<MoonbeamBond>,
    public readonly totalCounted: SCALEInt,
    public readonly totalBacking: SCALEInt,
    public readonly status: SCALEEnum<MoonbeamCollatorStatus>
  ) {}
}
