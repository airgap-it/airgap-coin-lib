import {
  TezosProtocol,
  TezosOperation,
  TezosOperationType,
  TezosWrappedOperation,
  TezosOriginationOperation,
  TezosDelegationOperation
} from '../TezosProtocol'
import { SubProtocolType, ICoinSubProtocol } from '../../ICoinSubProtocol'
import axios, { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import { RawTezosTransaction } from '../../../serializer/unsigned-transactions/tezos-transactions.serializer'

// 8.25%
const SELF_BOND_REQUIREMENT = 0.0825
const BLOCK_PER_CYCLE = 4096

export interface BakerInfo {
  balance: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  bakingActive: boolean
  selfBond: BigNumber
  bakerCapacity: BigNumber
  bakerUsage: BigNumber
}

export interface DelegationInfo {
  cycle: number
  reward: BigNumber
  deposit: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  totalRewards: BigNumber
  totalFees: BigNumber
  payout: Date
}

export interface DelegationStat {
  isDelegated: boolean
  setable: boolean
  value?: string
  delegatedOpLevel?: number
  delegatedDate?: Date
}

export class TezosKtProtocol extends TezosProtocol implements ICoinSubProtocol {
  identifier = 'xtz-kt'
  isSubProtocol = true
  subProtocolType = SubProtocolType.ACCOUNT
  addressValidationPattern = '^(tz1|KT1)[1-9A-Za-z]{33}$'

  async getAddressFromPublicKey(publicKey: string): Promise<string> {
    return (await this.getAddressesFromPublicKey(publicKey))[0]
  }

  async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const tz1address = await super.getAddressFromPublicKey(publicKey)
    const { data } = await axios.get(`${this.baseApiUrl}/v3/operations/${tz1address}?type=Origination`)

    const ktAddresses: string[] = [].concat.apply(
      [],
      data.map((origination: { type: { operations: [{ tz1: { tz: string } }] } }) => {
        return origination.type.operations.map(operation => {
          return operation.tz1.tz
        })
      })
    )

    return ktAddresses.reverse()
  }

  async originate(publicKey: string): Promise<RawTezosTransaction> {
    let counter = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []
    const address = await super.getAddressFromPublicKey(publicKey)

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager = results[2].data

      // check if we have revealed the key already
      if (!accountManager.key) {
        operations.push(await super.createRevealOperation(counter, publicKey, address))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfAddresses([address])

    const fee = new BigNumber(1400)

    if (balance.isLessThan(fee)) {
      throw new Error('not enough balance')
    }

    const originationOperation: TezosOriginationOperation = {
      kind: TezosOperationType.ORIGINATION,
      source: address,
      fee: fee.toFixed(),
      counter: counter.toFixed(),
      gas_limit: '10000', // taken from eztz
      storage_limit: '257', // taken from eztz
      managerPubkey: address,
      balance: '0',
      spendable: true,
      delegatable: true
    }

    operations.push(originationOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch: branch,
        contents: operations
      }

      const binaryTx = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  async isAddressDelegated(delegatedAddress: string): Promise<DelegationStat> {
    const { data } = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${delegatedAddress}`)

    let delegatedOpLevel: number | undefined
    let delegatedDate: Date | undefined

    // if the address is delegated, check since when
    if (data.delegate.value) {
      const { data: delegationData } = await axios.get(`${this.baseApiUrl}/v3/operations/${delegatedAddress}?type=Delegation`)

      const mostRecentDelegation = delegationData[0]

      delegatedDate = new Date(mostRecentDelegation.type.operations[0].timestamp)
      delegatedOpLevel = mostRecentDelegation.type.operations[0].op_level
    }

    return {
      isDelegated: data.delegate.value ? true : false,
      setable: data.delegate.setable,
      value: data.delegate.value,
      delegatedDate: delegatedDate,
      delegatedOpLevel: delegatedOpLevel
    }
  }

  async undelegate(publicKey: string, delegatedAddress: string): Promise<RawTezosTransaction> {
    return this.delegate(publicKey, delegatedAddress)
  }

  async delegate(publicKey: string, delegatedAddress: string, delegate?: string): Promise<RawTezosTransaction> {
    let counter = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []
    const address = await super.getAddressFromPublicKey(publicKey)

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${delegatedAddress}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfAddresses([delegatedAddress])

    const fee = new BigNumber(1420)

    if (balance.isLessThan(fee)) {
      throw new Error('not enough balance')
    }

    const delegationOperation: TezosDelegationOperation = {
      kind: TezosOperationType.DELEGATION,
      source: delegatedAddress || address,
      fee: fee.toFixed(),
      counter: counter.toFixed(),
      gas_limit: '10000', // taken from eztz
      storage_limit: '0', // taken from eztz
      delegate: delegate
    }

    operations.push(delegationOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch: branch,
        contents: operations
      }

      const binaryTx = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  async bakerInfo(tzAddress: string): Promise<BakerInfo> {
    if (!tzAddress.toLowerCase().startsWith('tz1')) {
      throw new Error('non tz1-address supplied')
    }

    const results = await Promise.all([
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/balance`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/delegated_balance`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/staking_balance`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/deactivated`)
    ])

    const tzBalance = new BigNumber(results[0].data)
    const delegatedBalance = new BigNumber(results[1].data)
    const stakingBalance = new BigNumber(results[2].data)
    const isBakingActive: boolean = !results[3].data // we need to negate as the query is "deactivated"

    // calculate the self bond of the baker
    const selfBond = stakingBalance.minus(delegatedBalance)

    // check what capacity is staked relatively to the self-bond
    const stakingCapacity = stakingBalance.div(selfBond.div(SELF_BOND_REQUIREMENT))

    const bakerInfo: BakerInfo = {
      balance: tzBalance,
      delegatedBalance: delegatedBalance,
      stakingBalance: stakingBalance,
      bakingActive: isBakingActive,
      selfBond: selfBond,
      bakerCapacity: stakingBalance.div(stakingCapacity),
      bakerUsage: stakingCapacity
    }

    return bakerInfo
  }

  async delegationInfo(ktAddress: string): Promise<DelegationInfo[]> {
    if (!ktAddress.toLowerCase().startsWith('kt')) {
      throw new Error('non kt-address supplied')
    }

    const status = await this.isAddressDelegated(ktAddress)

    if (!status.isDelegated || !status.value) {
      throw new Error('address not delegated')
    }

    return this.delegationRewards(status.value, ktAddress)
  }

  async delegationRewards(tzAddress: string, ktAddress?: string): Promise<DelegationInfo[]> {
    const { data: frozenBalance }: AxiosResponse<[{ cycle: number; deposit: string; fees: string; rewards: string }]> = await axios.get(
      `${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/frozen_balance_by_cycle`
    )

    const lastConfirmedCycle = frozenBalance[0].cycle - 1
    const mostRecentCycle = frozenBalance[frozenBalance.length - 1].cycle

    const { data: mostRecentBlock } = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/${mostRecentCycle * BLOCK_PER_CYCLE}`)
    const timestamp: Date = new Date(mostRecentBlock.header.timestamp)

    const delegationInfo: DelegationInfo[] = await Promise.all(
      frozenBalance.map(async obj => {
        const { data: delegatedBalanceAtCycle } = await axios.get(
          `${this.jsonRPCAPI}/chains/main/blocks/${(obj.cycle - 6) * BLOCK_PER_CYCLE}/context/contracts/${
            ktAddress ? ktAddress : tzAddress
          }/balance`
        )

        const { data: stakingBalanceAtCycle } = await axios.get(
          `${this.jsonRPCAPI}/chains/main/blocks/${(obj.cycle - 6) * BLOCK_PER_CYCLE}/context/delegates/${tzAddress}/staking_balance`
        )

        return {
          cycle: obj.cycle,
          totalRewards: new BigNumber(obj.rewards),
          totalFees: new BigNumber(obj.fees),
          deposit: new BigNumber(obj.deposit),
          delegatedBalance: new BigNumber(delegatedBalanceAtCycle),
          stakingBalance: new BigNumber(stakingBalanceAtCycle),
          reward: new BigNumber(obj.rewards).plus(obj.fees).multipliedBy(new BigNumber(delegatedBalanceAtCycle).div(stakingBalanceAtCycle)),
          payout: new Date(timestamp.getTime() + (obj.cycle - lastConfirmedCycle) * BLOCK_PER_CYCLE * 60 * 1000)
        }
      })
    )

    return delegationInfo
  }
}
