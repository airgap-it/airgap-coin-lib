import axios from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { InvalidValueError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'
import {
  TezosBakerInfo,
  TezosBakingRewards,
  TezosBakingRight,
  TezosEndorsingRewards,
  TezosEndorsingRight,
  TezosFrozenBalance,
  TezosNodeConstants,
  TezosNodeConstantsV1,
  TezosProtocol,
  TezosRewards,
  TezosRewardsCalculations
} from '../TezosProtocol'

export class TezosRewardsCalculationDefault implements TezosRewardsCalculations {
  protected tezosNodeConstants: TezosNodeConstants

  constructor(public protocol: TezosProtocol) {
    this.tezosNodeConstants = {} as TezosNodeConstantsV1
  }

  protected async getConstants(currentLevel: number, useHead: boolean) {
    this.tezosNodeConstants = (
      await axios.get(`${this.protocol.jsonRPCAPI}/chains/main/blocks/${useHead ? 'head' : currentLevel}/context/constants`)
    ).data as TezosNodeConstantsV1
  }

  public async calculateRewards(
    bakerAddress: string,
    cycle: number,
    breakdownRewards: boolean = true,
    currentCycleIn?: number
  ): Promise<TezosRewards> {
    const currentCycle = currentCycleIn ?? (await this.protocol.fetchCurrentCycle())
    const calculatingLevel = this.protocol.cycleToBlockLevel(cycle)

    await this.getConstants(calculatingLevel, currentCycle < cycle)

    let computedRewards: {
      bakingRewards: string
      endorsingRewards: string
      totalRewards: string
      fees: string
      deposit: string
      bakingRewardsDetails: { level: number; amount: string; deposit: string; fees?: string }[]
      endorsingRewardsDetails: { level: number; amount: string; deposit: string }[]
      endorsingRightsCount: number
    }

    if (cycle < currentCycle) {
      computedRewards = await this.calculatePastRewards(bakerAddress, cycle, breakdownRewards)
    } else {
      computedRewards = await this.calculateFutureRewards(bakerAddress, cycle, currentCycle, breakdownRewards)
    }

    const snapshotLevel = await this.computeSnapshotBlockLevel(Math.min(cycle, currentCycle))
    const bakerInfo = await this.fetchBakerInfo(bakerAddress, snapshotLevel).catch(() => {
      return { staking_balance: '0', delegated_contracts: [] }
    })

    const stakingBalance = new BigNumber(bakerInfo.staking_balance)

    return {
      baker: bakerAddress,
      stakingBalance: stakingBalance.toFixed(),
      bakingRewards: computedRewards.bakingRewards,
      endorsingRewards: computedRewards.endorsingRewards,

      bakingDeposits: computedRewards.bakingRewardsDetails
        .map((detail) => (detail && detail.deposit ? (detail.deposit ? parseInt(detail.deposit) : 0) : 0))
        .reduce((a, b) => a + b, 0)
        .toString(),

      endorsingDeposits: computedRewards.endorsingRewardsDetails
        .map((detail) => (detail && detail.deposit ? (detail.deposit ? parseInt(detail.deposit) : 0) : 0))
        .reduce((a, b) => a + b, 0)
        .toString(),

      cycle,
      fees: computedRewards.fees,
      totalRewards: computedRewards.totalRewards,
      snapshotBlockLevel: snapshotLevel,
      delegatedContracts: bakerInfo.delegated_contracts,
      bakingRewardsDetails: computedRewards.bakingRewardsDetails,
      endorsingRewardsDetails: computedRewards.endorsingRewardsDetails,
      deposit: computedRewards.deposit,
      endorsingRightsCount: computedRewards.endorsingRightsCount
    }
  }

  private async calculatePastRewards(
    bakerAddress: string,
    cycle: number,
    breakdownRewards: boolean
  ): Promise<{
    bakingRewards: string
    endorsingRewards: string
    totalRewards: string
    fees: string
    deposit: string
    bakingRewardsDetails: { level: number; amount: string; deposit: string; fees?: string | undefined }[]
    endorsingRewardsDetails: { level: number; amount: string; deposit: string }[]
    endorsingRightsCount: number
  }> {
    let computedBakingRewards: TezosBakingRewards = {
      totalBakingRewards: '0',
      rewardsDetails: []
    }

    let computedEndorsingRewards: TezosEndorsingRewards = {
      totalEndorsingRewards: '0',
      rewardsDetails: []
    }

    let fees = '0'
    let totalRewards = '0'
    let deposit = '0'
    let endorsingRightsCount = 0

    if (breakdownRewards) {
      const bakedBlocks = await this.fetchBlocksForBaker(bakerAddress, cycle)

      if (bakedBlocks.length > 0) {
        computedBakingRewards = await this.computeBakingRewards(bakedBlocks, false)
      }

      const endorsingOperations = await this.fetchEndorsementOperations(cycle, bakerAddress)
      computedEndorsingRewards = await this.computeEndorsingRewards(endorsingOperations, false)
      endorsingRightsCount = endorsingOperations.reduce((current, next) => current + next.number_of_slots, 0)
    }

    const frozenBalance = (await this.fetchFrozenBalances(this.protocol.cycleToBlockLevel(cycle + 1), bakerAddress)).find(
      (fb) => fb.cycle == cycle
    )

    if (frozenBalance) {
      fees = frozenBalance.fees
      totalRewards = frozenBalance.rewards
      deposit = frozenBalance.deposit ?? frozenBalance.deposits
    }

    return {
      bakingRewards: computedBakingRewards.totalBakingRewards,
      endorsingRewards: computedEndorsingRewards.totalEndorsingRewards,
      totalRewards,
      fees,
      bakingRewardsDetails: computedBakingRewards.rewardsDetails,
      endorsingRewardsDetails: computedEndorsingRewards.rewardsDetails,
      endorsingRightsCount,
      deposit
    }
  }

  private async calculateFutureRewards(
    bakerAddress: string,
    cycle: number,
    currentCycle: number,
    breakdownRewards: boolean
  ): Promise<{
    bakingRewards: string
    endorsingRewards: string
    totalRewards: string
    fees: string
    deposit: string
    bakingRewardsDetails: { level: number; amount: string; deposit: string; fees?: string | undefined }[]
    endorsingRewardsDetails: { level: number; amount: string; deposit: string }[]
    endorsingRightsCount: number
  }> {
    let computedBakingRewards: TezosBakingRewards = {
      totalBakingRewards: '0',
      rewardsDetails: []
    }

    let computedEndorsingRewards: TezosEndorsingRewards = {
      totalEndorsingRewards: '0',
      rewardsDetails: []
    }

    let fees = '0'
    let totalRewards = '0'
    let endorsingRightsCount = 0

    if (cycle - currentCycle > 5) {
      throw new InvalidValueError(Domain.TEZOS, `Provided cycle ${cycle} is invalid`)
    }

    if (breakdownRewards) {
      const bakingRights = await this.fetchBakingRights(bakerAddress, cycle)
      computedBakingRewards = await this.computeBakingRewards(bakingRights, true)
      const endorsingRights = await this.fetchEndorsingRights(bakerAddress, cycle)
      computedEndorsingRewards = await this.computeEndorsingRewards(endorsingRights, true)
      endorsingRightsCount = endorsingRights.reduce((current, next) => current + next.number_of_slots, 0)
    }

    totalRewards = new BigNumber(computedBakingRewards.totalBakingRewards)
      .plus(new BigNumber(computedEndorsingRewards.totalEndorsingRewards))
      .toFixed()

    const frozenBalances = await this.fetchFrozenBalances('head', bakerAddress)

    if (frozenBalances.length > 0) {
      const lastFrozenBalance = frozenBalances[frozenBalances.length - 1]
      fees = lastFrozenBalance.fees
    }

    return {
      bakingRewards: computedBakingRewards.totalBakingRewards,
      endorsingRewards: computedEndorsingRewards.totalEndorsingRewards,
      totalRewards,
      fees,
      bakingRewardsDetails: computedBakingRewards.rewardsDetails,
      endorsingRewardsDetails: computedEndorsingRewards.rewardsDetails,
      endorsingRightsCount,
      deposit: '0'
    }
  }

  private async fetchEndorsementOperations(cycle: number, bakerAddress: string): Promise<TezosEndorsingRight[]> {
    const cycleStartLevel = this.protocol.cycleToBlockLevel(cycle)
    const cycleEndLevel = cycleStartLevel + this.tezosNodeConstants.blocks_per_cycle
    const query = {
      fields: ['level', 'delegate', 'number_of_slots', 'block_level'],
      predicates: [
        {
          field: 'kind',
          operation: 'in',
          set: ['endorsement', 'endorsement_with_slot'],
          inverse: false
        },
        {
          field: 'level',
          operation: 'between',
          set: [cycleStartLevel, cycleEndLevel],
          inverse: false
        },
        {
          field: 'delegate',
          operation: 'eq',
          set: [bakerAddress]
        }
      ]
    }
    const result = await axios.post(`${this.protocol.baseApiUrl}/v2/data/tezos/${this.protocol.baseApiNetwork}/operations`, query, {
      headers: this.protocol.headers
    })

    return result.data
  }

  private async fetchFrozenBalances(blockLevel: number | 'head', bakerAddress: string): Promise<TezosFrozenBalance[]> {
    const result = await axios.get(
      `${this.protocol.jsonRPCAPI}/chains/main/blocks/${blockLevel}/context/delegates/${bakerAddress}/frozen_balance_by_cycle`
    )

    return result.data
  }

  protected async computeBakingRewards(
    bakingRights: { level: number; priority: number }[],
    isFutureCycle: boolean
  ): Promise<TezosBakingRewards> {
    let result = new BigNumber(0)
    const rewardsByLevel: { level: number; amount: string; deposit: string; fees?: string }[] = []
    result = new BigNumber(bakingRights.length * ((this.tezosNodeConstants as TezosNodeConstantsV1).block_reward as unknown as number))

    return { totalBakingRewards: result.toFixed(), rewardsDetails: rewardsByLevel }
  }

  // be aware this function IS NOT identical to the one in TezosRewardCalculation005
  protected async computeEndorsingRewards(endorsingRights: TezosEndorsingRight[], isFutureCycle: boolean): Promise<TezosEndorsingRewards> {
    let priorities: { priority: number; level: number }[] = []
    const rewardsByLevel: { level: number; amount: string; deposit: string }[] = []
    if (!isFutureCycle) {
      const levels = endorsingRights.map((er) => {
        return er.level
      })
      if (levels.length > 0) {
        priorities = await this.fetchBlockPriorities(levels)
      }
    }

    const result = endorsingRights.reduce((current, next) => {
      let priority = 0
      if (!isFutureCycle) {
        const block = priorities.find((p) => p.level === next.level)
        if (block === undefined) {
          throw new InvalidValueError(Domain.TEZOS, 'Cannot find block priority')
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

  private async computeSnapshotBlockLevel(cycle: number, blockLevel?: number | 'head'): Promise<number> {
    const level = blockLevel === undefined ? this.protocol.cycleToBlockLevel(cycle) : blockLevel
    const snapshotNumberResult = await axios.get(
      `${this.protocol.jsonRPCAPI}/chains/main/blocks/${level}/context/raw/json/cycle/${cycle}/roll_snapshot`
    )
    const snapshotNumber: number = snapshotNumberResult.data
    const delegationCycle = cycle - 7
    const firstDelegationCycleBlocklLevel = this.protocol.cycleToBlockLevel(delegationCycle)
    const numberOfSnapshotsBeforeDelegationCycle = firstDelegationCycleBlocklLevel / this.tezosNodeConstants.blocks_per_roll_snapshot
    const totalSnapshotNumber = numberOfSnapshotsBeforeDelegationCycle + snapshotNumber + 1
    const snapshotBlockLevel = totalSnapshotNumber * this.tezosNodeConstants.blocks_per_roll_snapshot

    return snapshotBlockLevel
  }

  private async fetchBakerInfo(bakerAddress: string, blockLevel: number | 'head'): Promise<TezosBakerInfo> {
    const bakerInfoResult = await axios.get(
      `${this.protocol.jsonRPCAPI}/chains/main/blocks/${blockLevel}/context/delegates/${bakerAddress}`
    )

    return bakerInfoResult.data
  }

  private async fetchBlocksForBaker(bakerAddress: string, cycle: number): Promise<{ level: number; priority: number }[]> {
    const query = {
      fields: ['level', 'priority'],
      predicates: [
        {
          field: 'baker',
          operation: 'eq',
          set: [bakerAddress],
          inverse: false
        },
        {
          field: 'meta_cycle',
          operation: 'eq',
          set: [cycle],
          inverse: false
        }
      ]
    }
    const result = await axios.post(`${this.protocol.baseApiUrl}/v2/data/tezos/${this.protocol.baseApiNetwork}/blocks`, query, {
      headers: this.protocol.headers
    })

    return result.data
  }

  private readonly blockLevelFieldNameMap = new Map<'baking_rights' | 'endorsing_rights', string>()
  private fetchBlockLevelFieldPromise?: Promise<string>

  private async fetchBlockLevelFieldName(entity: 'baking_rights' | 'endorsing_rights'): Promise<string> {
    const result = this.blockLevelFieldNameMap.get(entity)
    if (result) {
      return result
    }

    if (this.fetchBlockLevelFieldPromise) {
      return this.fetchBlockLevelFieldPromise
    }

    this.fetchBlockLevelFieldPromise = axios
      .get(`${this.protocol.baseApiUrl}/v2/metadata/tezos/${this.protocol.baseApiNetwork}/${entity}/attributes`, {
        headers: this.protocol.headers
      })
      .then((response) => {
        let name = 'block_level'
        const fieldNames: string[] = response.data.map((metadata) => metadata.name)
        if (fieldNames.includes('level')) {
          name = 'level'
        }
        this.blockLevelFieldNameMap.set(entity, name)

        return name
      })
      .finally(() => {
        this.fetchBlockLevelFieldPromise = undefined
      })

    return this.fetchBlockLevelFieldPromise
  }

  protected async fetchBakingRights(bakerAddress: string, cycle: number): Promise<TezosBakingRight[]> {
    const startLevel = this.protocol.cycleToBlockLevel(cycle)
    const endLevel = startLevel + this.tezosNodeConstants.blocks_per_cycle
    const blockLevelFieldName = await this.fetchBlockLevelFieldName('baking_rights')
    const query = {
      fields: ['priority', blockLevelFieldName],
      predicates: [
        {
          field: 'delegate',
          operation: 'eq',
          set: [bakerAddress]
        },
        {
          field: 'priority',
          operation: 'eq',
          set: [0]
        },
        {
          field: blockLevelFieldName,
          operation: 'between',
          set: [startLevel, endLevel]
        }
      ],
      orderBy: [
        {
          field: blockLevelFieldName,
          direction: 'desc'
        }
      ],
      limit: 10000
    }

    const result = await axios
      .post(`${this.protocol.baseApiUrl}/v2/data/tezos/${this.protocol.baseApiNetwork}/baking_rights`, query, {
        headers: this.protocol.headers
      })
      .then((result) => result.data)
      .catch((error) => [])

    return result.map((bakingRight) => {
      return {
        level: bakingRight[blockLevelFieldName],
        priority: bakingRight.priority,
        delegate: bakerAddress
      }
    })
  }

  protected async fetchEndorsingRights(bakerAddress: string, cycle: number): Promise<TezosEndorsingRight[]> {
    const startLevel = this.protocol.cycleToBlockLevel(cycle)
    const endLevel = startLevel + this.tezosNodeConstants.blocks_per_cycle
    const blockLevelFieldName = await this.fetchBlockLevelFieldName('endorsing_rights')
    const query = {
      fields: [blockLevelFieldName],
      predicates: [
        {
          field: 'delegate',
          operation: 'eq',
          set: [bakerAddress]
        },
        {
          field: blockLevelFieldName,
          operation: 'between',
          set: [startLevel, endLevel]
        }
      ],
      aggregation: [
        {
          field: 'slot',
          function: 'count'
        }
      ],
      limit: 100000
    }

    const result = await axios
      .post(`${this.protocol.baseApiUrl}/v2/data/tezos/${this.protocol.baseApiNetwork}/endorsing_rights`, query, {
        headers: this.protocol.headers
      })
      .then((result) => result.data)
      .catch((error) => [])

    return result.map((endorsingRight) => {
      return {
        level: endorsingRight[blockLevelFieldName],
        delegate: bakerAddress,
        number_of_slots: Number(endorsingRight.count_slot)
      }
    })
  }

  protected async fetchEndorsementOperationCountAndTotalFees(
    blockLevels: number[]
  ): Promise<Map<number, { sum_number_of_slots: string; block_level: number; sum_fee: number }>> {
    const query = {
      fields: ['block_level'],
      predicates: [
        {
          field: 'block_level',
          operation: 'in',
          set: blockLevels,
          inverse: false
        }
      ],
      aggregation: [
        {
          field: 'fee',
          function: 'sum'
        },
        {
          field: 'number_of_slots',
          function: 'sum'
        }
      ]
    }
    const result = await axios.post(`${this.protocol.baseApiUrl}/v2/data/tezos/${this.protocol.baseApiNetwork}/operations`, query, {
      headers: this.protocol.headers
    })
    const map = new Map<number, { sum_number_of_slots: string; block_level: number; sum_fee: number }>()
    for (const op of result.data) {
      map.set(op.block_level, op)
    }

    return map
  }

  protected async fetchBlockPriorities(blockLevels: number[]): Promise<{ priority: number; level: number }[]> {
    const query = {
      fields: ['priority', 'level'],
      predicates: [
        {
          field: 'level',
          operation: 'in',
          set: blockLevels,
          inverse: false
        }
      ]
    }
    const result = await axios.post(`${this.protocol.baseApiUrl}/v2/data/tezos/${this.protocol.baseApiNetwork}/blocks`, query, {
      headers: this.protocol.headers
    })

    return result.data
  }
}
