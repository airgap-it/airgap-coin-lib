import { IAirGapTransaction } from "../../../interfaces/IAirGapTransaction"
import { SCALEClass } from "../codec/type/SCALEClass"
import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { PolkadotTransactionType } from "./PolkadotTransaction"
import { SCALEAddress } from "../codec/type/SCALEAddress"
import { SCALECompactInt } from "../codec/type/SCALECompactInt"
import { SCALEInt } from "../codec/type/SCALEInt"
import { SCALEAccountId } from "../codec/type/SCALEAccountId"
import { SCALEType } from "../codec/type/SCALEType"
import { SCALEDecodeResult, SCALEDecoder } from "../codec/SCALEDecoder"

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

    public static decode(type: PolkadotTransactionType, raw: string): SCALEDecodeResult<PolkadotTransactionMethod> {
        const decoder = new SCALEDecoder(raw)

        const moduleIndex = decoder.decodeNextInt(8)
        const callIndex = decoder.decodeNextInt(8)

        let args
        switch (type) {
            case PolkadotTransactionType.SPEND:
                args = decoder.decodeNextObject(PolkadotTransactionMethod.decodeSpendTransactionArgs)
                break
            case PolkadotTransactionType.DELEGATION:
                args = decoder.decodeNextObject(PolkadotTransactionMethod.decodeDelegationTransactionArgs)
                break
        }

        return {
            bytesDecoded: moduleIndex.bytesDecoded + callIndex.bytesDecoded + args.bytesDecoded,
            decoded: PolkadotTransactionMethod.create(type, moduleIndex.decoded.asNumber(), callIndex.decoded.asNumber(), args.decoded)
        }
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

    private static decodeSpendTransactionArgs(raw: string): SCALEDecodeResult<PolkadotSpendTransactionArgs> {
        const decoder = new SCALEDecoder(raw)

        const destination = decoder.decodeNextAddress()
        const value = decoder.decodeNextCompactInt()

        return {
            bytesDecoded: destination.bytesDecoded + value.bytesDecoded,
            decoded: {
                to: destination.decoded.accountId,
                value: value.decoded.value
            }
        }
    }

    private static decodeDelegationTransactionArgs(raw: string): SCALEDecodeResult<PolkadotDelegationTransactionArgs> {
        const decoder = new SCALEDecoder(raw)

        const to = decoder.decodeNextAddress()
        const conviction = decoder.decodeNextInt(8)

        return {
            bytesDecoded: to.bytesDecoded + conviction.bytesDecoded,
            decoded: {
                to: to.decoded.accountId,
                conviction: conviction.decoded.asString()
            }
        }
    }

    protected readonly scaleFields = [this.moduleIndex, this.callIndex, ...this.args]

    private constructor(
        readonly moduleIndex: SCALEInt,
        readonly callIndex: SCALEInt,
        readonly args: SCALEType[],
        readonly toAirGapTransactionPart: () => Partial<IAirGapTransaction>
    ) { super() }
}