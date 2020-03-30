import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEOptional } from '../scale/type/SCALEOptional'

interface LockedInfo {
    value: BigNumber
    expectedUnlock: BigNumber
}

export interface PolkadotReward {
    eraIndex: number
    amount: BigNumber
    exposures: [string, number][]
    timestamp: number
    collected: boolean
}

export type PolkadotStakingStatus = 'bonded' | 'nominating' | 'nominating_inactive'

export interface PolkadotStakingInfo {
    total: BigNumber
    active: BigNumber
    unlocked: BigNumber
    locked: LockedInfo[]
    status: PolkadotStakingStatus
    nextEra: number
    previousRewards: PolkadotReward[]
}

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