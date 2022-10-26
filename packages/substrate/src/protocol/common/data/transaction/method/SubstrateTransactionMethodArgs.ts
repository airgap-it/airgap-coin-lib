// tslint:disable: max-classes-per-file
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import {
  scaleAddressFactory,
  SubstrateAccountId,
  substrateAddressFactory,
  SubstrateCompatAddressType
} from '../../../../compat/SubstrateCompatAddress'
import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALEAccountId } from '../../scale/type/SCALEAccountId'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALECompactInt } from '../../scale/type/SCALECompactInt'
import { SCALEEnum } from '../../scale/type/SCALEEnum'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SCALEType } from '../../scale/type/SCALEType'
import { SubstratePayee } from '../../staking/SubstratePayee'
import { SubstrateTransactionType } from '../SubstrateTransaction'

import { SubstrateTransactionMethod } from './SubstrateTransactionMethod'

interface TransferArgs<Network extends SubstrateNetwork> {
  to: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  value: number | BigNumber
}

interface BondArgs<Network extends SubstrateNetwork> {
  controller: SubstrateAccountId<SubstrateCompatAddressType[Network]>
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

interface NominateArgs<Network extends SubstrateNetwork> {
  targets: SubstrateAccountId<SubstrateCompatAddressType[Network]>[]
}

interface StopNominatingArgs {}

interface PayoutStakersArgs<Network extends SubstrateNetwork> {
  validator: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  era: number | BigNumber
}

interface SetPayeeArgs {
  payee: SubstratePayee
}

interface SetControllerArgs<Network extends SubstrateNetwork> {
  controller: SubstrateAccountId<SubstrateCompatAddressType[Network]>
}

interface SubmitBatchArgs {
  calls: SubstrateTransactionMethod[]
}

// Moonbeam, TODO: separate
interface MoonbeamDelegateArgs<Network extends SubstrateNetwork> {
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  amount: number | BigNumber
  candidateDelegationCount: number | BigNumber
  delegationCount: number | BigNumber
}

interface MoonbeamScheduleLeaveDelegatorsArgs {}

interface MoonbeamExecuteLeaveDelegatorsArgs<Network extends SubstrateNetwork> {
  delegator: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  delegationCount: number | BigNumber
}

interface MoonbeamCancelLeaveDelegatorsArgs {}

interface MoonbeamScheduleRevokeDelegationArgs<Network extends SubstrateNetwork> {
  collator: SubstrateAccountId<SubstrateCompatAddressType[Network]>
}

interface MoonbeamExecuteDelegationRequestArgs<Network extends SubstrateNetwork> {
  delegator: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
}

interface MoonbeamCancelDelegationRequestArgs<Network extends SubstrateNetwork> {
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
}

interface MoonbeamDelegatorBondMoreArgs<Network extends SubstrateNetwork> {
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  more: number | BigNumber
}

interface MoonbeamScheduleDelegatorBondLessArgs<Network extends SubstrateNetwork> {
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  less: number | BigNumber
}

interface MoonbeamExecuteCandidateBondLessArgs<Network extends SubstrateNetwork> {
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
}

interface MoonbeamCancelCandidateBondLessArgs<Network extends SubstrateNetwork> {}

export abstract class SubstrateTransactionMethodArgsFactory<T, Network extends SubstrateNetwork> {
  // tslint:disable-next-line: cyclomatic-complexity
  public static create<Network extends SubstrateNetwork>(
    network: Network,
    type: SubstrateTransactionType,
    args: any
  ): SubstrateTransactionMethodArgsFactory<any, Network> {
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

      case SubstrateTransactionType.M_DELEGATE:
        assertFields('delegate', args, 'candidate', 'amount', 'candidateDelegationCount', 'delegationCount')

        return new MoonbeamDelegateArgsFactory(network, args)
      case SubstrateTransactionType.M_SCHEDULE_LEAVE_DELEGATORS:
        return new MoonbeamScheduleLeaveDelegatorsArgsFactory(network, args)
      case SubstrateTransactionType.M_EXECUTE_LEAVE_DELEGATORS:
        assertFields('executeLeaveDelegators', args, 'delegator', 'delegationCount')

        return new MoonbeamExecuteLeaveDelegatorsArgsFactory(network, args)
      case SubstrateTransactionType.M_CANCEL_LEAVE_DELEGATORS:
        return new MoonbeamCancelLeaveDelegatorsArgsFactory(network, args)
      case SubstrateTransactionType.M_SCHEDULE_REVOKE_DELGATION:
        assertFields('scheduleRevokeDelegation', args, 'collator')

        return new MoonbeamScheduleRevokeDelegationArgsFactory(network, args)
      case SubstrateTransactionType.M_EXECUTE_DELGATION_REQUEST:
        assertFields('executeDelegationRequest', args, 'delegator', 'candidate')

        return new MoonbeamExecuteDelegationRequestArgsFactory(network, args)
      case SubstrateTransactionType.M_CANCEL_DELEGATION_REQUEST:
        assertFields('cancelDelegationRequest', args, 'candidate')

        return new MoonbeamCancelDelegationRequestArgsFactory(network, args)
      case SubstrateTransactionType.M_DELEGATOR_BOND_MORE:
        assertFields('delegatorBondMore', args, 'candidate', 'more')

        return new MoonbeamDelegatorBondMoreArgsFactory(network, args)
      case SubstrateTransactionType.M_SCHEDULE_DELEGATOR_BOND_LESS:
        assertFields('scheduleDelegatorBondLess', args, 'candidate', 'less')

        return new MoonbeamScheduleDelegatorBondLessArgsFactory(network, args)
      case SubstrateTransactionType.M_EXECUTE_CANDIDATE_BOND_LESS:
        assertFields('scheduleDelegatorBondLess', args, 'candidate')

        return new MoonbeamExecuteCandidateBondLessArgsFactory(network, args)
      case SubstrateTransactionType.M_CANCEL_CANDIDATE_BOND_LESS:
        return new MoonbeamCancelCandidateBondLessArgsFactory(network, args)
    }
  }

