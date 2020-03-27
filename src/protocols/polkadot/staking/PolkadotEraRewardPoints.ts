import { SCALEArray } from '../node/codec/type/SCALEArray'
import { SCALETuple } from '../node/codec/type/SCALETuple'
import { SCALEAccountId } from '../node/codec/type/SCALEAccountId'
import { SCALEInt } from '../node/codec/type/SCALEInt'
import { SCALEDecoder } from '../node/codec/SCALEDecoder'

export class PolkadotEraRewardPoints {
    public static decode(raw: string): PolkadotEraRewardPoints {
        const decoder = new SCALEDecoder(raw)

        const total = decoder.decodeNextInt(32)
        const individual = decoder.decodeNextArray(hex => 
            SCALETuple.decode(
                hex,
                SCALEAccountId.decode,
                second => SCALEInt.decode(second, 32)
            )
        )

        return new PolkadotEraRewardPoints(total.decoded, individual.decoded)
    }

    private constructor(
        readonly total: SCALEInt,
        readonly individual: SCALEArray<SCALETuple<SCALEAccountId, SCALEInt>>
    ) {}
}