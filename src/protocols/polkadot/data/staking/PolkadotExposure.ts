import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEDecoder } from '../scale/SCALEDecoder'

export class PolkadotExposure {

    public static decode(raw: string): PolkadotExposure {
        const decoder = new SCALEDecoder(raw)

        const total = decoder.decodeNextInt(128)
        const own = decoder.decodeNextInt(128)
        const others = decoder.decodeNextArray(hex => 
            SCALETuple.decode(
                hex, 
                SCALEAccountId.decode, 
                second => SCALEInt.decode(second, 128)
            )
        )

        return new PolkadotExposure(total.decoded, own.decoded, others.decoded)
    }

    private constructor(
        readonly total: SCALEInt,
        readonly own: SCALEInt,
        readonly others: SCALEArray<SCALETuple<SCALEAccountId, SCALEInt>>
    ) {}
}