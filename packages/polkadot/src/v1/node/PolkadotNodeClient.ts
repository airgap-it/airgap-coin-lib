import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  SCALEAccountId,
  SCALEArray,
  SCALECompactInt,
  SCALEData,
  SCALEEnum,
  SCALEInt,
  SCALETuple,
  SubstrateCommonNodeClient,
  SubstrateRegistration,
  SubstrateSS58Address
} from '@airgap/substrate/v1'

import { PolkadotActiveEraInfo } from '../data/staking/PolkadotActiveEraInfo'
import { PolkadotEraRewardPoints } from '../data/staking/PolkadotEraRewardPoints'
import { PolkadotExposure } from '../data/staking/PolkadotExposure'
import { PolkadotNominations } from '../data/staking/PolkadotNominations'
import { PolkadotPayee } from '../data/staking/PolkadotPayee'
import { PolkadotSlashingSpans } from '../data/staking/PolkadotSlashingSpans'
import { PolkadotStakingLedger } from '../data/staking/PolkadotStakingLedger'
import { PolkadotValidatorPrefs } from '../data/staking/PolkadotValidatorPrefs'
import { PolkadotProtocolConfiguration } from '../types/configuration'

export class PolkadotNodeClient extends SubstrateCommonNodeClient<PolkadotProtocolConfiguration> {
  public constructor(configuration: PolkadotProtocolConfiguration, url: string) {
    super(configuration, url)
    this.registerCallEntrypointEntries([
      this.createCallEndpointEntry('bond', 'Staking', 'bond'),
      this.createCallEndpointEntry('unbond', 'Staking', 'unbond'),
      this.createCallEndpointEntry('bond_extra', 'Staking', 'bond_extra'),
      this.createCallEndpointEntry('withdraw_unbonded', 'Staking', 'withdraw_unbonded'),
      this.createCallEndpointEntry('nominate', 'Staking', 'nominate'),
      this.createCallEndpointEntry('cancel_nomination', 'Staking', 'chill'),
      this.createCallEndpointEntry('collect_payout', 'Staking', 'payout_stakers'),
      this.createCallEndpointEntry('set_payee', 'Staking', 'set_payee'),
      this.createCallEndpointEntry('set_controller', 'Staking', 'set_controller'),
      this.createCallEndpointEntry('rebond', 'Staking', 'rebond')
    ])
  }

  public async getBlockTime(): Promise<BigNumber> {
    return this.getConstant('Babe', 'ExpectedBlockTime').then((constant) => SCALEInt.decode(constant).decoded.value)
  }

  public async getCurrentEraIndex(): Promise<BigNumber | undefined> {
    return this.fromStorage('Staking', 'CurrentEra').then((item) => (item ? SCALEInt.decode(item).decoded.value : undefined))
  }

  public async getBonded(address: SubstrateSS58Address): Promise<SubstrateSS58Address | undefined> {
    return this.fromStorage('Staking', 'Bonded', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? SCALEAccountId.decode(this.configuration, item).decoded.address : undefined
    )
  }

