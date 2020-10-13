import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALETuple } from '../scale/type/SCALETuple'

export class SubstrateEraRewardPoints {
  public static decode(network: SubstrateNetwork, runtimeVersion: number | undefined, raw: string): SubstrateEraRewardPoints {
    const decoder = new SCALEDecoder(network, raw)

    const total = decoder.decodeNextInt(32)
    const individual = decoder.decodeNextArray((network, hex) =>
      SCALETuple.decode(network, hex, SCALEAccountId.decode, (_, second) => SCALEInt.decode(second, 32))
    )

    return new SubstrateEraRewardPoints(total.decoded, individual.decoded)
  }

  private constructor(readonly total: SCALEInt, readonly individual: SCALEArray<SCALETuple<SCALEAccountId, SCALEInt>>) {}
}
