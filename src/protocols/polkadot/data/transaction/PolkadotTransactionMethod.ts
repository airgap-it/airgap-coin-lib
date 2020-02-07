import { IAirGapTransaction } from "../../../../interfaces/IAirGapTransaction"
import { encodeAddress } from "../../utils/address"
import { SCALEInt, SCALEType, SCALEAccountId, SCALECompactInt } from "../../type/scaleType"
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
        destination: SCALEAccountId, 
        value: SCALECompactInt
    ) { super(moduleIndex, callIndex, [destination, value]) }

    private get destination(): SCALEAccountId {
        return this.args[0] as SCALEAccountId
    }

    private get value(): SCALECompactInt {
        return this.args[1] as SCALECompactInt
    }

    public toAirGapTransactionPart(): Partial<IAirGapTransaction> {
        return {
            to: [encodeAddress(this.destination.value)],
            amount: this.value.value.toString(10)
        }
    }
}