  public async getNominations(address: SubstrateSS58Address): Promise<PolkadotNominations | undefined> {
    return this.fromStorage('Staking', 'Nominators', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? PolkadotNominations.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getRewardPoints(eraIndex: number): Promise<PolkadotEraRewardPoints | undefined> {
    return this.fromStorage('Staking', 'ErasRewardPoints', SCALEInt.from(eraIndex, 32)).then((item) =>
      item ? PolkadotEraRewardPoints.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getValidatorReward(eraIndex: number): Promise<BigNumber | undefined> {
    return this.fromStorage('Staking', 'ErasValidatorReward', SCALEInt.from(eraIndex, 32)).then((item) =>
      item ? SCALEInt.decode(item).decoded.value : undefined
    )
  }

  public async getStakersClipped(eraIndex: number, validator: SubstrateSS58Address): Promise<PolkadotExposure | undefined> {
    return this.fromStorage(
      'Staking',
      'ErasStakersClipped',
      SCALEInt.from(eraIndex, 32),
      SCALEAccountId.from(validator, this.configuration)
    ).then((item) => (item ? PolkadotExposure.decode(this.configuration, this.runtimeVersion, item) : undefined))
  }

  public async getRewardDestination(address: SubstrateSS58Address): Promise<PolkadotPayee | undefined> {
    return this.fromStorage('Staking', 'Payee', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? SCALEEnum.decode(item, (hex) => PolkadotPayee[PolkadotPayee[hex] as keyof typeof PolkadotPayee]).decoded.value : undefined
    )
  }

  public async getStakingLedger(address: SubstrateSS58Address): Promise<PolkadotStakingLedger | undefined> {
    return this.fromStorage('Staking', 'Ledger', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? PolkadotStakingLedger.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getValidators(): Promise<SubstrateSS58Address[] | undefined> {
    return this.fromStorage('Session', 'Validators').then((items) =>
      items
        ? SCALEArray.decode(this.configuration, this.runtimeVersion, items, (network, _, hex) =>
            SCALEAccountId.decode(network, hex)
          ).decoded.elements.map((encoded) => encoded.address)
        : undefined
    )
  }

  public async getValidatorExposure(eraIndex: number, address: SubstrateSS58Address): Promise<PolkadotExposure | undefined> {
    return this.fromStorage('Staking', 'ErasStakers', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(address, this.configuration)).then(
      (item) => (item ? PolkadotExposure.decode(this.configuration, this.runtimeVersion, item) : undefined)
    )
  }

  public async getIdentityOf(address: SubstrateSS58Address): Promise<SubstrateRegistration | undefined> {
    return this.fromStorage('Identity', 'IdentityOf', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? SubstrateRegistration.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getSuperOf(
    address: SubstrateSS58Address
  ): Promise<SCALETuple<SCALEAccountId<PolkadotProtocolConfiguration>, SCALEData> | undefined> {
    return this.fromStorage('Identity', 'SuperOf', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item
        ? SCALETuple.decode(
            this.configuration,
            this.runtimeVersion,
            item,
            (network, _, hex) => SCALEAccountId.decode(network, hex),
            (_network, _runtimeVersion, hex) => SCALEData.decode(hex)
          ).decoded
        : undefined
    )
  }

  public async getSubsOf(
    address: SubstrateSS58Address
  ): Promise<SCALETuple<SCALECompactInt, SCALEArray<SCALEAccountId<PolkadotProtocolConfiguration>>> | undefined> {
    return this.fromStorage('Identity', 'SubsOf', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item
        ? SCALETuple.decode(
            this.configuration,
            this.runtimeVersion,
            item,
            (_network, _runtimeVersion, hex) => SCALECompactInt.decode(hex),
            (network, _, hex) =>
              SCALEArray.decode(network, _, hex, (innerNetwork, _, innerHex) => SCALEAccountId.decode(innerNetwork, innerHex))
          ).decoded
        : undefined
    )
  }

  public async getValidatorPrefs(eraIndex: number, address: SubstrateSS58Address): Promise<PolkadotValidatorPrefs | undefined> {
    return this.fromStorage(
      'Staking',
      'ErasValidatorPrefs',
      SCALEInt.from(eraIndex, 32),
      SCALEAccountId.from(address, this.configuration)
    ).then((item) => (item ? PolkadotValidatorPrefs.decode(this.configuration, this.runtimeVersion, item) : undefined))
  }

  public async getExpectedEraDuration(): Promise<BigNumber | undefined> {
    const constants = await Promise.all([
      this.getConstant('Babe', 'ExpectedBlockTime'),
      this.getConstant('Babe', 'EpochDuration'),
      this.getConstant('Staking', 'SessionsPerEra')
    ]).then((constants) => constants.map((constant) => (constant ? SCALEInt.decode(constant).decoded.value : undefined)))

    if (constants.some((constant) => constant === undefined)) {
      return undefined
    }

    const expectedBlockTime = constants[0]!
    const epochDuration = constants[1]!
    const sessionsPerEra = constants[2]!

    return expectedBlockTime.multipliedBy(epochDuration).multipliedBy(sessionsPerEra)
  }

  public async getActiveEraInfo(): Promise<PolkadotActiveEraInfo | undefined> {
    return this.fromStorage('Staking', 'ActiveEra').then((item) =>
      item ? PolkadotActiveEraInfo.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getSlashingSpan(address: SubstrateSS58Address): Promise<PolkadotSlashingSpans | undefined> {
    return this.fromStorage('Staking', 'SlashingSpans', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? PolkadotSlashingSpans.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getMinNominatorBond(): Promise<BigNumber | undefined> {
    return this.fromStorage('Staking', 'MinNominatorBond').then((value) => (value ? SCALEInt.decode(value).decoded.value : undefined))
  }
}

// Supported Calls

export const STORAGE_ENTRIES = {
  Identity: ['IdentityOf', 'SuperOf', 'SubsOf'] as const,
  Staking: [
    'Bonded',
    'Ledger',
    'Payee',
    'Nominators',
    'CurrentEra',
    'ActiveEra',
    'ErasStakers',
    'ErasStakersClipped',
    'ErasValidatorPrefs',
    'ErasValidatorReward',
    'ErasRewardPoints',
    'SlashingSpans',
    'MinNominatorBond'
  ] as const,
  Session: ['Validators'] as const
}

export const CALLS = {
  Staking: [
    'bond',
    'bond_extra',
    'unbond',
    'withdraw_unbonded',
    'nominate',
    'chill',
    'set_payee',
    'set_controller',
    'payout_stakers',
    'rebond'
  ] as const
}

export const CONSTANTS = {
  Babe: ['EpochDuration', 'ExpectedBlockTime'] as const,
  Staking: ['SessionsPerEra'] as const
}
