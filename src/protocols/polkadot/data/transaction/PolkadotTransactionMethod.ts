import { SCALEEncodable } from "./scale"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { encodeCompactIntToHex } from "../../utils/scale"
import { IAirGapTransaction } from "../../../../interfaces/IAirGapTransaction"
import { encodeAddress } from "../../utils/address"

export abstract class PolkadotTransactionMethod implements SCALEEncodable {

    constructor(
        readonly moduleIndex: number,
        readonly callIndex: number,
        readonly args: any
    ) {}

    public abstract toAirGapTransactionPart(): Partial<IAirGapTransaction> 
    protected abstract encodeArgs(): string

    public encode() {
        const moduleIndexEncoded = new Uint8Array([this.moduleIndex])
        const callIndexEncoded = new Uint8Array([this.callIndex])

        return Buffer.concat([moduleIndexEncoded, callIndexEncoded]).toString('hex') + this.encodeArgs()
    }
}

export class PolkadotSpendTransactionMethod extends PolkadotTransactionMethod {

    constructor(
        moduleIndex: number, 
        callIndex: number, 
        destination: string, 
        value: number | BigNumber
    ) { super(moduleIndex, callIndex, { destination, value }) }

    public toAirGapTransactionPart(): Partial<IAirGapTransaction> {
        return {
            to: [encodeAddress(this.args.destination)],
            amount: this.args.value.toString(10)
        }
    }

    protected encodeArgs(): string {
        const destinationEncoded = 'ff' + this.args.destination
        const valueEncoded = encodeCompactIntToHex(this.args.value)

        return destinationEncoded + valueEncoded
    }
}