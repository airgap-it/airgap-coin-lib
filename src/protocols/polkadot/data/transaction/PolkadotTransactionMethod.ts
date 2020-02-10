import { IAirGapTransaction } from "../../../../interfaces/IAirGapTransaction"
import { encodeAddress } from "../../utils/address"
import { SCALEInt, SCALEType, SCALEAddress, SCALECompactInt, SCALEAccountId } from "../../type/scaleType"
import { SCALEClass } from "../../type/scaleClass"

export abstract class PolkadotTransactionMethod extends SCALEClass {
    protected readonly scaleFields = [this.moduleIndex, this.callIndex, ...this.args]

    constructor(
        readonly moduleIndex: SCALEInt,
        readonly callIndex: SCALEInt,
        readonly args: SCALEType[]
    ) { super() }

    public abstract toAirGapTransactionPart(): Partial<IAirGapTransaction> 
}

export class PolkadotSpendTransactionMethod extends PolkadotTransactionMethod {

    constructor(
        moduleIndex: SCALEInt, 
        callIndex: SCALEInt, 
        destination: SCALEAddress, 
        value: SCALECompactInt
    ) { super(moduleIndex, callIndex, [destination, value]) }

    private get destination(): SCALEAddress {
        return this.args[0] as SCALEAddress
    }

    private get value(): SCALECompactInt {
        return this.args[1] as SCALECompactInt
    }

    public toAirGapTransactionPart(): Partial<IAirGapTransaction> {
        return {
            to: [encodeAddress(this.destination.accountId)],
            amount: this.value.value.toString(10)
        }
    }
}

export class PolkadotDelegationTransactionMethod extends PolkadotTransactionMethod {

    constructor(
        moduleIndex: SCALEInt,
        callIndex: SCALEInt,
        to: SCALEAccountId,
        conviction: SCALEInt
    ) { super(moduleIndex, callIndex, [to, conviction]) }

    private get to(): SCALEAccountId {
        return this.args[0] as SCALEAccountId
    }

    private get conviction(): SCALEInt {
        return this.args[1] as SCALEInt
    }

    public toAirGapTransactionPart(): Partial<IAirGapTransaction> {
        return {
            to: [encodeAddress(this.to.value)],
            amount: this.conviction.value.toString(10)
        }
    }
}