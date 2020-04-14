import { PolkadotTransactionType } from '../PolkadotTransaction'
import { SCALEType } from '../../scale/type/SCALEType'
import { SCALEDecodeResult, SCALEDecoder } from '../../scale/SCALEDecoder'
import { SCALEAccountId } from '../../scale/type/SCALEAccountId'
import { SCALECompactInt } from '../../scale/type/SCALECompactInt'
import { SCALEEnum } from '../../scale/type/SCALEEnum'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { PolkadotAddress, PolkadotAccountId } from '../../account/PolkadotAddress'
import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALETuple } from '../../scale/type/SCALETuple'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { PolkadotTransactionMethod } from './PolkadotTransactionMethod'
import { PolkadotPayee } from '../../staking/PolkadotPayee'
import { IAirGapTransaction } from '../../../../../interfaces/IAirGapTransaction'

interface TransferArgs {
    to: PolkadotAccountId,
    value: number | BigNumber
}

interface BondArgs {
    controller: PolkadotAccountId
    value: number | BigNumber,
    payee: PolkadotPayee
}

interface UnbondArgs {
    value: number | BigNumber
}

interface RebondArgs {
    value: number | BigNumber
}

interface BondExtraArgs {
    value: number | BigNumber
}

interface WithdrawUnbondedArgs {

}

interface NominateArgs {
    targets: PolkadotAccountId[]
}

interface StopNominatingArgs {

}

interface PayoutNominatorArgs {
    eraIndex: number | BigNumber
    validators: [PolkadotAccountId, number][]
}

interface SetPayeeArgs {
    payee: PolkadotPayee
}

interface SetControllerArgs {
    controller: PolkadotAccountId
}

interface SubmitBatchArgs {
    calls: PolkadotTransactionMethod[]
}

function assertFields(type: string, object: any, ...fields: string[]) {
    fields.forEach(field => {
        if (object[field] === undefined) {
            throw new Error(`Incorrect arguments passed for Polkadot ${type} transaction. Required: ${fields.join()}, but ${field} is missing`)
        }
    })
    return true
}

export abstract class PolkadotTransactionMethodArgsFactory<T> {
    public static create(type: PolkadotTransactionType, args: any): PolkadotTransactionMethodArgsFactory<any> {
        switch (type) {
            case PolkadotTransactionType.TRANSFER:
                assertFields('transfer', args, 'to', 'value')
                return new TransferArgsFactory(args)
            case PolkadotTransactionType.BOND:
                assertFields('bond', args, 'controller', 'value', 'payee')
                return new BondArgsFactory(args)
            case PolkadotTransactionType.UNBOND:
                assertFields('unbond', args, 'value')
                return new UnbondArgsFactory(args)
            case PolkadotTransactionType.REBOND:
                assertFields('rebond', args, 'value')
                return new RebondArgsFactory(args)
            case PolkadotTransactionType.BOND_EXTRA:
                assertFields('bondExtra', args, 'value')
                return new BondExtraArgsFactory(args)
            case PolkadotTransactionType.WITHDRAW_UNBONDED:
                return new WithdrawUnbondedArgsFactory(args)
            case PolkadotTransactionType.NOMINATE:
                assertFields('nominate', args, 'targets')
                return new NominateArgsFactory(args)
            case PolkadotTransactionType.CANCEL_NOMINATION:
                return new StopNominatingArgsFactory(args)
            case PolkadotTransactionType.COLLECT_PAYOUT:
                assertFields('collectPayout', args, 'eraIndex', 'validators')
                return new PayoutNominatorArgsFactory(args)
            case PolkadotTransactionType.SET_PAYEE:
                assertFields('setPayee', args, 'payee')
                return new SetPayeeArgsFactory(args)
            case PolkadotTransactionType.SET_CONTROLLER:
                assertFields('setController', args, 'controller')
                return new SetControllerArgsFactory(args)
            case PolkadotTransactionType.SUBMIT_BATCH:
                assertFields('submitBatch', args, 'calls')
                return new SubmitBatchArgsFactory(args)
        }        
    }

    constructor(protected readonly args: T) {}

    public abstract createFields(): [string, SCALEType][]
    public abstract createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[]
}

