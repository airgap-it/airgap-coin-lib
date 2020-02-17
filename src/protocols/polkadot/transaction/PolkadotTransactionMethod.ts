import { IAirGapTransaction } from "../../../interfaces/IAirGapTransaction"
import { SCALEClass } from "../codec/type/SCALEClass"
import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { PolkadotTransactionType } from "./PolkadotTransaction"
import { SCALEAddress } from "../codec/type/SCALEAddress"
import { SCALECompactInt } from "../codec/type/SCALECompactInt"
import { SCALEInt } from "../codec/type/SCALEInt"
import { SCALEType } from "../codec/type/SCALEType"
import { SCALEDecodeResult, SCALEDecoder } from "../codec/SCALEDecoder"
import { PolkadotRewardDestination } from "./staking/PolkadotRewardDestination"
import { SCALEEnum } from "../codec/type/SCALEEnum"
import { SCALEArray } from "../codec/type/SCALEArray"

interface SpendArgs {
    to: string,
    value: number | BigNumber
}

interface BondArgs {
    controller: string,
    value: number | BigNumber,
    payee: PolkadotRewardDestination
}

interface NominationArgs {
    targets: string[]
}

export class PolkadotTransactionMethod extends SCALEClass {
    public static create(type: PolkadotTransactionType, moduleIndex: number, callIndex: number, args: any): PolkadotTransactionMethod {
        let methodFactory: (moduleIndex: number, callIndex: number, args: any) => PolkadotTransactionMethod
        switch (type) {
            case PolkadotTransactionType.SPEND:
                methodFactory = this.createSpendTransaction
                break
            case PolkadotTransactionType.BOND:
                methodFactory = this.createBondTransaction
                break
            case PolkadotTransactionType.NOMINATION:
                methodFactory = this.createNominationTransaction
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
                args = decoder.decodeNextObject(PolkadotTransactionMethod.decodeSpendArgs)
                break
            case PolkadotTransactionType.BOND:
                args = decoder.decodeNextObject(PolkadotTransactionMethod.decodeBondArgs)
                break;
            case PolkadotTransactionType.NOMINATION:
                args = decoder.decodeNextObject(PolkadotTransactionMethod.decodeNominationArgs)
                break
        }

        return {
            bytesDecoded: moduleIndex.bytesDecoded + callIndex.bytesDecoded + args.bytesDecoded,
            decoded: PolkadotTransactionMethod.create(type, moduleIndex.decoded.toNumber(), callIndex.decoded.toNumber(), args.decoded)
        }
    }

    private static createSpendTransaction(moduleIndex: number, callIndex: number, args: SpendArgs): PolkadotTransactionMethod {
        if (args.to == undefined || args.value == undefined) {
            throw Error('Incorrect arguments passed for Polkadot spend transaction. Arguments `to` and `value` are required')
        }

        const destination = SCALEAddress.from(args.to)
        const value = SCALECompactInt.from(args.value)
        return new PolkadotTransactionMethod(
            SCALEInt.from(moduleIndex), 
            SCALEInt.from(callIndex), 
            new Map(Object.entries({ destination, value })), 
            () => ({ 
                to: [destination.asAddress()], 
                amount: value.toString()
            })
        )
    }

    private static createBondTransaction(moduleIndex: number, callIndex: number, args: BondArgs): PolkadotTransactionMethod {
        if (args.controller === undefined || args.value === undefined || args.payee === undefined) {
            throw Error('Incorrect arguments passed for Polkadot bond transaction. Arguments `controller`, `value` and `payee` are required')
        }

        const controller = SCALEAddress.from(args.controller)
        const value = SCALECompactInt.from(args.value)
        const payee = SCALEEnum.from(args.payee)

        return new PolkadotTransactionMethod(
            SCALEInt.from(moduleIndex),
            SCALEInt.from(callIndex),
            new Map(Object.entries({ controller, value, payee })),
            () => ({
                to: [controller.asAddress()],
                amount: value.toString()
            })
        )
    }

    private static createNominationTransaction(moduleIndex: number, callIndex: number, args: NominationArgs): PolkadotTransactionMethod {
        if (args.targets == undefined) {
            throw Error('Incorrect arguments passed for Polkadot delegation transaction. Argument `target` is required')
        }

        const targets = SCALEArray.from(args.targets.map(target => SCALEAddress.from(target)))

        return new PolkadotTransactionMethod(
            SCALEInt.from(moduleIndex), 
            SCALEInt.from(callIndex), 
            new Map(Object.entries({ targets })), 
            () => ({ 
                to: targets.elements.map(target => target.asAddress()),
                amount: ''
            })
        )
    }

    private static decodeSpendArgs(raw: string): SCALEDecodeResult<SpendArgs> {
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

    private static decodeBondArgs(raw: string): SCALEDecodeResult<BondArgs> {
        const decoder = new SCALEDecoder(raw)

        const controller = decoder.decodeNextAddress()
        const value = decoder.decodeNextCompactInt()
        const payee = decoder.decodeNextEnum(value => PolkadotRewardDestination[PolkadotRewardDestination[value]])

        return {
            bytesDecoded: controller.bytesDecoded + value.bytesDecoded + payee.bytesDecoded,
            decoded: {
                controller: controller.decoded.accountId,
                value: value.decoded.value,
                payee: payee.decoded.value
            }
        }
    }

    private static decodeNominationArgs(raw: string): SCALEDecodeResult<NominationArgs> {
        const decoder = new SCALEDecoder(raw)

        const targets = decoder.decodeNextArray(SCALEAddress.decode)

        return {
            bytesDecoded: targets.bytesDecoded,
            decoded: {
                targets: targets.decoded.elements.map(target => target.accountId)
            }
        }
    }

    protected readonly scaleFields = [this.moduleIndex, this.callIndex, ...Array.from(this.args.values())]

    private constructor(
        readonly moduleIndex: SCALEInt,
        readonly callIndex: SCALEInt,
        readonly args: Map<string, SCALEType>,
        readonly toAirGapTransactionPart: () => Partial<IAirGapTransaction>
    ) { super() }

    public toString(): string {
        return JSON.stringify({
            moduleIndex: this.moduleIndex.toNumber(),
            callIndex: this.callIndex.toNumber(),
            ...Array.from(this.args.entries()).reduce((prev, [key, value]) => Object.assign(prev, { [key]: value.toString() }), {})
        }, null, 2)
    }
}