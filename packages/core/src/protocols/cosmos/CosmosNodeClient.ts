import Axios, { AxiosResponse } from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { CosmosCoin } from './CosmosCoin'
import {
  CosmosAccount,
  CosmosAccountCoin,
  CosmosBroadcastSignedTransactionResponse,
  CosmosDelegation,
  CosmosNodeInfo,
  CosmosPagedSendTxsResponse,
  CosmosRewardDetails,
  CosmosUnbondingDelegation,
  CosmosValidator
} from './CosmosTypes'

export class CosmosNodeClient {
  constructor(public readonly baseURL: string, public useCORSProxy: boolean = false) {}

  public async fetchBalance(address: string, totalBalance?: boolean): Promise<BigNumber> {
    const response = await Axios.get(this.url(`/bank/balances/${address}`))
    const data: CosmosAccountCoin[] = response.data.result
    if (data.length > 0) {
      const availableBalance = CosmosCoin.sum(CosmosCoin.fromCoins(data))
      if (totalBalance) {
        const totalBalance = (
          await Promise.all([
            this.fetchTotalReward(address),
            this.fetchTotalUnbondingAmount(address),
            this.fetchTotalDelegatedAmount(address)
          ])
        ).reduce((current, next) => current.plus(next), new BigNumber(availableBalance))

        return totalBalance.decimalPlaces(0, BigNumber.ROUND_FLOOR)
      } else {
        return new BigNumber(availableBalance).decimalPlaces(0, BigNumber.ROUND_FLOOR)
      }
    } else {
      return new BigNumber(0)
    }
  }

  public async fetchSendTransactionsFor(
    address: string,
    page: number = 1,
    limit: number = 10,
    isSender: boolean = true
  ): Promise<CosmosPagedSendTxsResponse> {
    const response = await Axios.get<CosmosPagedSendTxsResponse>(
      this.url(`/txs?message.action=send&transfer.${isSender ? 'sender' : 'recipient'}=${address}&page=${page}&limit=${limit}`)
    )
    const data = response.data
    const result: CosmosPagedSendTxsResponse = {
      ...data,
      txs:
        data.txs?.map((tx) => ({
          ...tx,
          tx: {
            ...tx.tx,
            value: {
              ...tx.tx.value,
              msg: tx.tx.value.msg.filter((msg) => msg.type === 'cosmos-sdk/MsgSend') as any
            }
          }
        })) ?? []
    }

    return result
  }

  public async fetchNodeInfo(): Promise<CosmosNodeInfo> {
    const response = await Axios.get(this.url(`/node_info`))
    const nodeInfo = response.data.node_info as CosmosNodeInfo

    return nodeInfo
  }

  public async broadcastSignedTransaction(tx_bytes: string): Promise<string> {
    const response: AxiosResponse<CosmosBroadcastSignedTransactionResponse> = await Axios.post(
      this.url(`/cosmos/tx/v1beta1/txs`),
      {
        tx_bytes,
        mode: 'BROADCAST_MODE_ASYNC'
      },
      {
        headers: {
          'Content-type': 'application/json'
        }
      }
    )

    return response.data.tx_response.txhash
  }

  public async fetchAccount(address: string): Promise<CosmosAccount> {
    const response = await Axios.get(this.url(`/auth/accounts/${address}`))
    const account = response.data.result as CosmosAccount

    return account
  }

  public async fetchDelegations(address: string, filterEmpty: boolean = true): Promise<CosmosDelegation[]> {
    const response = await Axios.get(this.url(`/staking/delegators/${address}/delegations`))
    if (response.data === null) {
      return []
    }
    const delegations = response.data.result as CosmosDelegation[]

    return filterEmpty ? delegations.filter((delegation: CosmosDelegation) => new BigNumber(delegation.balance.amount).gt(0)) : delegations
  }

  public async fetchTotalDelegatedAmount(address: string): Promise<BigNumber> {
    const delegations = await this.fetchDelegations(address)
    const balances = delegations.map((delegation) => delegation.balance)
    return CosmosCoin.sum(CosmosCoin.fromCoins(balances)).decimalPlaces(0, BigNumber.ROUND_FLOOR)
  }

  public async fetchValidator(address: string): Promise<CosmosValidator> {
    const response = await Axios.get(this.url(`/staking/validators/${address}`))
    const validator = response.data.result as CosmosValidator

    return validator
  }

  public async fetchValidators(): Promise<CosmosValidator[]> {
    const response = await Axios.get(this.url('/staking/validators'))
    const validators = response.data.result as CosmosValidator[]

    return validators
  }