export abstract class PolkadotTransactionMethodArgsDecoder<T> {
    public static create(type: PolkadotTransactionType): PolkadotTransactionMethodArgsDecoder<any> {
        switch (type) {
            case PolkadotTransactionType.TRANSFER:
                return new TransferArgsDecoder()
            case PolkadotTransactionType.BOND:
                return new BondArgsDecoder()
            case PolkadotTransactionType.UNBOND:
                return new UnbondArgsDecoder()
            case PolkadotTransactionType.REBOND:
                return new RebondArgsDecoder()
            case PolkadotTransactionType.BOND_EXTRA:
                return new BondExtraArgsDecoder()
            case PolkadotTransactionType.WITHDRAW_UNBONDED:
                return new WithdrawUnbondedArgsDecoder()
            case PolkadotTransactionType.NOMINATE:
                return new NominateArgsDecoder()
            case PolkadotTransactionType.CANCEL_NOMINATION:
                return new StopNominatingArgsDecoder()
            case PolkadotTransactionType.COLLECT_PAYOUT:
                return new PayoutNominatorArgsDecoder()
            case PolkadotTransactionType.SET_PAYEE:
                return new SetPayeeArgsDecoder()
            case PolkadotTransactionType.SET_CONTROLLER:
                return new SetControllerArgsDecoder()
            case PolkadotTransactionType.SUBMIT_BATCH:
                return new SubmitBatchArgsDecoder()
        }
    }

    public decode(raw: string): SCALEDecodeResult<T> {
        const decoder = new SCALEDecoder(raw)
        return this._decode(decoder)
    }

    protected abstract _decode(decoder: SCALEDecoder): SCALEDecodeResult<T>
}

class TransferArgsFactory extends PolkadotTransactionMethodArgsFactory<TransferArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['destination', SCALEAccountId.from(this.args.to)],
            ['value', SCALECompactInt.from(this.args.value)]
        ]
    }

    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: [PolkadotAddress.from(this.args.to).toString()],
            amount: this.args.value.toString()
        }]
    }
}

class TransferArgsDecoder extends PolkadotTransactionMethodArgsDecoder<TransferArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<TransferArgs> {
        const destination = decoder.decodeNextAccountId()
        const value = decoder.decodeNextCompactInt()

        return {
            bytesDecoded: destination.bytesDecoded + value.bytesDecoded,
            decoded: {
                to: destination.decoded.toString(),
                value: value.decoded.value
            }
        }
    }
}

class BondArgsFactory extends PolkadotTransactionMethodArgsFactory<BondArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['controller', SCALEAccountId.from(this.args.controller)],
            ['value', SCALECompactInt.from(this.args.value)],
            ['payee', SCALEEnum.from(this.args.payee)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: [PolkadotAddress.from(this.args.controller).toString()],
            amount: this.args.value.toString()
        }]
    }
}

class BondArgsDecoder extends PolkadotTransactionMethodArgsDecoder<BondArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<BondArgs> {
        const controller = decoder.decodeNextAccountId()
        const value = decoder.decodeNextCompactInt()
        const payee = decoder.decodeNextEnum(value => PolkadotPayee[PolkadotPayee[value]])

        return {
            bytesDecoded: controller.bytesDecoded + value.bytesDecoded + payee.bytesDecoded,
            decoded: {
                controller: controller.decoded.toString(),
                value: value.decoded.value,
                payee: payee.decoded.value
            }
        }
    }
}

class UnbondArgsFactory extends PolkadotTransactionMethodArgsFactory<UnbondArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['value', SCALECompactInt.from(this.args.value)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            amount: this.args.value.toString() 
        }]
    }
}

class UnbondArgsDecoder extends PolkadotTransactionMethodArgsDecoder<UnbondArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<UnbondArgs> {
        const value = decoder.decodeNextCompactInt()

        return {
            bytesDecoded: value.bytesDecoded,
            decoded: {
                value: value.decoded.value
            }
        }
    }
}

class RebondArgsFactory extends PolkadotTransactionMethodArgsFactory<RebondArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['value', SCALECompactInt.from(this.args.value)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            amount: this.args.value.toString() 
        }]
    }
}

class RebondArgsDecoder extends PolkadotTransactionMethodArgsDecoder<RebondArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<RebondArgs> {
        const value = decoder.decodeNextCompactInt()

        return {
            bytesDecoded: value.bytesDecoded,
            decoded: {
                value: value.decoded.value
            }
        }
    }
}

class BondExtraArgsFactory extends PolkadotTransactionMethodArgsFactory<BondExtraArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['value', SCALECompactInt.from(this.args.value)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            amount: this.args.value.toString() 
        }]
    }
}

class BondExtraArgsDecoder extends PolkadotTransactionMethodArgsDecoder<BondExtraArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<BondExtraArgs> {
        const value = decoder.decodeNextCompactInt()

        return {
            bytesDecoded: value.bytesDecoded,
            decoded: {
                value: value.decoded.value
            }
        }
    }
}

