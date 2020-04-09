import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEDecoder } from '../scale/SCALEDecoder'

export class SubstrateEraRewardPoints {
    public static decode(raw: string): SubstrateEraRewardPoints {
        const decoder = new SCALEDecoder(raw)

        const total = decoder.decodeNextInt(32)
        const individual = decoder.decodeNextArray(hex => 
            SCALETuple.decode(
                hex,
                SCALEAccountId.decode,
                second => SCALEInt.decode(second, 32)
            )
        )

        return new SubstrateEraRewardPoints(total.decoded, individual.decoded)
    }

    private constructor(
        readonly total: SCALEInt,
        readonly individual: SCALEArray<SCALETuple<SCALEAccountId, SCALEInt>>
    ) {}
}