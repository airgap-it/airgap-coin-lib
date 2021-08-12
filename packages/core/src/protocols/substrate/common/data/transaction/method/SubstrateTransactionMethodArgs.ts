// tslint:disable: max-classes-per-file
import BigNumber from '../../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../../../../interfaces/IAirGapTransaction'
import { assertFields } from '../../../../../../utils/assert'
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
interface MoonbeamNominateArgs<Network extends SubstrateNetwork> {
  collator: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  amount: number | BigNumber
  collatorNominatorCount: number | BigNumber
  nominationCount: number | BigNumber
}

interface MoonbeamLeaveNominatorsArgs {
  nominationCount: number | BigNumber
}

interface MoonbeamRevokeNominationArgs<Network extends SubstrateNetwork> {
  collator: SubstrateAccountId<SubstrateCompatAddressType[Network]>
}

interface MoonbeamNominatorBondMoreArgs<Network extends SubstrateNetwork> {
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  more: number | BigNumber
}

interface MoonbeamNominatorBondLessArgs<Network extends SubstrateNetwork> {
  candidate: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  less: number | BigNumber
}

export abstract class SubstrateTransactionMethodArgsFactory<T, Network extends SubstrateNetwork> {
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
      case SubstrateTransactionType.M_NOMINATE:
        assertFields('nominate', args, 'collator', 'amount')

        return new MoonbeamNominateArgsFactory(network, args)
      case SubstrateTransactionType.M_LEAVE_NOMINATORS:
        return new MoonbeamLeaveNominatorsArgsFactory(network, args)
      case SubstrateTransactionType.M_REVOKE_NOMINATION:
        assertFields('revokeNomination', args, 'collator')

        return new MoonbeamRevokeNominationArgsFactory(network, args)
      case SubstrateTransactionType.M_NOMINATOR_BOND_MORE:
        assertFields('nominate', args, 'candidate', 'more')

        return new MoonbeamNominatorBondMoreArgsFactory(network, args)
      case SubstrateTransactionType.M_NOMINATOR_BOND_LESS:
        assertFields('nominate', args, 'candidate', 'less')

        return new MoonbeamNominatorBondLessArgsFactory(network, args)
    }
  }

  protected constructor(protected readonly network: Network, protected readonly args: T) {}

  public abstract createFields(): [string, SCALEType][]
  public abstract createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[]
}

export abstract class SubstrateTransactionMethodArgsDecoder<T, Network extends SubstrateNetwork> {
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
      case SubstrateTransactionType.M_NOMINATE:
        return new MoonbeamNominateArgsDecoder()
      case SubstrateTransactionType.M_LEAVE_NOMINATORS:
        return new MoonbeamLeaveNominatorsArgsDecoder()
      case SubstrateTransactionType.M_REVOKE_NOMINATION:
        return new MoonbeamRevokeNominationArgsDecoder()
      case SubstrateTransactionType.M_NOMINATOR_BOND_MORE:
        return new MoonbeamNominatorBondMoreArgsDecoder()
      case SubstrateTransactionType.M_NOMINATOR_BOND_LESS:
        return new MoonbeamNominatorBondLessArgsDecoder()
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
        to: [substrateAddressFactory(this.network).from(this.args.to).getValue()],
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
        to: [substrateAddressFactory(this.network).from(this.args.controller).getValue()],
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
        to: this.args.targets.map((target) => substrateAddressFactory(this.network).from(target).getValue())
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
        to: [substrateAddressFactory(this.network).from(this.args.controller).getValue()]
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

class MoonbeamNominateArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamNominateArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['collator', SCALEAccountId.from(this.args.collator, this.network)],
      ['amount', SCALEInt.from(this.args.amount, 128)],
      ['collatorNominatorCount', SCALEInt.from(this.args.collatorNominatorCount, 32)],
      ['nominationCount', SCALEInt.from(this.args.nominationCount, 32)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.collator).getValue()],
        amount: new BigNumber(this.args.amount).toString()
      }
    ]
  }
}

class MoonbeamNominateArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamNominateArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamNominateArgs<Network>> {
    const collator = decoder.decodeNextAccountId(20)
    const amount = decoder.decodeNextInt(128)
    const collatorNominatorCount = decoder.decodeNextInt(32)
    const nominationCount = decoder.decodeNextInt(32)

    return {
      bytesDecoded: collator.bytesDecoded + amount.bytesDecoded + collatorNominatorCount.bytesDecoded + nominationCount.bytesDecoded,
      decoded: {
        collator: collator.decoded.address,
        amount: amount.decoded.value,
        collatorNominatorCount: collatorNominatorCount.decoded.value,
        nominationCount: nominationCount.decoded.value
      }
    }
  }
}

class MoonbeamLeaveNominatorsArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamLeaveNominatorsArgs,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [['nominationCount', SCALEInt.from(this.args.nominationCount, 32)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => []
  }
}

class MoonbeamLeaveNominatorsArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamLeaveNominatorsArgs,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamLeaveNominatorsArgs> {
    const nominationCount = decoder.decodeNextInt(32)

    return {
      bytesDecoded: nominationCount.bytesDecoded,
      decoded: {
        nominationCount: nominationCount.decoded.value
      }
    }
  }
}

class MoonbeamRevokeNominationArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamRevokeNominationArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [['collator', SCALEAccountId.from(this.args.collator, this.network)]]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.collator).getValue()]
      }
    ]
  }
}

class MoonbeamRevokeNominationArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamRevokeNominationArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamRevokeNominationArgs<Network>> {
    const collator = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: collator.bytesDecoded,
      decoded: {
        collator: collator.decoded.address
      }
    }
  }
}

class MoonbeamNominatorBondMoreArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamNominatorBondMoreArgs<Network>,
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
        to: [substrateAddressFactory(this.network).from(this.args.candidate).getValue()],
        amount: new BigNumber(this.args.more).toString()
      }
    ]
  }
}

class MoonbeamNominatorBondMoreArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamNominatorBondMoreArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamNominatorBondMoreArgs<Network>> {
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

class MoonbeamNominatorBondLessArgsFactory<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsFactory<
  MoonbeamNominatorBondLessArgs<Network>,
  Network
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['candidate', SCALEAccountId.from(this.args.candidate, this.network)],
      ['more', SCALEInt.from(this.args.less, 128)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<IAirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.network).from(this.args.candidate).getValue()],
        amount: new BigNumber(this.args.less).toString()
      }
    ]
  }
}

class MoonbeamNominatorBondLessArgsDecoder<Network extends SubstrateNetwork> extends SubstrateTransactionMethodArgsDecoder<
  MoonbeamNominatorBondLessArgs<Network>,
  Network
> {
  protected _decode(decoder: SCALEDecoder<Network>): SCALEDecodeResult<MoonbeamNominatorBondLessArgs<Network>> {
    const candidate = decoder.decodeNextAccountId(20)
    const more = decoder.decodeNextInt(128)

    return {
      bytesDecoded: candidate.bytesDecoded + more.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address,
        less: more.decoded.value
      }
    }
  }
}
