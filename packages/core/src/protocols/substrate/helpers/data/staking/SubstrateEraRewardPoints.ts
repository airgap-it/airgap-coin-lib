import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALETuple } from '../scale/type/SCALETuple'

export class SubstrateEraRewardPoints {
  public static decode(network: SubstrateNetwork, runtimeVersion: number | undefined, raw: string): SubstrateEraRewardPoints {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const total = decoder.decodeNextInt(32)
    const individual = decoder.decodeNextArray((network, runtimeVersion, hex) =>
      SCALETuple.decode(
        network,
        runtimeVersion,
        hex,
        (network, _, first) => SCALEAccountId.decode(network, first),
        (_network, _runtimeVersion, second) => SCALEInt.decode(second, 32)
      )
    )

    return new SubstrateEraRewardPoints(total.decoded, individual.decoded)
  }

  private constructor(readonly total: SCALEInt, readonly individual: SCALEArray<SCALETuple<SCALEAccountId, SCALEInt>>) {}
}
