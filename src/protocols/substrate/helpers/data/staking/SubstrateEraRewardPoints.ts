import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export class SubstrateEraRewardPoints {
    public static decode(network: SubstrateNetwork, raw: string ): SubstrateEraRewardPoints {
        const decoder = new SCALEDecoder(network, raw)

        const total = decoder.decodeNextInt(32)
        const individual = decoder.decodeNextArray((network, hex) => 
            SCALETuple.decode(
                network,
                hex,
                SCALEAccountId.decode,
                (_, second) => SCALEInt.decode(second, 32)
            )
        )

        return new SubstrateEraRewardPoints(total.decoded, individual.decoded)
    }

    private constructor(
        readonly total: SCALEInt,
        readonly individual: SCALEArray<SCALETuple<SCALEAccountId, SCALEInt>>
    ) {}
}