class WithdrawUnbondedArgsFactory extends PolkadotTransactionMethodArgsFactory<WithdrawUnbondedArgs> {
    public createFields(): [string, SCALEType][] {
        return []
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => []
    }
}

class WithdrawUnbondedArgsDecoder extends PolkadotTransactionMethodArgsDecoder<WithdrawUnbondedArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<WithdrawUnbondedArgs> {
        return {
            bytesDecoded: 0,
            decoded: {}
        }
    }
}

class NominateArgsFactory extends PolkadotTransactionMethodArgsFactory<NominateArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['targets', SCALEArray.from(this.args.targets.map(target => SCALEAccountId.from(target)))]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: this.args.targets.map(target => PolkadotAddress.from(target).toString())
        }]
    }
}

class NominateArgsDecoder extends PolkadotTransactionMethodArgsDecoder<NominateArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<NominateArgs> {
        const targets = decoder.decodeNextArray(SCALEAccountId.decode)

        return {
            bytesDecoded: targets.bytesDecoded,
            decoded: {
                targets: targets.decoded.elements.map(target => target.toString())
            }
        }
    }
}

class StopNominatingArgsFactory extends PolkadotTransactionMethodArgsFactory<StopNominatingArgs> {
    public createFields(): [string, SCALEType][] {
        return []
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => []
    }
}

class StopNominatingArgsDecoder extends PolkadotTransactionMethodArgsDecoder<StopNominatingArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<StopNominatingArgs> {
        return {
            bytesDecoded: 0,
            decoded: {}
        }
    }
}

class PayoutNominatorArgsFactory extends PolkadotTransactionMethodArgsFactory<PayoutNominatorArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['eraIndex', SCALEInt.from(this.args.eraIndex, 32)],
            ['validators', SCALEArray.from(
                this.args.validators.map(([accountId, index]) => SCALETuple.from(SCALEAccountId.from(accountId), SCALEInt.from(index, 32)))
            )]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => []
    }
}

class PayoutNominatorArgsDecoder extends PolkadotTransactionMethodArgsDecoder<PayoutNominatorArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<PayoutNominatorArgs> {
        const eraIndex = decoder.decodeNextInt(32)
        const validators = decoder.decodeNextArray(hex => 
            SCALETuple.decode(
                hex, 
                SCALEAccountId.decode,
                second => SCALEInt.decode(second, 32)
            )
        )

        return {
            bytesDecoded: eraIndex.bytesDecoded + validators.bytesDecoded,
            decoded: {
                eraIndex: eraIndex.decoded.value,
                validators: validators.decoded.elements.map(element => [element.first.address, element.second.toNumber()])
            }
        }
    }
}

class SetPayeeArgsFactory extends PolkadotTransactionMethodArgsFactory<SetPayeeArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['payee', SCALEEnum.from(this.args.payee)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => []
    }
}

class SetPayeeArgsDecoder extends PolkadotTransactionMethodArgsDecoder<SetPayeeArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SetPayeeArgs> {
        const payee = decoder.decodeNextEnum(value => PolkadotPayee[PolkadotPayee[value]])

        return {
            bytesDecoded: payee.bytesDecoded,
            decoded: {
                payee: payee.decoded.value
            }
        }
    }
}

class SetControllerArgsFactory extends PolkadotTransactionMethodArgsFactory<SetControllerArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['controller', SCALEAccountId.from(this.args.controller)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: [PolkadotAddress.from(this.args.controller).toString()]
        }]
    }
}

class SetControllerArgsDecoder extends PolkadotTransactionMethodArgsDecoder<SetControllerArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SetControllerArgs> {
        const controller = decoder.decodeNextAccountId()

        return {
            bytesDecoded: controller.bytesDecoded,
            decoded: {
                controller: controller.decoded.toString()
            }
        }
    }
}

class SubmitBatchArgsFactory extends PolkadotTransactionMethodArgsFactory<SubmitBatchArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['calls', SCALEArray.from(this.args.calls)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => this.args.calls
            .map(call => call.toAirGapTransactionParts())
            .reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
    }
}

class SubmitBatchArgsDecoder extends PolkadotTransactionMethodArgsDecoder<SubmitBatchArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SubmitBatchArgs> {
        // temporary fixed type
        const calls = decoder.decodeNextArray(hex => PolkadotTransactionMethod.decode(PolkadotTransactionType.COLLECT_PAYOUT, hex))

        return {
            bytesDecoded: calls.bytesDecoded,
            decoded: {
                calls: calls.decoded.elements
            }
        }
    }
}