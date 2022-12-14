// tslint:disable: max-classes-per-file
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'
import {
  scaleAddressFactory,
  SCALEDecoder,
  SCALEDecodeResult,
  SCALEInt,
  SCALEType,
  SubstrateAccountId,
  substrateAddressFactory,
  SubstrateEthAddress,
  SubstrateTransactionMethodArgsDecoder,
  SubstrateTransactionMethodArgsFactory
} from '@airgap/substrate/v1'

import { MoonbeamProtocolConfiguration, MoonbeamTransactionType } from '../../../types/configuration'

export function factories<T extends MoonbeamTransactionType>(
  type: T
): Pick<MoonbeamProtocolConfiguration['transaction']['types'][T], 'createArgsFactory' | 'createArgsDecoder'> {
  return {
    createArgsFactory(configuration, args) {
      return createArgsFactory(configuration, type, args)
    },
    createArgsDecoder(configuration) {
      return createArgsDecoder(configuration, type)
    }
  }
}

interface DelegateArgs {
  candidate: SubstrateAccountId<SubstrateEthAddress>
  amount: number | BigNumber
  candidateDelegationCount: number | BigNumber
  delegationCount: number | BigNumber
}

interface ScheduleLeaveDelegatorsArgs {}

interface ExecuteLeaveDelegatorsArgs {
  delegator: SubstrateAccountId<SubstrateEthAddress>
  delegationCount: number | BigNumber
}

interface CancelLeaveDelegatorsArgs {}

interface ScheduleRevokeDelegationArgs {
  collator: SubstrateAccountId<SubstrateEthAddress>
}

interface ExecuteDelegationRequestArgs {
  delegator: SubstrateAccountId<SubstrateEthAddress>
  candidate: SubstrateAccountId<SubstrateEthAddress>
}

interface CancelDelegationRequestArgs {
  candidate: SubstrateAccountId<SubstrateEthAddress>
}

interface DelegatorBondMoreArgs {
  candidate: SubstrateAccountId<SubstrateEthAddress>
  more: number | BigNumber
}

interface ScheduleDelegatorBondLessArgs {
  candidate: SubstrateAccountId<SubstrateEthAddress>
  less: number | BigNumber
}

interface ExecuteCandidateBondLessArgs {
  candidate: SubstrateAccountId<SubstrateEthAddress>
}

interface CancelCandidateBondLessArgs {}

class DelegateArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<DelegateArgs, C> {
  public createFields(): [string, SCALEType][] {
    return [
      ['collator', scaleAddressFactory(this.configuration).from(this.args.candidate, this.configuration)],
      ['amount', SCALEInt.from(this.args.amount, 128)],
      ['candidateDelegationCount', SCALEInt.from(this.args.candidateDelegationCount, 32)],
      ['delegationCount', SCALEInt.from(this.args.delegationCount, 32)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.candidate).asString()],
        amount: newAmount(this.args.amount, 'blockchain')
      }
    ]
  }
}

class DelegateArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<DelegateArgs, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<DelegateArgs> {
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

class ScheduleLeaveDelegatorsArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  ScheduleLeaveDelegatorsArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class ScheduleLeaveDelegatorsArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  ScheduleLeaveDelegatorsArgs,
  C
> {
  protected _decode(_decoder: SCALEDecoder<C>): SCALEDecodeResult<ScheduleLeaveDelegatorsArgs> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}

class ExecuteLeaveDelegatorsArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  ExecuteLeaveDelegatorsArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['delegator', scaleAddressFactory(this.configuration).from(this.args.delegator, this.configuration)],
      ['delegationCount', SCALEInt.from(this.args.delegationCount, 32)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class ExecuteLeaveDelegatorsArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  ExecuteLeaveDelegatorsArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<ExecuteLeaveDelegatorsArgs> {
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

class CancelLeaveDelegatorsArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  CancelLeaveDelegatorsArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class CancelLeaveDelegatorsArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  CancelLeaveDelegatorsArgs,
  C
> {
  protected _decode(_decoder: SCALEDecoder<C>): SCALEDecodeResult<CancelLeaveDelegatorsArgs> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}

class ScheduleRevokeDelegationArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  ScheduleRevokeDelegationArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [['collator', scaleAddressFactory(this.configuration).from(this.args.collator, this.configuration)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.collator).asString()]
      }
    ]
  }
}

class ScheduleRevokeDelegationArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  ScheduleRevokeDelegationArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<ScheduleRevokeDelegationArgs> {
    const collator = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: collator.bytesDecoded,
      decoded: {
        collator: collator.decoded.address
      }
    }
  }
}

class ExecuteDelegationRequestArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  ExecuteDelegationRequestArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['delegator', scaleAddressFactory(this.configuration).from(this.args.delegator, this.configuration)],
      ['candidate', scaleAddressFactory(this.configuration).from(this.args.candidate, this.configuration)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        from: [substrateAddressFactory(this.configuration).from(this.args.delegator).asString()],
        to: [substrateAddressFactory(this.configuration).from(this.args.candidate).asString()]
      }
    ]
  }
}

class ExecuteDelegationRequestArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  ExecuteDelegationRequestArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<ExecuteDelegationRequestArgs> {
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

class CancelDelegationRequestArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  CancelDelegationRequestArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [['candidate', scaleAddressFactory(this.configuration).from(this.args.candidate, this.configuration)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.candidate).asString()]
      }
    ]
  }
}

class CancelDelegationRequestArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  CancelDelegationRequestArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<CancelDelegationRequestArgs> {
    const candidate = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: candidate.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address
      }
    }
  }
}

class DelegatorBondMoreArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  DelegatorBondMoreArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['candidate', scaleAddressFactory(this.configuration).from(this.args.candidate, this.configuration)],
      ['more', SCALEInt.from(this.args.more, 128)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.candidate).asString()],
        amount: newAmount(this.args.more, 'blockchain')
      }
    ]
  }
}

class DelegatorBondMoreArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  DelegatorBondMoreArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<DelegatorBondMoreArgs> {
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

class ScheduleDelegatorBondLessArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  ScheduleDelegatorBondLessArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['candidate', scaleAddressFactory(this.configuration).from(this.args.candidate, this.configuration)],
      ['less', SCALEInt.from(this.args.less, 128)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.candidate).asString()],
        amount: newAmount(this.args.less, 'blockchain')
      }
    ]
  }
}

class ScheduleDelegatorBondLessArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  ScheduleDelegatorBondLessArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<ScheduleDelegatorBondLessArgs> {
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

class ExecuteCandidateBondLessArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  ExecuteCandidateBondLessArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [['candidate', scaleAddressFactory(this.configuration).from(this.args.candidate, this.configuration)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.candidate).asString()]
      }
    ]
  }
}

class ExecuteCandidateBondLessArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  ExecuteCandidateBondLessArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<ExecuteCandidateBondLessArgs> {
    const candidate = decoder.decodeNextAccountId(20)

    return {
      bytesDecoded: candidate.bytesDecoded,
      decoded: {
        candidate: candidate.decoded.address
      }
    }
  }
}

class CancelCandidateBondLessArgsFactory<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  CancelCandidateBondLessArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class CancelCandidateBondLessArgsDecoder<C extends MoonbeamProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  CancelCandidateBondLessArgs,
  C
> {
  protected _decode(_decoder: SCALEDecoder<C>): SCALEDecodeResult<CancelCandidateBondLessArgs> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}

function createArgsFactory<C extends MoonbeamProtocolConfiguration>(
  configuration: C,
  type: MoonbeamTransactionType,
  args: any
): SubstrateTransactionMethodArgsFactory<any, C> {
  // tslint:disable-next-line: switch-default
  switch (type) {
    case 'delegate':
      assertFields(type, args, 'candidate', 'amount', 'candidateDelegationCount', 'delegationCount')

      return new DelegateArgsFactory(configuration, args)
    case 'schedule_leave_delegators':
      return new ScheduleLeaveDelegatorsArgsFactory(configuration, args)
    case 'execute_leave_delegators':
      assertFields(type, args, 'delegator', 'delegationCount')

      return new ExecuteLeaveDelegatorsArgsFactory(configuration, args)
    case 'cancel_leave_delegators':
      return new CancelLeaveDelegatorsArgsFactory(configuration, args)
    case 'schedule_revoke_delegation':
      assertFields(type, args, 'collator')

      return new ScheduleRevokeDelegationArgsFactory(configuration, args)
    case 'execute_delegation_request':
      assertFields(type, args, 'delegator', 'candidate')

      return new ExecuteDelegationRequestArgsFactory(configuration, args)
    case 'cancel_delegation_request':
      assertFields(type, args, 'candidate')

      return new CancelDelegationRequestArgsFactory(configuration, args)
    case 'delegator_bond_more':
      assertFields(type, args, 'candidate', 'more')

      return new DelegatorBondMoreArgsFactory(configuration, args)
    case 'schedule_delegator_bond_less':
      assertFields(type, args, 'candidate', 'less')

      return new ScheduleDelegatorBondLessArgsFactory(configuration, args)
    case 'execute_candidate_bond_less':
      assertFields(type, args, 'candidate')

      return new ExecuteCandidateBondLessArgsFactory(configuration, args)
    case 'cancel_candidate_bond_less':
      return new CancelCandidateBondLessArgsFactory(configuration, args)
  }
}

function createArgsDecoder<C extends MoonbeamProtocolConfiguration>(
  _configuration: C,
  type: MoonbeamTransactionType
): SubstrateTransactionMethodArgsDecoder<any, C> {
  // tslint:disable-next-line: switch-default
  switch (type) {
    case 'delegate':
      return new DelegateArgsDecoder()
    case 'schedule_leave_delegators':
      return new ScheduleLeaveDelegatorsArgsDecoder()
    case 'execute_leave_delegators':
      return new ExecuteLeaveDelegatorsArgsDecoder()
    case 'cancel_leave_delegators':
      return new CancelLeaveDelegatorsArgsDecoder()
    case 'schedule_revoke_delegation':
      return new ScheduleRevokeDelegationArgsDecoder()
    case 'execute_delegation_request':
      return new ExecuteDelegationRequestArgsDecoder()
    case 'cancel_delegation_request':
      return new CancelDelegationRequestArgsDecoder()
    case 'delegator_bond_more':
      return new DelegatorBondMoreArgsDecoder()
    case 'schedule_delegator_bond_less':
      return new ScheduleDelegatorBondLessArgsDecoder()
    case 'execute_candidate_bond_less':
      return new ExecuteCandidateBondLessArgsDecoder()
    case 'cancel_candidate_bond_less':
      return new CancelCandidateBondLessArgsDecoder()
  }
}
