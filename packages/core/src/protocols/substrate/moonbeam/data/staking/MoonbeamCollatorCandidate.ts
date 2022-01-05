import { SCALEDecoder } from '../../../common/data/scale/SCALEDecoder'
import { SCALEAccountId } from '../../../common/data/scale/type/SCALEAccountId'
import { SCALEArray } from '../../../common/data/scale/type/SCALEArray'
import { SCALEEnum } from '../../../common/data/scale/type/SCALEEnum'
import { SCALEInt } from '../../../common/data/scale/type/SCALEInt'
import { SCALEOptional } from '../../../common/data/scale/type/SCALEOptional'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

import { MoonbeamBond } from './MoonbeamBond'
import { MoonbeamCandidateBondLessRequest } from './MoonbeamCandidateBondLessRequest'

export enum MoonbeamCollatorStatus {
  ACTIVE = 0,
  IDLE,
  LEAVING
}

export class MoonbeamCollatorCandidate {
  public static decode(runtimeVersion: number | undefined, raw: string): MoonbeamCollatorCandidate {
    const decoder = new SCALEDecoder(SubstrateNetwork.MOONBEAM, runtimeVersion, raw)

    const id = decoder.decodeNextAccountId(20)
    const bond = decoder.decodeNextInt(128)
    const delegators = decoder.decodeNextArray((network, _, hex) => SCALEAccountId.decode(network, hex, 20))
    const topDelegations = decoder.decodeNextArray((_, runtimeVersion, hex) => MoonbeamBond.decode(runtimeVersion, hex))
    const bottomNominations = decoder.decodeNextArray((_, runtimeVersion, hex) => MoonbeamBond.decode(runtimeVersion, hex))
    const totalCounted = decoder.decodeNextInt(128)
    const totalBacking = decoder.decodeNextInt(128)
    const request = decoder.decodeNextOptional((_, runtimeVersion, hex) => MoonbeamCandidateBondLessRequest.decode(runtimeVersion, hex))
    const state = decoder.decodeNextEnum((value) => MoonbeamCollatorStatus[MoonbeamCollatorStatus[value]])

    return new MoonbeamCollatorCandidate(
      id.decoded,
      bond.decoded,
      delegators.decoded,
      topDelegations.decoded,
      bottomNominations.decoded,
      totalCounted.decoded,
      totalBacking.decoded,
      request.decoded,
      state.decoded
    )
  }

  private constructor(
    public readonly id: SCALEAccountId<SubstrateNetwork.MOONBEAM>,
    public readonly bond: SCALEInt,
    public readonly delegators: SCALEArray<SCALEAccountId<SubstrateNetwork.MOONBEAM>>,
    public readonly topDelegations: SCALEArray<MoonbeamBond>,
    public readonly bottomDelegations: SCALEArray<MoonbeamBond>,
    public readonly totalCounted: SCALEInt,
    public readonly totalBacking: SCALEInt,
    public readonly request: SCALEOptional<MoonbeamCandidateBondLessRequest>,
    public readonly status: SCALEEnum<MoonbeamCollatorStatus>
  ) {}
}
