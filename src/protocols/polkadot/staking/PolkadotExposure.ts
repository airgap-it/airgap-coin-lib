import { SCALEInt } from '../node/codec/type/SCALEInt'
import { SCALEArray } from '../node/codec/type/SCALEArray'
import { SCALETuple } from '../node/codec/type/SCALETuple'
import { SCALEAccountId } from '../node/codec/type/SCALEAccountId'
import { SCALEDecoder } from '../node/codec/SCALEDecoder'

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