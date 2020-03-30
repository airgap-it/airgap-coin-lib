import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'

export class PolkadotValidatorPrefs {

    public static decode(raw: string): PolkadotValidatorPrefs {
        const decoder = new SCALEDecoder(raw)

        const commission = decoder.decodeNextCompactInt() // Perbill (parts per billion)
        
        return new PolkadotValidatorPrefs(commission.decoded)
    }
 
    private constructor(
        readonly commission: SCALECompactInt
    ) {}
}

export class PolkadotExposure {

    public static decode(raw: string): PolkadotExposure {
        const decoder = new SCALEDecoder(raw)

        const totalBalance = decoder.decodeNextCompactInt()
        const ownStash = decoder.decodeNextCompactInt()
        const others = decoder.decodeNextArray(hex => SCALETuple.decode(hex, SCALEAccountId.decode, SCALECompactInt.decode))

        return new PolkadotExposure(totalBalance.decoded, ownStash.decoded, others.decoded)
    }

    private constructor(
        readonly totalBalance: SCALECompactInt,
        readonly ownStash: SCALECompactInt,
        readonly others: SCALEArray<SCALETuple<SCALEAccountId, SCALECompactInt>>
    ) {}
}

export enum PolkadotValidatorStatus {
    REAPED = 'Reaped',
    INACTIVE = "Inactive",
    ACTIVE = "Active"
}

export interface PolkadotValidatorDetails {
    name: string | null,
    status: PolkadotValidatorStatus | null,
    ownStash: BigNumber | null
    totalStakingBalance: BigNumber | null,
    commission: BigNumber | null
}