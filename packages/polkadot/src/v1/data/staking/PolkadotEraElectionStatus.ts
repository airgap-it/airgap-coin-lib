import { SCALEDecoder, SCALEDecodeResult, SCALEEnum, SCALEInt } from '@airgap/substrate/v1'

import { PolkadotProtocolConfiguration } from '../../types/configuration'

export enum PolkadotElectionStatus {
  CLOSED = 0,
  OPEN
}

export class PolkadotEraElectionStatus {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): PolkadotEraElectionStatus {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const status = decoder.decodeNextEnum(
      (value) => PolkadotElectionStatus[PolkadotElectionStatus[value] as keyof typeof PolkadotElectionStatus]
    )

    let blockNumber: SCALEDecodeResult<SCALEInt> | undefined
    if (status.decoded.value === PolkadotElectionStatus.OPEN) {
      blockNumber = decoder.decodeNextInt(32)
    }

    return new PolkadotEraElectionStatus(status.decoded, blockNumber?.decoded)
  }

  constructor(public status: SCALEEnum<PolkadotElectionStatus>, public blockNumber?: SCALEInt) {}
}
