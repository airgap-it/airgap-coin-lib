import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export class SubstrateExposure {

    public static decode(network: SubstrateNetwork, raw: string): SubstrateExposure {
        const decoder = new SCALEDecoder(network, raw)

        const total = decoder.decodeNextCompactInt()
        const own = decoder.decodeNextCompactInt()
        const others = decoder.decodeNextArray((network, hex) => 
            SCALETuple.decode(
                network,
                hex, 
                SCALEAccountId.decode, 
                (_, second) => SCALECompactInt.decode(second)
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