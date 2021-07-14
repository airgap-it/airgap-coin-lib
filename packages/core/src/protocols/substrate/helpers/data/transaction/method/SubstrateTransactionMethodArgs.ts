// tslint:disable: max-classes-per-file
import BigNumber from '../../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../../../../interfaces/IAirGapTransaction'
import { assertFields } from '../../../../../../utils/assert'
import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SubstrateAccountId, SubstrateAddress } from '../../account/SubstrateAddress'
import { SCALEDecoder, SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALEAccountId } from '../../scale/type/SCALEAccountId'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALECompactInt } from '../../scale/type/SCALECompactInt'
import { SCALEEnum } from '../../scale/type/SCALEEnum'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SCALEMultiAddress, SCALEMultiAddressType } from '../../scale/type/SCALEMultiAddress'
import { SCALEType } from '../../scale/type/SCALEType'
import { SubstratePayee } from '../../staking/SubstratePayee'
import { SubstrateTransactionType } from '../SubstrateTransaction'

import { SubstrateTransactionMethod } from './SubstrateTransactionMethod'

interface TransferArgs {
  to: SubstrateAccountId
  value: number | BigNumber
}

interface BondArgs {
  controller: SubstrateAccountId
  value: number | BigNumber
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
  slashingSpansNumber: number
}

interface NominateArgs {
  targets: SubstrateAccountId[]
}

interface StopNominatingArgs {}

interface PayoutStakersArgs {
  validator: SubstrateAccountId
  era: number | BigNumber
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

export abstract class SubstrateTransactionMethodArgsFactory<T> {
  public static create(network: SubstrateNetwork, type: SubstrateTransactionType, args: any): SubstrateTransactionMethodArgsFactory<any> {
    // tslint:disable-next-line: switch-default
    switch (type) {
      case SubstrateTransactionType.TRANSFER:
        assertFields('transfer', args, 'to', 'value')

        return new TransferArgsFactory(network, args)
      case SubstrateTransactionType.BOND:
        assertFields('bond', args, 'controller', 'value', 'payee')

        return new BondArgsFactory(network, args)
      case SubstrateTransactionType.UNBOND:
        assertFields('unbond', args, 'value')

        return new UnbondArgsFactory(network, args)
      case SubstrateTransactionType.REBOND:
        assertFields('rebond', args, 'value')

        return new RebondArgsFactory(network, args)
      case SubstrateTransactionType.BOND_EXTRA:
        assertFields('bondExtra', args, 'value')

        return new BondExtraArgsFactory(network, args)
      case SubstrateTransactionType.WITHDRAW_UNBONDED:
        assertFields('withdrawUnbonded', args, 'slashingSpansNumber')

        return new WithdrawUnbondedArgsFactory(network, args)
      case SubstrateTransactionType.NOMINATE:
        assertFields('nominate', args, 'targets')

        return new NominateArgsFactory(network, args)
      case SubstrateTransactionType.CANCEL_NOMINATION:
        return new StopNominatingArgsFactory(network, args)
      case SubstrateTransactionType.COLLECT_PAYOUT:
        assertFields('collectPayout', args, 'eraIndex', 'validators')

        return new PayoutStakersArgsFactory(network, args)
      case SubstrateTransactionType.SET_PAYEE:
        assertFields('setPayee', args, 'payee')

        return new SetPayeeArgsFactory(network, args)
      case SubstrateTransactionType.SET_CONTROLLER:
        assertFields('setController', args, 'controller')

        return new SetControllerArgsFactory(network, args)
      case SubstrateTransactionType.SUBMIT_BATCH:
        assertFields('submitBatch', args, 'calls')

        return new SubmitBatchArgsFactory(network, args)
    }
  }

  protected constructor(protected readonly network: SubstrateNetwork, protected readonly args: T) {}

  public abstract createFields(): [string, SCALEType][]
  public abstract createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[]
}

export abstract class SubstrateTransactionMethodArgsDecoder<T> {
  public static create(type: SubstrateTransactionType): SubstrateTransactionMethodArgsDecoder<any> {
    // tslint:disable-next-line: switch-default
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
        return new PayoutStakersArgsDecoder()
      case SubstrateTransactionType.SET_PAYEE:
        return new SetPayeeArgsDecoder()
      case SubstrateTransactionType.SET_CONTROLLER:
        return new SetControllerArgsDecoder()
      case SubstrateTransactionType.SUBMIT_BATCH:
        return new SubmitBatchArgsDecoder()
    }
  }

  public decode(network: SubstrateNetwork, runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<T> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    return this._decode(decoder)
  }

  protected abstract _decode(decoder: SCALEDecoder): SCALEDecodeResult<T>
}

class TransferArgsFactory extends SubstrateTransactionMethodArgsFactory<TransferArgs> {
  public createFields(): [string, SCALEType][] {
    return [
      ['destination', SCALEMultiAddress.from(this.args.to, SCALEMultiAddressType.Id, this.network)],
      ['value', SCALECompactInt.from(this.args.value)]
    ]
  }

  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [SubstrateAddress.from(this.args.to, this.network).getValue()],
        amount: this.args.value.toString()
      }
    ]
  }
}

