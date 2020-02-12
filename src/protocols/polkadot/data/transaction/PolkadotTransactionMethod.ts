import { IAirGapTransaction } from "../../../../interfaces/IAirGapTransaction"
import { SCALEClass } from "../../type/SCALEClass"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { PolkadotTransactionType } from "./PolkadotTransaction"
import { SCALEAddress } from "../../type/primitive/SCALEAddress"
import { SCALECompactInt } from "../../type/primitive/SCALECompactInt"
import { SCALEInt } from "../../type/primitive/SCALEInt"
import { SCALEAccountId } from "../../type/primitive/SCALEAccountId"
import { SCALEType } from "../../type/SCALEType"

export interface PolkadotSpendTransactionArgs {
    to: string,
    value: number | BigNumber
}

export interface PolkadotDelegationTransactionArgs {
    to: string,
    conviction: string
}

export class PolkadotTransactionMethod extends SCALEClass {
    public static create(type: PolkadotTransactionType, moduleIndex: number, callIndex: number, args: any): PolkadotTransactionMethod {
        let methodFactory: (moduleIndex: number, callIndex: number, args: any) => PolkadotTransactionMethod
        switch (type) {
            case PolkadotTransactionType.SPEND:
                methodFactory = this.createSpendTransaction
                break
            case PolkadotTransactionType.DELEGATION:
                methodFactory = this.createDelegationTransaction
                break
        }
        return methodFactory(moduleIndex, callIndex, args)
    }

    private static createSpendTransaction(moduleIndex: number, callIndex: number, args: PolkadotSpendTransactionArgs): PolkadotTransactionMethod {
        if (args.to == undefined || args.value == undefined) {
            throw Error('Incorrect arguments passed for Polkadot spend transaction. Arguments `to` and `value` are required')
        }

        const destination = SCALEAddress.from(args.to)
        const value = SCALECompactInt.from(args.value)
        return new PolkadotTransactionMethod(SCALEInt.from(moduleIndex), SCALEInt.from(callIndex), [destination, value], () => { 
            return { 
                to: [destination.asAddress()], 
                amount: value.asString()
            } 
        })
    }

    private static createDelegationTransaction(moduleIndex: number, callIndex: number, args: PolkadotDelegationTransactionArgs): PolkadotTransactionMethod {
        if (args.to == undefined || args.conviction == undefined) {
            throw Error('Incorrect arguments passed for Polkadot spend transaction. Arguments `to` and `conviction` are required')
        }

        const to = SCALEAccountId.from(args.to)
        const conviction = SCALEInt.from(args.conviction)
        return new PolkadotTransactionMethod(SCALEInt.from(moduleIndex), SCALEInt.from(callIndex), [to, conviction], () => {
            return {
                to: [to.asAddress()],
                amount: conviction.asString()
            }
        })
    }

    protected readonly scaleFields = [this.moduleIndex, this.callIndex, ...this.args]

    private constructor(
        readonly moduleIndex: SCALEInt,
        readonly callIndex: SCALEInt,
        readonly args: SCALEType[],
        readonly toAirGapTransactionPart: () => Partial<IAirGapTransaction>
    ) { super() }
}