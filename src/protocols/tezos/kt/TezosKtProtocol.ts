import axios, { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'

import { RawTezosTransaction } from '../../../serializer/unsigned-transactions/tezos-transactions.serializer'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { TezosOperation, TezosOperationType, TezosProtocol, TezosSpendOperation, TezosWrappedOperation } from '../TezosProtocol'

// 8.25%
const SELF_BOND_REQUIREMENT: number = 0.0825
const BLOCK_PER_CYCLE: number = 4096

export interface BakerInfo {
  balance: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  bakingActive: boolean
  selfBond: BigNumber
  bakerCapacity: BigNumber
  bakerUsage: BigNumber
}

export interface DelegationRewardInfo {
  cycle: number
  reward: BigNumber
  deposit: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  totalRewards: BigNumber
  totalFees: BigNumber
  payout: Date
}

export interface DelegationInfo {
  isDelegated: boolean
  value?: string
  delegatedOpLevel?: number
  delegatedDate?: Date
}

export class TezosKtProtocol extends TezosProtocol implements ICoinSubProtocol {
  public identifier: string = 'xtz-kt'
  public isSubProtocol: boolean = true
  public subProtocolType: SubProtocolType = SubProtocolType.ACCOUNT
  public addressValidationPattern: string = '^(tz1|KT1)[1-9A-Za-z]{33}$'

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    return (await this.getAddressesFromPublicKey(publicKey))[0]
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const tz1address: string = await super.getAddressFromPublicKey(publicKey)
    const { data }: AxiosResponse = await axios.get(`${this.baseApiUrl}/v3/operations/${tz1address}?type=Origination`)

    const ktAddresses: string[] = [].concat.apply(
      [],
      data.map((origination: { type: { operations: [{ tz1: { tz: string } }] } }) => {
        return origination.type.operations.map((operation: { tz1: { tz: string } }) => {
          return operation.tz1.tz
        })
      })
    )

    return ktAddresses.reverse()
  }

  public async delegate(publicKey: string, delegate?: string): Promise<RawTezosTransaction> {
    throw new Error('Delegate operation not supported for KT Addresses')
  }

  public async migrateKtContract(
    publicKey: string,
    destinationContract: string
  ): Promise<{
    binaryTransaction: string
  }> {
    let counter: BigNumber = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []

    const address: string = await super.getAddressFromPublicKey(publicKey)
    const amount: BigNumber = await this.getBalanceOfAddresses([destinationContract])

    try {
      const results: AxiosResponse[] = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager: string = results[2].data

      // check if we have revealed the address already
      if (!accountManager) {
        operations.push(await this.createRevealOperation(counter, publicKey, address))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const hexAmount: string = `00${this.encodeSignedInt(amount.toNumber())}`

    let hexDestination: string = this.checkAndRemovePrefixToHex(address, this.tezosPrefixes.tz1)

    if (hexDestination.length > 42) {
      // must be less or equal 21 bytes
      throw new Error('provided source is invalid')
    }

    while (hexDestination.length !== 42) {
      // fill up with 0s to match 21 bytes
      hexDestination = `0${hexDestination}`
    }

    const lengthOfArgument: number = 32 + hexDestination.length / 2 + hexAmount.length / 2
    const lengthOfSequence: number = lengthOfArgument - 5

    let hexArgumentLength: string = lengthOfArgument.toString(16)
    let hexSequenceLength: string = lengthOfSequence.toString(16)

    while (hexArgumentLength.length < 8) {
      // Make sure it's 4 bytes
      hexArgumentLength = `0${hexArgumentLength}`
    }

    while (hexSequenceLength.length < 8) {
      // Make sure it's 4 bytes
      hexSequenceLength = `0${hexSequenceLength}`
    }

    // Taken from https://blog.nomadic-labs.com/babylon-update-instructions-for-delegation-wallet-developers.html#transfer-from-a-managertz-smart-contract-to-an-implicit-tz-account

    // tslint:disable:prefer-template
    const code: string =
      'ff' + // 0xff (or any other non-null byte): presence flag for the parameters (entrypoint and argument)
      '02' + // 0x02: tag of the "%do" entrypoint
      hexArgumentLength + // <4 bytes>: length of the argument
      '02' + // 0x02: Michelson sequence
      hexSequenceLength + // <4 bytes>: length of the sequence
      '0320' + // 0x0320: DROP
      '053d' + // 0x053d: NIL
      '036d' + // 0x036d: operation
      '0743' + // 0x0743: PUSH
      '035d' + // 0x035d: key_hash
      '0a' + // 0x0a: Byte sequence
      '00000015' + // 0x00000015: Length of the sequence (21 bytes)
      hexDestination + // <21 bytes>: <destination>
      '031e' + // 0x031e: IMPLICIT_ACCOUNT
      '0743' + // 0x0743: PUSH
      '036a' + // 0x036a: mutez
      hexAmount + // <amount>: Amout to be transfered
      '034f' + // 0x034f: UNIT
      '034d' + // 0x034d: TRANSFER_TOKENS
      '031b' // 0x031b: CONS
    // tslint:enable:prefer-template

    const spendOperation: TezosSpendOperation = {
      kind: TezosOperationType.TRANSACTION,
      fee: '2941',
      gas_limit: '26283',
      storage_limit: '0',
      amount: '0',
      counter: counter.toFixed(),
      destination: destinationContract,
      source: address,
      code
    }

    operations.push(spendOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx: string = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  public async isAddressDelegated(delegatedAddress: string): Promise<DelegationInfo> {
    const { data }: AxiosResponse = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${delegatedAddress}`)

    let delegatedOpLevel: number | undefined
    let delegatedDate: Date | undefined

    // if the address is delegated, check since when
    if (data.balance) {
      const getDataFromMostRecentTransaction: (transactions) => { date: Date; opLevel: number } | void = (
        transactions
      ): { date: Date; opLevel: number } | void => {
        if (transactions.length > 0) {
          const mostRecentTransaction = transactions[0]

          return {
            date: new Date(mostRecentTransaction.type.operations[0].timestamp),
            opLevel: mostRecentTransaction.type.operations[0].op_level
          }
        }
      }

      // We first try to get the data from the lastest delegation
      // After that try to get it from the origination
      const transactionSourceUrls: [string, string] = [
        `${this.baseApiUrl}/v3/operations/${delegatedAddress}?type=Delegation`,
        `${this.baseApiUrl}/v3/operations/${delegatedAddress}?type=Origination`
      ]

      for (const sourceUrl of transactionSourceUrls) {
        const { data }: AxiosResponse = await axios.get(sourceUrl)

        const recentTransactionData: {
          date: Date
          opLevel: number
        } | void = getDataFromMostRecentTransaction(data)
        if (recentTransactionData) {
          delegatedDate = recentTransactionData.date
          delegatedOpLevel = recentTransactionData.opLevel
          break
        }
      }
    }

    return {
      isDelegated: data.balance ? true : false,
      value: data.balance,
      delegatedDate,
      delegatedOpLevel
    }
  }

  public async bakerInfo(tzAddress: string): Promise<BakerInfo> {
    if (
      !(tzAddress.toLowerCase().startsWith('tz1') || tzAddress.toLowerCase().startsWith('tz2') || tzAddress.toLowerCase().startsWith('tz3'))
    ) {
      throw new Error('non tz-address supplied')
    }

    const results: AxiosResponse[] = await Promise.all([
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/balance`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/delegated_balance`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/staking_balance`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/deactivated`)
    ])

    const tzBalance: BigNumber = new BigNumber(results[0].data)
    const delegatedBalance: BigNumber = new BigNumber(results[1].data)
    const stakingBalance: BigNumber = new BigNumber(results[2].data)
    const isBakingActive: boolean = !results[3].data // we need to negate as the query is "deactivated"

    // calculate the self bond of the baker
    const selfBond: BigNumber = stakingBalance.minus(delegatedBalance)

    // check what capacity is staked relatively to the self-bond
    const stakingCapacity: BigNumber = stakingBalance.div(selfBond.div(SELF_BOND_REQUIREMENT))

    const bakerInfo: BakerInfo = {
      balance: tzBalance,
      delegatedBalance,
      stakingBalance,
      bakingActive: isBakingActive,
      selfBond,
      bakerCapacity: stakingBalance.div(stakingCapacity),
      bakerUsage: stakingCapacity
    }

    return bakerInfo
  }

  public async delegationInfo(ktAddress: string): Promise<DelegationRewardInfo[]> {
    if (!ktAddress.toLowerCase().startsWith('kt')) {
      throw new Error('non kt-address supplied')
    }

    const status: DelegationInfo = await this.isAddressDelegated(ktAddress)

    if (!status.isDelegated || !status.value) {
      throw new Error('address not delegated')
    }

    return this.delegationRewards(status.value, ktAddress)
  }

  public async delegationRewards(tzAddress: string, ktAddress?: string): Promise<DelegationRewardInfo[]> {
    const { data: frozenBalance }: AxiosResponse<[{ cycle: number; deposit: string; fees: string; rewards: string }]> = await axios.get(
      `${this.jsonRPCAPI}/chains/main/blocks/head/context/delegates/${tzAddress}/frozen_balance_by_cycle`
    )

    const lastConfirmedCycle: number = frozenBalance[0].cycle - 1
    const mostRecentCycle: number = frozenBalance[frozenBalance.length - 1].cycle

    const { data: mostRecentBlock } = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/${mostRecentCycle * BLOCK_PER_CYCLE}`)
    const timestamp: Date = new Date(mostRecentBlock.header.timestamp)

    const delegationInfo: DelegationRewardInfo[] = await Promise.all(
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
