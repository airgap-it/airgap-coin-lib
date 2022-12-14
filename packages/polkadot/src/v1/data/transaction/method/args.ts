import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'
import {
  scaleAddressFactory,
  SCALEArray,
  SCALECompactInt,
  SCALEDecoder,
  SCALEDecodeResult,
  SCALEEnum,
  SCALEInt,
  SCALEType,
  SubstrateAccountId,
  substrateAddressFactory,
  SubstrateSS58Address,
  SubstrateTransactionMethodArgsDecoder,
  SubstrateTransactionMethodArgsFactory
} from '@airgap/substrate/v1'
import { PolkadotProtocolConfiguration, PolkadotTransactionType } from '../../../types/configuration'
import { SubstratePayee } from '../../staking/SubstratePayee'

export function factories<T extends PolkadotTransactionType>(
  type: T
): Pick<PolkadotProtocolConfiguration['transaction']['types'][T], 'createArgsFactory' | 'createArgsDecoder'> {
  return {
    createArgsFactory(configuration, args) {
      return createArgsFactory(configuration, type, args)
    },
    createArgsDecoder(configuration) {
      return createArgsDecoder(configuration, type)
    }
  }
}

function createArgsFactory<C extends PolkadotProtocolConfiguration>(
  configuration: C,
  type: PolkadotTransactionType,
  args: any
): SubstrateTransactionMethodArgsFactory<any, C> {
  switch (type) {
    case 'bond':
      assertFields(type, args, 'controller', 'value', 'payee')

      return new BondArgsFactory(configuration, args)
    case 'unbond':
      assertFields(type, args, 'value')

      return new UnbondArgsFactory(configuration, args)
    case 'rebond':
      assertFields(type, args, 'value')

      return new RebondArgsFactory(configuration, args)
    case 'bond_extra':
      assertFields(type, args, 'value')

      return new BondExtraArgsFactory(configuration, args)
    case 'withdraw_unbonded':
      assertFields(type, args, 'slashingSpansNumber')

      return new WithdrawUnbondedArgsFactory(configuration, args)
    case 'nominate':
      assertFields(type, args, 'targets')

      return new NominateArgsFactory(configuration, args)
    case 'cancel_nomination':
      return new StopNominatingArgsFactory(configuration, args)
    case 'collect_payout':
      assertFields(type, args, 'eraIndex', 'validators')

      return new PayoutStakersArgsFactory(configuration, args)
    case 'set_payee':
      assertFields(type, args, 'payee')

      return new SetPayeeArgsFactory(configuration, args)
    case 'set_controller':
      assertFields(type, args, 'controller')

      return new SetControllerArgsFactory(configuration, args)
  }
}

function createArgsDecoder<C extends PolkadotProtocolConfiguration>(
  _configuration: C,
  type: PolkadotTransactionType
): SubstrateTransactionMethodArgsDecoder<any, C> {
  switch (type) {
    case 'bond':
      return new BondArgsDecoder()
    case 'unbond':
      return new UnbondArgsDecoder()
    case 'rebond':
      return new RebondArgsDecoder()
    case 'bond_extra':
      return new BondExtraArgsDecoder()
    case 'withdraw_unbonded':
      return new WithdrawUnbondedArgsDecoder()
    case 'nominate':
      return new NominateArgsDecoder()
    case 'cancel_nomination':
      return new StopNominatingArgsDecoder()
    case 'collect_payout':
      return new PayoutStakersArgsDecoder()
    case 'set_payee':
      return new SetPayeeArgsDecoder()
    case 'set_controller':
      return new SetControllerArgsDecoder()
  }
}

interface BondArgs {
  controller: SubstrateAccountId<SubstrateSS58Address>
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
  targets: SubstrateAccountId<SubstrateSS58Address>[]
}

interface StopNominatingArgs {}

interface PayoutStakersArgs {
  validator: SubstrateAccountId<SubstrateSS58Address>
  era: number | BigNumber
}

interface SetPayeeArgs {
  payee: SubstratePayee
}

interface SetControllerArgs {
  controller: SubstrateAccountId<SubstrateSS58Address>
}

class BondArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<BondArgs, C> {
  public createFields(): [string, SCALEType][] {
    return [
      ['controller', scaleAddressFactory(this.configuration).from(this.args.controller, this.configuration)],
      ['value', SCALECompactInt.from(this.args.value)],
      ['payee', SCALEEnum.from(this.args.payee)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.controller).asString()],
        amount: newAmount(this.args.value, 'blockchain')
      }
    ]
  }
}

class BondArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<BondArgs, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<BondArgs> {
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

class UnbondArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<UnbondArgs, C> {
  public createFields(): [string, SCALEType][] {
    return [['value', SCALECompactInt.from(this.args.value)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        amount: newAmount(this.args.value, 'blockchain')
      }
    ]
  }
}

class UnbondArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<UnbondArgs, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<UnbondArgs> {
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: {
        value: value.decoded.value
      }
    }
  }
}

class RebondArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<RebondArgs, C> {
  public createFields(): [string, SCALEType][] {
    return [['value', SCALECompactInt.from(this.args.value)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        amount: newAmount(this.args.value, 'blockchain')
      }
    ]
  }
}

class RebondArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<RebondArgs, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<RebondArgs> {
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: {
        value: value.decoded.value
      }
    }
  }
}

class BondExtraArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<BondExtraArgs, C> {
  public createFields(): [string, SCALEType][] {
    return [['value', SCALECompactInt.from(this.args.value)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        amount: newAmount(this.args.value, 'blockchain')
      }
    ]
  }
}

class BondExtraArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<BondExtraArgs, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<BondExtraArgs> {
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: {
        value: value.decoded.value
      }
    }
  }
}

class WithdrawUnbondedArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  WithdrawUnbondedArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [['slashingSpansNumber', SCALEInt.from(this.args.slashingSpansNumber, 32)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class WithdrawUnbondedArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  WithdrawUnbondedArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<WithdrawUnbondedArgs> {
    const slashingSpansNumber = decoder.decodeNextInt(32)

    return {
      bytesDecoded: slashingSpansNumber.bytesDecoded,
      decoded: {
        slashingSpansNumber: slashingSpansNumber.decoded.toNumber()
      }
    }
  }
}

class NominateArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<NominateArgs, C> {
  public createFields(): [string, SCALEType][] {
    return [
      [
        'targets',
        SCALEArray.from(this.args.targets.map((target) => scaleAddressFactory(this.configuration).from(target, this.configuration)))
      ]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: this.args.targets.map((target) => substrateAddressFactory(this.configuration).from(target).asString())
      }
    ]
  }
}

class NominateArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<NominateArgs, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<NominateArgs> {
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

class StopNominatingArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  StopNominatingArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return []
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class StopNominatingArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  StopNominatingArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<StopNominatingArgs> {
    return {
      bytesDecoded: 0,
      decoded: {}
    }
  }
}

class PayoutStakersArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  PayoutStakersArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [
      ['validatorStash', scaleAddressFactory(this.configuration).from(this.args.validator, this.configuration)],
      ['era', SCALEInt.from(this.args.era, 32)]
    ]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class PayoutStakersArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  PayoutStakersArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<PayoutStakersArgs> {
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

class SetPayeeArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<SetPayeeArgs, C> {
  public createFields(): [string, SCALEType][] {
    return [['payee', SCALEEnum.from(this.args.payee)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => []
  }
}

class SetPayeeArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<SetPayeeArgs, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<SetPayeeArgs> {
    const payee = decoder.decodeNextEnum((value) => SubstratePayee[SubstratePayee[value]])

    return {
      bytesDecoded: payee.bytesDecoded,
      decoded: {
        payee: payee.decoded.value
      }
    }
  }
}

class SetControllerArgsFactory<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsFactory<
  SetControllerArgs,
  C
> {
  public createFields(): [string, SCALEType][] {
    return [['controller', scaleAddressFactory(this.configuration).from(this.args.controller, this.configuration)]]
  }
  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.controller).asString()]
      }
    ]
  }
}

class SetControllerArgsDecoder<C extends PolkadotProtocolConfiguration> extends SubstrateTransactionMethodArgsDecoder<
  SetControllerArgs,
  C
> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<SetControllerArgs> {
    const controller = decoder.decodeNextAccount()

    return {
      bytesDecoded: controller.bytesDecoded,
      decoded: {
        controller: controller.decoded.toString()
      }
    }
  }
}
