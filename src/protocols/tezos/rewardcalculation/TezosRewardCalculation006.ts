import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosNodeConstantsV2, TezosProtocol } from '../TezosProtocol'

import { TezosRewardsCalculation005 } from './TezosRewardCalculation005'

export class TezosRewardsCalculation006 extends TezosRewardsCalculation005 {
  constructor(public protocol: TezosProtocol) {
    super(protocol)
    this.tezosNodeConstants = {} as TezosNodeConstantsV2
  }

  protected specificBakingCalculation(e: number, p: number) {
    const rewards: string[] = (this.tezosNodeConstants as TezosNodeConstantsV2).baking_reward_per_endorsement
    let multiplier = ''
    if (p > 0) {
      multiplier = rewards[1]
    } else {
      multiplier = rewards[0]
    }
    const bakingReward = new BigNumber(multiplier).multipliedBy(e)

    return bakingReward
  }

  protected specificEndorsingCalculation(priority: number, number_of_slots: number) {
    const priority_idx = priority > 0 ? 1 : 0
    const multiplier = new BigNumber((this.tezosNodeConstants as TezosNodeConstantsV2).endorsement_reward[priority_idx])
    const reward: BigNumber = new BigNumber(number_of_slots).times(multiplier)

    return reward
  }
}
