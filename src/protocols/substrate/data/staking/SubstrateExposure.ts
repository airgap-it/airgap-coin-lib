import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'

export class SubstrateExposure {

    public static decode(raw: string): SubstrateExposure {
        const decoder = new SCALEDecoder(raw)

        const total = decoder.decodeNextCompactInt()
        const own = decoder.decodeNextCompactInt()
        const others = decoder.decodeNextArray(hex => 
            SCALETuple.decode(
                hex, 
                SCALEAccountId.decode, 
                second => SCALECompactInt.decode(second)
            )
        )

        return new SubstrateExposure(total.decoded, own.decoded, others.decoded)
    }

    private constructor(
        readonly total: SCALECompactInt,
        readonly own: SCALECompactInt,
        readonly others: SCALEArray<SCALETuple<SCALEAccountId, SCALECompactInt>>
    ) {}
}