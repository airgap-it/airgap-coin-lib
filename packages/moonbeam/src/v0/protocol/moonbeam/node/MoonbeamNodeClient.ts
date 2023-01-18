import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALEAccountId } from '@airgap/substrate/v0/protocol/common/data/scale/type/SCALEAccountId'
import { SCALEArray } from '@airgap/substrate/v0/protocol/common/data/scale/type/SCALEArray'
import { SCALEInt } from '@airgap/substrate/v0/protocol/common/data/scale/type/SCALEInt'
import { SubstrateNodeClient } from '@airgap/substrate/v0/protocol/common/node/SubstrateNodeClient'
import { MoonbeamAddress } from '@airgap/substrate/v0/protocol/moonbeam/MoonbeamAddress'
import { SubstrateNetwork } from '@airgap/substrate/v0/protocol/SubstrateNetwork'

import { MoonbeamCandidateMetadata } from '../data/staking/MoonbeamCandidateMetadata'
import { MoonbeamDelegationScheduledRequests } from '../data/staking/MoonbeamDelegationScheduledRequests'
import { MoonbeamDelegator } from '../data/staking/MoonbeamDelegator'
import { MoonbeamRoundInfo } from '../data/staking/MoonbeamRoundInfo'

export class MoonbeamNodeClient extends SubstrateNodeClient<SubstrateNetwork.MOONBEAM> {
  public async getRound(): Promise<MoonbeamRoundInfo | undefined> {
    return this.fromStorage('ParachainStaking', 'Round').then((item) =>
      item ? MoonbeamRoundInfo.decode(this.runtimeVersion, item) : undefined
    )
  }

  public async getCollators(): Promise<MoonbeamAddress[] | undefined> {
    return this.fromStorage('ParachainStaking', 'SelectedCandidates').then((items) =>
      items
        ? SCALEArray.decode(this.network, this.runtimeVersion, items, (network, _, hex) =>
            SCALEAccountId.decode(network, hex, 20)
          ).decoded.elements.map((encoded) => encoded.address)
        : undefined
    )
  }

  public async getDelegatorState(address: MoonbeamAddress): Promise<MoonbeamDelegator | undefined> {
    return this.fromStorage('ParachainStaking', 'DelegatorState', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? MoonbeamDelegator.decode(this.runtimeVersion, item) : undefined
    )
  }

  public async getDelegationScheduledRequests(address: MoonbeamAddress): Promise<MoonbeamDelegationScheduledRequests | undefined> {
    return this.fromStorage('ParachainStaking', 'DelegationScheduledRequests', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? MoonbeamDelegationScheduledRequests.decode(this.runtimeVersion, item) : undefined
    )
  }

  public async getCandidateInfo(address: MoonbeamAddress): Promise<MoonbeamCandidateMetadata | undefined> {
    return this.fromStorage('ParachainStaking', 'CandidateInfo', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? MoonbeamCandidateMetadata.decode(this.runtimeVersion, item) : undefined
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
