import { SCALEDecoder, SCALEDecodeResult, SCALEEnum, SCALEInt } from '@airgap/substrate/v1'
import { PolkadotProtocolConfiguration } from '../../types/configuration'

export enum SubstrateElectionStatus {
  CLOSED = 0,
  OPEN
}

export class SubstrateEraElectionStatus {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateEraElectionStatus {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const status = decoder.decodeNextEnum((value) => SubstrateElectionStatus[SubstrateElectionStatus[value]])

    let blockNumber: SCALEDecodeResult<SCALEInt> | undefined
    if (status.decoded.value === SubstrateElectionStatus.OPEN) {
      blockNumber = decoder.decodeNextInt(32)
    }

    return new SubstrateEraElectionStatus(status.decoded, blockNumber?.decoded)
  }

  constructor(public status: SCALEEnum<SubstrateElectionStatus>, public blockNumber?: SCALEInt) {}
}
