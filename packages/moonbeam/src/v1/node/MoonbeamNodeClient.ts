import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALEAccountId, SCALEArray, SCALEInt, SubstrateCommonNodeClient, SubstrateEthAddress } from '@airgap/substrate/v1'

import { MoonbeamCandidateMetadata } from '../data/staking/MoonbeamCandidateMetadata'
import { MoonbeamDelegationScheduledRequests } from '../data/staking/MoonbeamDelegationScheduledRequests'
import { MoonbeamDelegator } from '../data/staking/MoonbeamDelegator'
import { MoonbeamRoundInfo } from '../data/staking/MoonbeamRoundInfo'
import { MoonbeamProtocolConfiguration } from '../types/configuration'

export class MoonbeamNodeClient extends SubstrateCommonNodeClient<MoonbeamProtocolConfiguration> {
  public constructor(configuration: MoonbeamProtocolConfiguration, url: string) {
    super(configuration, url)
    this.registerCallEntrypointEntries([
      this.createCallEndpointEntry('delegate', 'ParachainStaking', 'delegate'),
      this.createCallEndpointEntry('schedule_leave_delegators', 'ParachainStaking', 'schedule_leave_delegators'),
      this.createCallEndpointEntry('execute_leave_delegators', 'ParachainStaking', 'execute_leave_delegators'),
      this.createCallEndpointEntry('cancel_leave_delegators', 'ParachainStaking', 'cancel_leave_delegators'),
      this.createCallEndpointEntry('schedule_revoke_delegation', 'ParachainStaking', 'schedule_revoke_delegation'),
      this.createCallEndpointEntry('execute_delegation_request', 'ParachainStaking', 'execute_delegation_request'),
      this.createCallEndpointEntry('cancel_delegation_request', 'ParachainStaking', 'cancel_delegation_request'),
      this.createCallEndpointEntry('delegator_bond_more', 'ParachainStaking', 'delegator_bond_more'),
      this.createCallEndpointEntry('schedule_delegator_bond_less', 'ParachainStaking', 'schedule_delegator_bond_less'),
      this.createCallEndpointEntry('execute_candidate_bond_less', 'ParachainStaking', 'execute_candidate_bond_less'),
      this.createCallEndpointEntry('cancel_candidate_bond_less', 'ParachainStaking', 'cancel_candidate_bond_less')
    ])
  }

  public async getRound(): Promise<MoonbeamRoundInfo | undefined> {
    return this.fromStorage('ParachainStaking', 'Round').then((item) =>
      item ? MoonbeamRoundInfo.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getCollators(): Promise<SubstrateEthAddress[] | undefined> {
    return this.fromStorage('ParachainStaking', 'SelectedCandidates').then((items) =>
      items
        ? SCALEArray.decode(this.configuration, this.runtimeVersion, items, (configuration, _, hex) =>
            SCALEAccountId.decode(configuration, hex, 20)
          ).decoded.elements.map((encoded) => encoded.address)
        : undefined
    )
  }

  public async getDelegatorState(address: SubstrateEthAddress): Promise<MoonbeamDelegator | undefined> {
    return this.fromStorage('ParachainStaking', 'DelegatorState', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? MoonbeamDelegator.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getDelegationScheduledRequests(address: SubstrateEthAddress): Promise<MoonbeamDelegationScheduledRequests | undefined> {
    return this.fromStorage('ParachainStaking', 'DelegationScheduledRequests', SCALEAccountId.from(address, this.configuration)).then(
      (item) => (item ? MoonbeamDelegationScheduledRequests.decode(this.configuration, this.runtimeVersion, item) : undefined)
    )
  }

  public async getCandidateInfo(address: SubstrateEthAddress): Promise<MoonbeamCandidateMetadata | undefined> {
    return this.fromStorage('ParachainStaking', 'CandidateInfo', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? MoonbeamCandidateMetadata.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getCollatorCommission(): Promise<BigNumber | undefined> {
    return this.fromStorage('ParachainStaking', 'CollatorCommission').then((item) =>
      item ? SCALEInt.decode(item, 32).decoded.value : undefined
    )
  }

  public async getMaxTopDelegationsPerCandidate(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'MaxTopDelegationsPerCandidate').then((item) =>
      item ? SCALEInt.decode(item, 32).decoded.value : undefined
    )
  }

  public async getMaxBottomDelegationsPerCandidate(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'MaxBottomDelegationsPerCandidate').then((item) =>
      item ? SCALEInt.decode(item, 32).decoded.value : undefined
    )
  }

  public async getMaxDelegationsPerDelegator(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'MaxDelegationsPerDelegator').then((item) =>
      item ? SCALEInt.decode(item, 32).decoded.value : undefined
    )
  }

  public async getMinDelegation(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'MinDelegation').then((item) => (item ? SCALEInt.decode(item).decoded.value : undefined))
  }

  public async getMinDelegatorStake(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'MinDelegatorStk').then((item) => (item ? SCALEInt.decode(item).decoded.value : undefined))
  }

  public async getCandidateBondLessDelay(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'CandidateBondLessDelay').then((item) =>
      item ? SCALEInt.decode(item).decoded.value : undefined
    )
  }

  public async getLeaveDelegatorsDelay(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'LeaveDelegatorsDelay').then((item) =>
      item ? SCALEInt.decode(item).decoded.value : undefined
    )
  }

  public async getRevokeDelegationDelay(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'RevokeDelegationDelay').then((item) =>
      item ? SCALEInt.decode(item).decoded.value : undefined
    )
  }

  public async getDelegationBondLessDelay(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'DelegationBondLessDelay').then((item) =>
      item ? SCALEInt.decode(item).decoded.value : undefined
    )
  }

  public async getDefaultBlocksPerRound(): Promise<BigNumber | undefined> {
    return this.getConstant('ParachainStaking', 'DefaultBlocksPerRound').then((item) =>
      item ? SCALEInt.decode(item).decoded.value : undefined
    )
  }
}

// Supported Calls

export const STORAGE_ENTRIES = {
  ParachainStaking: [
    'CollatorCommission',
    'CandidateInfo',
    'DelegatorState',
    'Round',
    'SelectedCandidates',
    'DelegationScheduledRequests'
  ] as const
}

export const CALLS = {
  ParachainStaking: [
    'delegate',
    'schedule_leave_delegators',
    'execute_leave_delegators',
    'cancel_leave_delegators',
    'schedule_revoke_delegation',
    'execute_delegation_request',
    'cancel_delegation_request',
    'delegator_bond_more',
    'schedule_delegator_bond_less',
    'execute_candidate_bond_less',
    'cancel_candidate_bond_less'
  ] as const
}

export const CONSTANTS = {
  ParachainStaking: [
    'DefaultBlocksPerRound',
    'MaxTopDelegationsPerCandidate',
    'MaxBottomDelegationsPerCandidate',
    'MaxDelegationsPerDelegator',
    'MinDelegation',
    'MinDelegatorStk',
    'CandidateBondLessDelay',
    'LeaveDelegatorsDelay',
    'RevokeDelegationDelay',
    'DelegationBondLessDelay'
  ] as const
}