  protected constructor(protected readonly network: Network, protected readonly args: T) {}

  public abstract createFields(): [string, SCALEType][]
  public abstract createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[]
}

export abstract class SubstrateTransactionMethodArgsDecoder<T, Network extends SubstrateNetwork> {
  // tslint:disable-next-line: cyclomatic-complexity
  public static create<Network extends SubstrateNetwork>(
    type: SubstrateTransactionType
  ): SubstrateTransactionMethodArgsDecoder<any, Network> {
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

      case SubstrateTransactionType.M_DELEGATE:
        return new MoonbeamDelegateArgsDecoder()
      case SubstrateTransactionType.M_SCHEDULE_LEAVE_DELEGATORS:
        return new MoonbeamScheduleLeaveDelegatorsArgsDecoder()
      case SubstrateTransactionType.M_EXECUTE_LEAVE_DELEGATORS:
        return new MoonbeamExecuteLeaveDelegatorsArgsDecoder()
      case SubstrateTransactionType.M_CANCEL_LEAVE_DELEGATORS:
        return new MoonbeamCancelLeaveDelegatorsArgsDecoder()
      case SubstrateTransactionType.M_SCHEDULE_REVOKE_DELGATION:
        return new MoonbeamScheduleRevokeDelegationArgsDecoder()
      case SubstrateTransactionType.M_EXECUTE_DELGATION_REQUEST:
        return new MoonbeamExecuteDelegationRequestArgsDecoder()
      case SubstrateTransactionType.M_CANCEL_DELEGATION_REQUEST:
        return new MoonbeamCancelDelegationRequestArgsDecoder()
      case SubstrateTransactionType.M_DELEGATOR_BOND_MORE:
        return new MoonbeamDelegatorBondMoreArgsDecoder()
      case SubstrateTransactionType.M_SCHEDULE_DELEGATOR_BOND_LESS:
        return new MoonbeamScheduleDelegatorBondLessArgsDecoder()
      case SubstrateTransactionType.M_EXECUTE_CANDIDATE_BOND_LESS:
        return new MoonbeamExecuteCandidateBondLessArgsDecoder()
      case SubstrateTransactionType.M_CANCEL_CANDIDATE_BOND_LESS:
        return new MoonbeamCancelCandidateBondLessArgsDecoder()
    }
  }

  public decode(network: Network, runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<T> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    return this._decode(decoder)
  }

  protected abstract _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<T>
}

class TransferArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<TransferArgs<Network>, Network> {
  public createFields(): [string, SCALEType][] {
    return [
      ['destination', scaleAddressFactory(this.network).from(this.args.to, this.network)],
      ['value', SCALECompactInt.from(this.args.value)]
    ]
  }

  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.to).asString()],
        amount: this.args.value.toString()
      }
    ]
  }
}

class TransferArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<TransferArgs<Network>, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<TransferArgs<Network>> {
    const destination = decoder.decodeNextAccount()
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

class BondArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<BondArgs<Network>, Network> {
  public createFields(): [string, SCALEType][] {
    return [
      ['controller', scaleAddressFactory(this.network).from(this.args.controller, this.network)],
      ['value', SCALECompactInt.from(this.args.value)],
      ['payee', SCALEEnum.from(this.args.payee)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.controller).asString()],
        amount: this.args.value.toString()
      }
    ]
  }
}

class BondArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<BondArgs<Network>, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<BondArgs<Network>> {
    const controller = decoder.decodeNextAccount()
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

class UnbondArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<UnbondArgs, Network> {
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

class UnbondArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<UnbondArgs, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<UnbondArgs> {
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: {
        value: value.decoded.value
      }
    }
  }
}

class RebondArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<RebondArgs, Network> {
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

class RebondArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<RebondArgs, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<RebondArgs> {
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: {
        value: value.decoded.value
      }
    }
  }
}

class BondExtraArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<BondExtraArgs, Network> {
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

class BondExtraArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<BondExtraArgs, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<BondExtraArgs> {
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: {
        value: value.decoded.value
      }
    }
  }
}

class WithdrawUnbondedArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  WithdrawUnbondedArgs,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [['slashingSpansNumber', SCALEInt.from(this.args.slashingSpansNumber, 32)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class WithdrawUnbondedArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  WithdrawUnbondedArgs,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<WithdrawUnbondedArgs> {
    const slashingSpansNumber = decoder.decodeNextInt(32)

    return {
      bytesDecoded: slashingSpansNumber.bytesDecoded,
      decoded: {
        slashingSpansNumber: slashingSpansNumber.decoded.toNumber()
      }
    }
  }
}

class NominateArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<NominateArgs<Network>, Network> {
  public createFields(): [string, SCALEType][] {
    return [['targets', SCALEArray.from(this.args.targets.map((target) => scaleAddressFactory(this.network).from(target, this.network)))]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: this.args.targets.map((target) => substrateAddressFactory(this.network).from(target).asString())
      }
    ]
  }
}

class NominateArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<NominateArgs<Network>, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<NominateArgs<Network>> {
    const targets = decoder.decodeNextArray((network, runtimeVersion, hex) =>
      scaleAddressFactory(network).decode(network, runtimeVersion, hex)
    )

    return {
      bytesDecoded: targets.bytesDecoded,
      decoded: {
        targets: targets.decoded.elements.map((target) => target.toString())
      }
    }
  }
}

class StopNominatingArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  StopNominatingArgs,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class StopNominatingArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  StopNominatingArgs,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<StopNominatingArgs> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}

class PayoutStakersArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  PayoutStakersArgs<Network>,
  Network
