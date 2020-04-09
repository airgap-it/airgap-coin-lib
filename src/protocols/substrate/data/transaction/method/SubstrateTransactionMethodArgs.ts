import { SubstrateTransactionType } from '../SubstrateTransaction'
import { SCALEType } from '../../scale/type/SCALEType'
import { SCALEDecodeResult, SCALEDecoder } from '../../scale/SCALEDecoder'
import { SCALEAccountId } from '../../scale/type/SCALEAccountId'
import { SCALECompactInt } from '../../scale/type/SCALECompactInt'
import { SCALEEnum } from '../../scale/type/SCALEEnum'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SubstrateAddress, SubstrateAccountId } from '../../account/SubstrateAddress'
import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALETuple } from '../../scale/type/SCALETuple'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SubstrateTransactionMethod } from './SubstrateTransactionMethod'
import { SubstratePayee } from '../../staking/SubstratePayee'
import { IAirGapTransaction } from '../../../../../interfaces/IAirGapTransaction'

interface TransferArgs {
    to: SubstrateAccountId,
    value: number | BigNumber
}

interface BondArgs {
    controller: SubstrateAccountId
    value: number | BigNumber,
    payee: SubstratePayee
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
    targets: SubstrateAccountId[]
}

interface StopNominatingArgs {

}

interface PayoutNominatorArgs {
    eraIndex: number | BigNumber
    validators: [SubstrateAccountId, number][]
}

interface SetPayeeArgs {
    payee: SubstratePayee
}

interface SetControllerArgs {
    controller: SubstrateAccountId
}

interface SubmitBatchArgs {
    calls: SubstrateTransactionMethod[]
}

function assertFields(type: string, object: any, ...fields: string[]) {
    fields.forEach(field => {
        if (object[field] === undefined) {
            throw new Error(`Incorrect arguments passed for Substrate ${type} transaction. Required: ${fields.join(', ')} but ${field} is missing`)
        }
    })
    return true
}

export abstract class SubstrateTransactionMethodArgsFactory<T> {
    public static create(type: SubstrateTransactionType, args: any): SubstrateTransactionMethodArgsFactory<any> {
        switch (type) {
            case SubstrateTransactionType.TRANSFER:
                assertFields('transfer', args, 'to', 'value')
                return new TransferArgsFactory(args)
            case SubstrateTransactionType.BOND:
                assertFields('bond', args, 'controller', 'value', 'payee')
                return new BondArgsFactory(args)
            case SubstrateTransactionType.UNBOND:
                assertFields('unbond', args, 'value')
                return new UnbondArgsFactory(args)
            case SubstrateTransactionType.REBOND:
                assertFields('rebond', args, 'value')
                return new RebondArgsFactory(args)
            case SubstrateTransactionType.BOND_EXTRA:
                assertFields('bondExtra', args, 'value')
                return new BondExtraArgsFactory(args)
            case SubstrateTransactionType.WITHDRAW_UNBONDED:
                return new WithdrawUnbondedArgsFactory(args)
            case SubstrateTransactionType.NOMINATE:
                assertFields('nominate', args, 'targets')
                return new NominateArgsFactory(args)
            case SubstrateTransactionType.CANCEL_NOMINATION:
                return new StopNominatingArgsFactory(args)
            case SubstrateTransactionType.COLLECT_PAYOUT:
                assertFields('collectPayout', args, 'eraIndex', 'validators')
                return new PayoutNominatorArgsFactory(args)
            case SubstrateTransactionType.SET_PAYEE:
                assertFields('setPayee', args, 'payee')
                return new SetPayeeArgsFactory(args)
            case SubstrateTransactionType.SET_CONTROLLER:
                assertFields('setController', args, 'controller')
                return new SetControllerArgsFactory(args)
            case SubstrateTransactionType.SUBMIT_BATCH:
                assertFields('submitBatch', args, 'calls')
                return new SubmitBatchArgsFactory(args)
        }        
    }

    constructor(protected readonly args: T) {}

    public abstract createFields(): [string, SCALEType][]
    public abstract createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[]
}

export abstract class SubstrateTransactionMethodArgsDecoder<T> {
    public static create(type: SubstrateTransactionType): SubstrateTransactionMethodArgsDecoder<any> {
        switch (type) {
            case SubstrateTransactionType.TRANSFER:
                return new TransferArgsDecoder()
            case SubstrateTransactionType.BOND:
                return new BondArgsDecoder()
            case SubstrateTransactionType.UNBOND:
                return new UnbondArgsDecoder()
            case SubstrateTransactionType.REBOND:
                return new RebondArgsDecoder()
            case SubstrateTransactionType.BOND_EXTRA:
                return new BondExtraArgsDecoder()
            case SubstrateTransactionType.WITHDRAW_UNBONDED:
                return new WithdrawUnbondedArgsDecoder()
            case SubstrateTransactionType.NOMINATE:
                return new NominateArgsDecoder()
            case SubstrateTransactionType.CANCEL_NOMINATION:
                return new StopNominatingArgsDecoder()
            case SubstrateTransactionType.COLLECT_PAYOUT:
                return new PayoutNominatorArgsDecoder()
            case SubstrateTransactionType.SET_PAYEE:
                return new SetPayeeArgsDecoder()
            case SubstrateTransactionType.SET_CONTROLLER:
                return new SetControllerArgsDecoder()
            case SubstrateTransactionType.SUBMIT_BATCH:
                return new SubmitBatchArgsDecoder()
        }
    }

