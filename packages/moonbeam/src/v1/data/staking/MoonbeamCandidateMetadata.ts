import { SCALEDecoder, SCALEEnum, SCALEInt, SCALEOptional } from '@airgap/substrate/v1'

import { MoonbeamProtocolConfiguration } from '../../types/configuration'

import { MoonbeamCandidateBondLessRequest } from './MoonbeamCandidateBondLessRequest'

export enum MoonbeamCollatorStatus {
  ACTIVE = 0,
  IDLE,
  LEAVING
}

export enum MoonbeamCapacityStatus {
  FULL = 0,
  EMPTY,
  PARTIAL
}

export class MoonbeamCandidateMetadata {
  public static decode<C extends MoonbeamProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): MoonbeamCandidateMetadata {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const bond = decoder.decodeNextInt(128)
    const delegationCount = decoder.decodeNextInt(32)
    const totalCounted = decoder.decodeNextInt(128)
    const lowestTopDelegationAmount = decoder.decodeNextInt(128)
    const highestBottomDelegationAmount = decoder.decodeNextInt(128)
    const lowestBottomDelegationAmount = decoder.decodeNextInt(128)
    const topCapacity = decoder.decodeNextEnum(
      (value) => MoonbeamCapacityStatus[MoonbeamCapacityStatus[value] as keyof typeof MoonbeamCapacityStatus]
    )
    const bottomCapacity = decoder.decodeNextEnum(
      (value) => MoonbeamCapacityStatus[MoonbeamCapacityStatus[value] as keyof typeof MoonbeamCapacityStatus]
    )
    const request = decoder.decodeNextOptional((configuration, runtimeVersion, hex) =>
      MoonbeamCandidateBondLessRequest.decode(configuration, runtimeVersion, hex)
    )
    const status = decoder.decodeNextEnum(
      (value) => MoonbeamCollatorStatus[MoonbeamCollatorStatus[value] as keyof typeof MoonbeamCollatorStatus]
    )

    return new MoonbeamCandidateMetadata(
      bond.decoded,
      delegationCount.decoded,
      totalCounted.decoded,
      lowestTopDelegationAmount.decoded,
      highestBottomDelegationAmount.decoded,
      lowestBottomDelegationAmount.decoded,
      topCapacity.decoded,
      bottomCapacity.decoded,
      request.decoded,
      status.decoded
    )
  }

  private constructor(
    public readonly bond: SCALEInt,
    public readonly delegationCount: SCALEInt,
    public readonly totalCounted: SCALEInt,
    public readonly lowestTopDelegationAmount: SCALEInt,
    public readonly highestBottomDelegationAmount: SCALEInt,
    public readonly lowestBottomDelegationAmount: SCALEInt,
    public readonly topCapacity: SCALEEnum<MoonbeamCapacityStatus>,
    public readonly bottomCapacity: SCALEEnum<MoonbeamCapacityStatus>,
    public readonly request: SCALEOptional<MoonbeamCandidateBondLessRequest>,
    public readonly status: SCALEEnum<MoonbeamCollatorStatus>
  ) {}
}