> {
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

class PayoutStakersArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  PayoutStakersArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<PayoutStakersArgs<Network>> {
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

class SetPayeeArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<SetPayeeArgs, Network> {
  public createFields(): [string, SCALEType][] {
    return [['payee', SCALEEnum.from(this.args.payee)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class SetPayeeArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<SetPayeeArgs, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<SetPayeeArgs> {
    const payee = decoder.decodeNextEnum((value) => SubstratePayee[SubstratePayee[value]])

    return {
      bytesDecoded: payee.bytesDecoded,
      decoded: {
        payee: payee.decoded.value
      }
    }
  }
}

class SetControllerArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  SetControllerArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [['controller', scaleAddressFactory(this.network).from(this.args.controller, this.network)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.controller).asString()]
      }
    ]
  }
}

class SetControllerArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  SetControllerArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<SetControllerArgs<Network>> {
    const controller = decoder.decodeNextAccount()

    return {
      bytesDecoded: controller.bytesDecoded,
      decoded: {
        controller: controller.decoded.toString()
      }
    }
  }
}

class SubmitBatchArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<SubmitBatchArgs, Network> {
  public createFields(): [string, SCALEType][] {
    return [['calls', SCALEArray.from(this.args.calls)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () =>
      this.args.calls.map((call) => call.toAirGapTransactionParts()).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
  }
}

class SubmitBatchArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<SubmitBatchArgs, Network> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<SubmitBatchArgs> {
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

class MoonbeamDelegateArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamDelegateArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['collator', SCALEAccountId.from(this.args.candidate, this.network)],
      ['amount', SCALEInt.from(this.args.amount, 128)],
      ['candidateDelegationCount', SCALEInt.from(this.args.candidateDelegationCount, 32)],
      ['delegationCount', SCALEInt.from(this.args.delegationCount, 32)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.candidate).asString()],
        amount: new BigNumber(this.args.amount).toString()
      }
    ]
  }
}

class MoonbeamDelegateArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamDelegateArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamDelegateArgs<Network>> {
    const candidate = decoder.decodeNextAccountId(20)
    const amount = decoder.decodeNextInt(128)
    const candidateDelegationCount = decoder.decodeNextInt(32)
    const delegationCount = decoder.decodeNextInt(32)

    return {
      bytesDecoded: candidate.bytesDecoded + amount.bytesDecoded + candidateDelegationCount.bytesDecoded + delegationCount.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address,
        amount: amount.decoded.value,
        candidateDelegationCount: candidateDelegationCount.decoded.value,
        delegationCount: delegationCount.decoded.value
      }
    }
  }
}

class MoonbeamScheduleLeaveDelegatorsArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamScheduleLeaveDelegatorsArgs,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class MoonbeamScheduleLeaveDelegatorsArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamScheduleLeaveDelegatorsArgs,
  Network
> {
  protected _decode(_decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamScheduleLeaveDelegatorsArgs> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}

class MoonbeamExecuteLeaveDelegatorsArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamExecuteLeaveDelegatorsArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['delegator', SCALEAccountId.from(this.args.delegator, this.network)],
      ['delegationCount', SCALEInt.from(this.args.delegationCount, 32)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class MoonbeamExecuteLeaveDelegatorsArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamExecuteLeaveDelegatorsArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamExecuteLeaveDelegatorsArgs<Network>> {
    const delegator = decoder.decodeNextAccountId(20)
    const delegationCount = decoder.decodeNextInt(32)

    return {
      bytesDecoded: delegator.bytesDecoded + delegationCount.bytesDecoded,
      decoded: {
        delegator: delegator.decoded.address,
        delegationCount: delegationCount.decoded.value
      }
    }
  }
}

class MoonbeamCancelLeaveDelegatorsArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamCancelLeaveDelegatorsArgs,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class MoonbeamCancelLeaveDelegatorsArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamCancelLeaveDelegatorsArgs,
  Network
> {
  protected _decode(_decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamCancelLeaveDelegatorsArgs> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}

class MoonbeamScheduleRevokeDelegationArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamScheduleRevokeDelegationArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [['collator', SCALEAccountId.from(this.args.collator, this.network)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.collator).asString()]
      }
    ]
  }
}

class MoonbeamScheduleRevokeDelegationArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamScheduleRevokeDelegationArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamScheduleRevokeDelegationArgs<Network>> {
    const collator = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: collator.bytesDecoded,
      decoded: {
        collator: collator.decoded.address
      }
    }
  }
}

class MoonbeamExecuteDelegationRequestArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamExecuteDelegationRequestArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['delegator', SCALEAccountId.from(this.args.delegator, this.network)],
      ['candidate', SCALEAccountId.from(this.args.candidate, this.network)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        from: [substrateAddressFactory(this.network).from(this.args.delegator).asString()],
        to: [substrateAddressFactory(this.network).from(this.args.candidate).asString()]
      }
    ]
  }
}

class MoonbeamExecuteDelegationRequestArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamExecuteDelegationRequestArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamExecuteDelegationRequestArgs<Network>> {
    const delegator = decoder.decodeNextAccountId(20)
    const candidate = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: delegator.bytesDecoded + candidate.bytesDecoded,
      decoded: {
        delegator: delegator.decoded.address,
        candidate: candidate.decoded.address
      }
    }
  }
}

class MoonbeamCancelDelegationRequestArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamCancelDelegationRequestArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [['candidate', SCALEAccountId.from(this.args.candidate, this.network)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.candidate).asString()]
      }
    ]
  }
}

class MoonbeamCancelDelegationRequestArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamCancelDelegationRequestArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamCancelDelegationRequestArgs<Network>> {
    const candidate = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: candidate.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address
      }
    }
  }
}

class MoonbeamDelegatorBondMoreArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamDelegatorBondMoreArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['candidate', SCALEAccountId.from(this.args.candidate, this.network)],
      ['more', SCALEInt.from(this.args.more, 128)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.candidate).asString()],
        amount: new BigNumber(this.args.more).toString()
      }
    ]
  }
}

class MoonbeamDelegatorBondMoreArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamDelegatorBondMoreArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamDelegatorBondMoreArgs<Network>> {
    const candidate = decoder.decodeNextAccountId(20)
    const more = decoder.decodeNextInt(128)

    return {
      bytesDecoded: candidate.bytesDecoded + more.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address,
        more: more.decoded.value
      }
    }
  }
}

class MoonbeamScheduleDelegatorBondLessArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamScheduleDelegatorBondLessArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['candidate', SCALEAccountId.from(this.args.candidate, this.network)],
      ['less', SCALEInt.from(this.args.less, 128)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.candidate).asString()],
        amount: new BigNumber(this.args.less).toString()
      }
    ]
  }
}

class MoonbeamScheduleDelegatorBondLessArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamScheduleDelegatorBondLessArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamScheduleDelegatorBondLessArgs<Network>> {
    const candidate = decoder.decodeNextAccountId(20)
    const less = decoder.decodeNextInt(128)

    return {
      bytesDecoded: candidate.bytesDecoded + less.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address,
        less: less.decoded.value
      }
    }
  }
}

class MoonbeamExecuteCandidateBondLessArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamExecuteCandidateBondLessArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [['candidate', SCALEAccountId.from(this.args.candidate, this.network)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.candidate).asString()]
      }
    ]
  }
}

class MoonbeamExecuteCandidateBondLessArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamExecuteCandidateBondLessArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamExecuteCandidateBondLessArgs<Network>> {
    const candidate = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: candidate.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address
      }
    }
  }
}

class MoonbeamCancelCandidateBondLessArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamCancelCandidateBondLessArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class MoonbeamCancelCandidateBondLessArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamCancelCandidateBondLessArgs<Network>,
  Network
> {
  protected _decode(_decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamCancelCandidateBondLessArgs<Network>> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}
