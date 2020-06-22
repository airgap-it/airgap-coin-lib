import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosBakingRewards, TezosEndorsingRewards, TezosEndorsingRight, TezosNodeConstantsV1, TezosProtocol } from '../TezosProtocol'

import { TezosRewardsCalculationDefault } from './TezosRewardCalculationDefault'

export class TezosRewardsCalculation005 extends TezosRewardsCalculationDefault {
  constructor(public protocol: TezosProtocol) {
    super(protocol)
  }

  protected async computeBakingRewards(
    bakingRights: { level: number; priority: number }[],
    isFutureCycle: boolean
  ): Promise<TezosBakingRewards> {
    let result = new BigNumber(0)
    const rewardsByLevel: { level: number; amount: string; deposit: string; fees?: string }[] = []
    const levels = bakingRights.map((br) => br.level)
    let endorsementCountsAndFees: Map<number, { sum_number_of_slots: string; block_level: number; sum_fee: number }> | undefined
    if (!isFutureCycle) {
      endorsementCountsAndFees = await this.fetchEndorsementOperationCountAndTotalFees(levels)
    }
    result = bakingRights.reduce((current: BigNumber, next: { level: number; priority: number }) => {
      // (16 / (priority + 1)) * (0.8 + (0.2 * (e / 32)))
      let count = this.tezosNodeConstants.endorsers_per_block
      let blockEndorsementCountAndFee: { sum_number_of_slots: string; block_level: number; sum_fee: number } | undefined
      if (!isFutureCycle && endorsementCountsAndFees !== undefined) {
        blockEndorsementCountAndFee = endorsementCountsAndFees.get(next.level)
        if (blockEndorsementCountAndFee === undefined) {
          throw new Error('Cannot find endorsement operation count')
        }
        count = parseInt(blockEndorsementCountAndFee.sum_number_of_slots)
      }
      const p = next.priority
      const e = count
      const bakingReward = this.specificBakingCalculation(e, p)

      rewardsByLevel.push({
        level: next.level,
        amount: bakingReward.toFixed(),
        deposit: this.tezosNodeConstants.block_security_deposit,
        fees: blockEndorsementCountAndFee !== undefined ? new BigNumber(blockEndorsementCountAndFee.sum_fee).toFixed() : '0'
      })

      return current.plus(bakingReward)
    }, new BigNumber(0))

    return { totalBakingRewards: result.toFixed(), rewardsDetails: rewardsByLevel }
  }

  protected specificBakingCalculation(e: number, p: number): BigNumber {
    const muliplier = Math.floor(8 + 2 * (e / 32))
    const bakingReward =
      ((((this.tezosNodeConstants as TezosNodeConstantsV1).block_reward as unknown) as number) * muliplier) / 10 / (p + 1)

    return new BigNumber(bakingReward)
  }

  protected async computeEndorsingRewards(endorsingRights: TezosEndorsingRight[], isFutureCycle: boolean): Promise<TezosEndorsingRewards> {
    let priorities: { priority: number; level: number }[] = []
    const rewardsByLevel: { level: number; amount: string; deposit: string }[] = []
    if (!isFutureCycle) {
      const levels = endorsingRights.map((er) => {
        return er.block_level!
      })
      if (levels.length > 0) {
        priorities = await this.fetchBlockPriorities(levels)
      }
    }

    const result = endorsingRights.reduce((current, next) => {
      let priority = 0
      if (!isFutureCycle) {
        const block = priorities.find((p) => p.level === next.block_level!)
        if (block === undefined) {
          throw new Error('Cannot find block priority')
        }
        priority = block.priority
      }
      const reward: BigNumber = this.specificEndorsingCalculation(priority, next.number_of_slots)
      rewardsByLevel.push({
        level: next.level,
        amount: reward.toFixed(),
        deposit: this.tezosNodeConstants.endorsement_security_deposit
      })

      return current.plus(reward)
    }, new BigNumber(0))

    return { totalEndorsingRewards: result.toFixed(), rewardsDetails: rewardsByLevel }
  }

  protected specificEndorsingCalculation(priority: number, number_of_slots: number) {
    const multiplier = new BigNumber((this.tezosNodeConstants as TezosNodeConstantsV1).endorsement_reward).div(new BigNumber(priority + 1))
    const reward: BigNumber = new BigNumber(number_of_slots).times(multiplier)

    return reward
  }
}