    public decode(raw: string): SCALEDecodeResult<T> {
        const decoder = new SCALEDecoder(raw)
        return this._decode(decoder)
    }

    protected abstract _decode(decoder: SCALEDecoder): SCALEDecodeResult<T>
}

class TransferArgsFactory extends SubstrateTransactionMethodArgsFactory<TransferArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['destination', SCALEAccountId.from(this.args.to)],
            ['value', SCALECompactInt.from(this.args.value)]
        ]
    }

    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: [SubstrateAddress.from(this.args.to).toString()],
            amount: this.args.value.toString()
        }]
    }
}

class TransferArgsDecoder extends SubstrateTransactionMethodArgsDecoder<TransferArgs> {
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

class BondArgsFactory extends SubstrateTransactionMethodArgsFactory<BondArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['controller', SCALEAccountId.from(this.args.controller)],
            ['value', SCALECompactInt.from(this.args.value)],
            ['payee', SCALEEnum.from(this.args.payee)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: [SubstrateAddress.from(this.args.controller).toString()],
            amount: this.args.value.toString()
        }]
    }
}

class BondArgsDecoder extends SubstrateTransactionMethodArgsDecoder<BondArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<BondArgs> {
        const controller = decoder.decodeNextAccountId()
        const value = decoder.decodeNextCompactInt()
        const payee = decoder.decodeNextEnum(value => SubstratePayee[SubstratePayee[value]])

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

class UnbondArgsFactory extends SubstrateTransactionMethodArgsFactory<UnbondArgs> {
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

class UnbondArgsDecoder extends SubstrateTransactionMethodArgsDecoder<UnbondArgs> {
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

class RebondArgsFactory extends SubstrateTransactionMethodArgsFactory<RebondArgs> {
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

class RebondArgsDecoder extends SubstrateTransactionMethodArgsDecoder<RebondArgs> {
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

class BondExtraArgsFactory extends SubstrateTransactionMethodArgsFactory<BondExtraArgs> {
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

class BondExtraArgsDecoder extends SubstrateTransactionMethodArgsDecoder<BondExtraArgs> {
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

class WithdrawUnbondedArgsFactory extends SubstrateTransactionMethodArgsFactory<WithdrawUnbondedArgs> {
    public createFields(): [string, SCALEType][] {
        return []
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => []
    }
}

class WithdrawUnbondedArgsDecoder extends SubstrateTransactionMethodArgsDecoder<WithdrawUnbondedArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<WithdrawUnbondedArgs> {
        return {
            bytesDecoded: 0,
            decoded: {}
        }
    }
}

class NominateArgsFactory extends SubstrateTransactionMethodArgsFactory<NominateArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['targets', SCALEArray.from(this.args.targets.map(target => SCALEAccountId.from(target)))]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: this.args.targets.map(target => SubstrateAddress.from(target).toString())
        }]
    }
}

class NominateArgsDecoder extends SubstrateTransactionMethodArgsDecoder<NominateArgs> {
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

class StopNominatingArgsFactory extends SubstrateTransactionMethodArgsFactory<StopNominatingArgs> {
    public createFields(): [string, SCALEType][] {
        return []
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => []
    }
}

class StopNominatingArgsDecoder extends SubstrateTransactionMethodArgsDecoder<StopNominatingArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<StopNominatingArgs> {
        return {
            bytesDecoded: 0,
            decoded: {}
        }
    }
}

class PayoutNominatorArgsFactory extends SubstrateTransactionMethodArgsFactory<PayoutNominatorArgs> {
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

class PayoutNominatorArgsDecoder extends SubstrateTransactionMethodArgsDecoder<PayoutNominatorArgs> {
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

class SetPayeeArgsFactory extends SubstrateTransactionMethodArgsFactory<SetPayeeArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['payee', SCALEEnum.from(this.args.payee)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => []
    }
}

class SetPayeeArgsDecoder extends SubstrateTransactionMethodArgsDecoder<SetPayeeArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SetPayeeArgs> {
        const payee = decoder.decodeNextEnum(value => SubstratePayee[SubstratePayee[value]])

        return {
            bytesDecoded: payee.bytesDecoded,
            decoded: {
                payee: payee.decoded.value
            }
        }
    }
}

class SetControllerArgsFactory extends SubstrateTransactionMethodArgsFactory<SetControllerArgs> {
    public createFields(): [string, SCALEType][] {
        return [
            ['controller', SCALEAccountId.from(this.args.controller)]
        ]
    }
    public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
        return () => [{
            to: [SubstrateAddress.from(this.args.controller).toString()]
        }]
    }
}

class SetControllerArgsDecoder extends SubstrateTransactionMethodArgsDecoder<SetControllerArgs> {
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

class SubmitBatchArgsFactory extends SubstrateTransactionMethodArgsFactory<SubmitBatchArgs> {
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

class SubmitBatchArgsDecoder extends SubstrateTransactionMethodArgsDecoder<SubmitBatchArgs> {
    protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SubmitBatchArgs> {
        // temporary fixed type
        const calls = decoder.decodeNextArray(hex => SubstrateTransactionMethod.decode(SubstrateTransactionType.COLLECT_PAYOUT, hex))

        return {
            bytesDecoded: calls.bytesDecoded,
            decoded: {
                calls: calls.decoded.elements
            }
        }
    }
}