  public async fetchSelfDelegation(validatorAddress: string): Promise<CosmosDelegation> {
    const validatorInfo = await Axios.get(this.url(`/distribution/validators/${validatorAddress}`))
    const operatorAddress = validatorInfo.data.result.operator_address
    const response = await Axios.get(this.url(`/staking/delegators/${operatorAddress}/delegations/${validatorAddress}`))
    const delegation = response.data.result as CosmosDelegation

    return delegation
  }

  public async fetchUnbondingDelegations(delegatorAddress: string): Promise<CosmosUnbondingDelegation[]> {
    const response = await Axios.get(this.url(`/staking/delegators/${delegatorAddress}/unbonding_delegations`))
    const unbondingDelegations = response.data.result as CosmosUnbondingDelegation[]

    return unbondingDelegations
  }

  public async fetchTotalUnbondingAmount(address: string): Promise<BigNumber> {
    const unbondingDelegations: CosmosUnbondingDelegation[] = await this.fetchUnbondingDelegations(address)
    if (unbondingDelegations) {
      const unbondings = unbondingDelegations.map((delegation) => delegation.entries).reduce((current, next) => current.concat(next), [])

      return unbondings
        .reduce((current, next) => current.plus(new BigNumber(next.balance)), new BigNumber(0))
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
    }

    return new BigNumber(0)
  }

  public async fetchRewardDetails(delegatorAddress: string): Promise<CosmosRewardDetails[]> {
    return Axios.get(this.url(`/distribution/delegators/${delegatorAddress}/rewards`))
      .then((response) => (response.data.result.rewards ?? []) as CosmosRewardDetails[])
      .catch(() => [])
  }

  public async fetchTotalReward(delegatorAddress: string): Promise<BigNumber> {
    const totalRewards = await Axios.get(this.url(`/distribution/delegators/${delegatorAddress}/rewards`))
      .then((response) => response.data.result.total as { denom: string; amount: string }[])
      .catch(() => [])

    if (totalRewards?.length > 0) {
      return CosmosCoin.sum(CosmosCoin.fromCoins(totalRewards)).decimalPlaces(0, BigNumber.ROUND_FLOOR)
    }

    return new BigNumber(0)
  }

  public async fetchRewardForDelegation(delegatorAddress: string, validatorAddress: string): Promise<BigNumber> {
    const totalRewards = await Axios.get(this.url(`/distribution/delegators/${delegatorAddress}/rewards/${validatorAddress}`))
      .then((response) => response.data.result as { denom: string; amount: string }[])
      .catch(() => [])
    if (totalRewards?.length > 0) {
      return CosmosCoin.sum(CosmosCoin.fromCoins(totalRewards)).decimalPlaces(0, BigNumber.ROUND_FLOOR)
    }

    return new BigNumber(0)
  }

  public async withdrawAllDelegationRewards(
    delegatorAddress: string,
    chainID: string,
    accountNumber: string,
    sequence: string,
    gas: BigNumber,
    fee: BigNumber,
    memo: string,
    simulate: boolean = false
  ): Promise<string> {
    const body = {
      base_req: {
        from: delegatorAddress,
        memo,
        chain_id: chainID,
        account_number: accountNumber,
        sequence,
        gas: gas.toFixed(),
        gas_adjustment: '1.2',
        fees: [
          {
            denom: 'uatom',
            amount: fee.toFixed()
          }
        ],
        simulate
      }
    }
    const response = await Axios.post(this.url(`/distribution/delegators/${delegatorAddress}/rewards`), JSON.stringify(body), {
      headers: {
        'Content-type': 'application/json'
      }
    })

    return response.data.hash
  }

  public async withdrawDelegationRewards(
    delegatorAddress: string,
    validatorAdress: string,
    chainID: string,
    accountNumber: string,
    sequence: string,
    gas: BigNumber,
    fee: BigNumber,
    memo: string,
    simulate: boolean = false
  ): Promise<string> {
    const body = {
      base_req: {
        from: delegatorAddress,
        memo,
        chain_id: chainID,
        account_number: accountNumber,
        sequence,
        gas: gas.toFixed(),
        gas_adjustment: '1.2',
        fees: [
          {
            denom: 'uatom',
            amount: fee.toFixed()
          }
        ],
        simulate
      }
    }
    const response = await Axios.post(
      this.url(`/distribution/delegators/${delegatorAddress}/rewards/${validatorAdress}`),
      JSON.stringify(body),
      {
        headers: {
          'Content-type': 'application/json'
        }
      }
    )

    return response.data.hash
  }

  private url(path: string): string {
    let result = `${this.baseURL}${path}`
    if (this.useCORSProxy) {
      result = `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=${encodeURI(result)}`
    }

    return result
  }
}
