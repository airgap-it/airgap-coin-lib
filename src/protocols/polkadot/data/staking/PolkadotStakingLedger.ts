import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEOptional } from '../scale/type/SCALEOptional'

export class PolkadotStakingLedger {
    public static decode(raw: string): PolkadotStakingLedger {
        const decoder = new SCALEDecoder(raw)

        const stash = decoder.decodeNextAccountId()
        const total = decoder.decodeNextCompactInt()
        const active = decoder.decodeNextCompactInt()
        const unlocking = decoder.decodeNextArray(hex => SCALETuple.decode(
            hex, 
            first => SCALECompactInt.decode(first),
            second => SCALECompactInt.decode(second)
        ))
        const lastReward = decoder.decodeNextOptional(hex => SCALEInt.decode(hex, 32))

        return new PolkadotStakingLedger(stash.decoded, total.decoded, active.decoded, unlocking.decoded, lastReward.decoded)
    }

    private constructor(
        readonly stash: SCALEAccountId,
        readonly total: SCALECompactInt,
        readonly active: SCALECompactInt,
        readonly unlocking: SCALEArray<SCALETuple<SCALECompactInt, SCALECompactInt>>,
        readonly lastReward: SCALEOptional<SCALEInt>
    ) {}
    
}