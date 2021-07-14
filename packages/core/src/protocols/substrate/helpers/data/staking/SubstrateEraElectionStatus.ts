import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEEnum } from '../scale/type/SCALEEnum'
import { SCALEInt } from '../scale/type/SCALEInt'

export enum SubstrateElectionStatus {
  CLOSED = 0,
  OPEN
}

export class SubstrateEraElectionStatus {
  public static decode(network: SubstrateNetwork, runtimeVersion: number | undefined, raw: string): SubstrateEraElectionStatus {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const status = decoder.decodeNextEnum((value) => SubstrateElectionStatus[SubstrateElectionStatus[value]])

    let blockNumber: SCALEDecodeResult<SCALEInt> | undefined
    if (status.decoded.value === SubstrateElectionStatus.OPEN) {
      blockNumber = decoder.decodeNextInt(32)
    }

    return new SubstrateEraElectionStatus(status.decoded, blockNumber?.decoded)
  }

  constructor(public status: SCALEEnum<SubstrateElectionStatus>, public blockNumber?: SCALEInt) {}
}