class TransferArgsDecoder extends SubstrateTransactionMethodArgsDecoder<TransferArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<TransferArgs> {
    const destination = decoder.decodeNextMultiAccount(SCALEMultiAddressType.Id)
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
      ['controller', SCALEMultiAddress.from(this.args.controller, SCALEMultiAddressType.Id, this.network)],
      ['value', SCALECompactInt.from(this.args.value)],
      ['payee', SCALEEnum.from(this.args.payee)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [SubstrateAddress.from(this.args.controller, this.network).getValue()],
        amount: this.args.value.toString()
      }
    ]
  }
}

class BondArgsDecoder extends SubstrateTransactionMethodArgsDecoder<BondArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<BondArgs> {
    const controller = decoder.decodeNextMultiAccount(SCALEMultiAddressType.Id)
    const value = decoder.decodeNextCompactInt()
    const payee = decoder.decodeNextEnum((value) => SubstratePayee[SubstratePayee[value]])

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
    return [['value', SCALECompactInt.from(this.args.value)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        amount: this.args.value.toString()
      }
    ]
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
    return [['value', SCALECompactInt.from(this.args.value)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        amount: this.args.value.toString()
      }
    ]
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
    return [['value', SCALECompactInt.from(this.args.value)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        amount: this.args.value.toString()
      }
    ]
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
    return [['slashingSpansNumber', SCALEInt.from(this.args.slashingSpansNumber, 32)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class WithdrawUnbondedArgsDecoder extends SubstrateTransactionMethodArgsDecoder<WithdrawUnbondedArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<WithdrawUnbondedArgs> {
    const slashingSpansNumber = decoder.decodeNextInt(32)

    return {
      bytesDecoded: slashingSpansNumber.bytesDecoded,
      decoded: {
        slashingSpansNumber: slashingSpansNumber.decoded.toNumber()
      }
    }
  }
}

class NominateArgsFactory extends SubstrateTransactionMethodArgsFactory<NominateArgs> {
  public createFields(): [string, SCALEType][] {
    return [
      [
        'targets',
        SCALEArray.from(this.args.targets.map((target) => SCALEMultiAddress.from(target, SCALEMultiAddressType.Id, this.network)))
      ]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: this.args.targets.map((target) => SubstrateAddress.from(target, this.network).getValue())
      }
    ]
  }
}

class NominateArgsDecoder extends SubstrateTransactionMethodArgsDecoder<NominateArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<NominateArgs> {
    const targets = decoder.decodeNextArray((network, runtimeVersion, hex) =>
      SCALEMultiAddress.decode(network, hex, SCALEMultiAddressType.Id, runtimeVersion)
    )

    return {
      bytesDecoded: targets.bytesDecoded,
      decoded: {
        targets: targets.decoded.elements.map((target) => target.toString())
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

class PayoutStakersArgsFactory extends SubstrateTransactionMethodArgsFactory<PayoutStakersArgs> {
  public createFields(): [string, SCALEType][] {
    return [
      ['validatorStash', SCALEAccountId.from(this.args.validator, this.network)],
      ['era', SCALEInt.from(this.args.era, 32)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class PayoutStakersArgsDecoder extends SubstrateTransactionMethodArgsDecoder<PayoutStakersArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<PayoutStakersArgs> {
    const validatorStash = decoder.decodeNextAccountId()
    const era = decoder.decodeNextInt(32)

    return {
      bytesDecoded: era.bytesDecoded + validatorStash.bytesDecoded,
      decoded: {
        validator: validatorStash.decoded.address,
        era: era.decoded.value
      }
    }
  }
}

class SetPayeeArgsFactory extends SubstrateTransactionMethodArgsFactory<SetPayeeArgs> {
  public createFields(): [string, SCALEType][] {
    return [['payee', SCALEEnum.from(this.args.payee)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class SetPayeeArgsDecoder extends SubstrateTransactionMethodArgsDecoder<SetPayeeArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SetPayeeArgs> {
    const payee = decoder.decodeNextEnum((value) => SubstratePayee[SubstratePayee[value]])

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
    return [['controller', SCALEMultiAddress.from(this.args.controller, SCALEMultiAddressType.Id, this.network)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [SubstrateAddress.from(this.args.controller, this.network).getValue()]
      }
    ]
  }
}

class SetControllerArgsDecoder extends SubstrateTransactionMethodArgsDecoder<SetControllerArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SetControllerArgs> {
    const controller = decoder.decodeNextMultiAccount(SCALEMultiAddressType.Id)

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
    return [['calls', SCALEArray.from(this.args.calls)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () =>
      this.args.calls.map((call) => call.toAirGapTransactionParts()).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
  }
}

class SubmitBatchArgsDecoder extends SubstrateTransactionMethodArgsDecoder<SubmitBatchArgs> {
  protected _decode(decoder: SCALEDecoder): SCALEDecodeResult<SubmitBatchArgs> {
    // temporary fixed type
    const calls = decoder.decodeNextArray((network, runtimeVersion, hex) =>
      SubstrateTransactionMethod.decode(network, runtimeVersion, SubstrateTransactionType.COLLECT_PAYOUT, hex)
    )

    return {
      bytesDecoded: calls.bytesDecoded,
      decoded: {
        calls: calls.decoded.elements
      }
    }
  }
}
