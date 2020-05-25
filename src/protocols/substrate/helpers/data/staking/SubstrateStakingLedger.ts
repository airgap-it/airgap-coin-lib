import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export class SubstrateStakingLedger {
    public static decode(network: SubstrateNetwork, raw: string): SubstrateStakingLedger {
        const decoder = new SCALEDecoder(network, raw)

        const stash = decoder.decodeNextAccountId()
        const total = decoder.decodeNextCompactInt()
        const active = decoder.decodeNextCompactInt()
        const unlocking = decoder.decodeNextArray((network, hex) => SCALETuple.decode(
            network,
            hex, 
            (_, first) => SCALECompactInt.decode(first),
            (_, second) => SCALECompactInt.decode(second)
        ))
        const claimedRewards = decoder.decodeNextArray((_, hex) => SCALEInt.decode(hex, 32))

        return new SubstrateStakingLedger(stash.decoded, total.decoded, active.decoded, unlocking.decoded, claimedRewards.decoded)
    }

    private constructor(
        readonly stash: SCALEAccountId,
        readonly total: SCALECompactInt,
        readonly active: SCALECompactInt,
        readonly unlocking: SCALEArray<SCALETuple<SCALECompactInt, SCALECompactInt>>,
        readonly claimedRewards: SCALEArray<SCALEInt>
    ) {}
    
}