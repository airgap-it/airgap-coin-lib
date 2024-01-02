import Axios, { AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Amount, newAmount } from '@airgap/module-kit'

import { CosmosCoin } from '../types/data/CosmosCoin'
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
} from '../types/rpc'

export class CosmosNodeClient<Units extends string> {
  constructor(public readonly baseURL: string, public useCORSProxy: boolean = false) {}

  public async fetchBalance(address: string, denom: Units): Promise<{ total: Amount<Units>; available: Amount<Units> }> {
    const response = await Axios.get(this.url(`/cosmos/bank/v1beta1/balances/${address}`))

    const data: CosmosAccountCoin[] = response.data.balances

    if (data.length > 0) {
      const availableBalance = CosmosCoin.sum(CosmosCoin.fromCoins(data), denom)
      const totalBalance = (
        await Promise.all([
          this.fetchTotalReward(address, denom),
          this.fetchTotalUnbondingAmount(address, denom),
          this.fetchTotalDelegatedAmount(address, denom)
        ])
      ).reduce((current, next) => current.plus(next.value), new BigNumber(availableBalance))

      return {
        total: newAmount(totalBalance.decimalPlaces(0, BigNumber.ROUND_FLOOR), denom),
        available: newAmount(availableBalance.decimalPlaces(0, BigNumber.ROUND_FLOOR), denom)
      }
    } else {
      return { total: newAmount(new BigNumber(0), denom), available: newAmount(new BigNumber(0), denom) }
    }
  }

  public async fetchSendTransactionsFor(
    address: string,
    limit: number,
    offset: number,
    isSender: boolean = true
  ): Promise<CosmosPagedSendTxsResponse> {
    const response = await Axios.get<CosmosPagedSendTxsResponse>(
      this.url(
        `/cosmos/tx/v1beta1/txs?events=${
          isSender ? 'transfer.sender' : 'transfer.recipient'
        }='${address}'&pagination.limit=${limit}&pagination.offset=${offset}&orderBy=ORDER_BY_DESC`
      )
    )

    return response.data
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
    const response = await Axios.get(this.url(`/cosmos/staking/v1beta1/delegations/${address}`))
    if (response.data === null) {
      return []
    }
    const delegations = response.data.delegation_responses as CosmosDelegation[]

    return filterEmpty ? delegations.filter((delegation: CosmosDelegation) => new BigNumber(delegation.balance.amount).gt(0)) : delegations
  }

  public async fetchTotalDelegatedAmount(address: string, denom: Units): Promise<Amount<Units>> {
    const delegations = await this.fetchDelegations(address)
    const balances = delegations.map((delegation) => delegation.balance)
    return newAmount(CosmosCoin.sum(CosmosCoin.fromCoins(balances), denom).decimalPlaces(0, BigNumber.ROUND_FLOOR), denom)
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
    const response = await Axios.get(this.url(`/cosmos/staking/v1beta1/delegators/${delegatorAddress}/unbonding_delegations`))
    const unbondingDelegations = response.data.unbonding_responses as CosmosUnbondingDelegation[]

    return unbondingDelegations
  }

  public async fetchTotalUnbondingAmount(address: string, denom: Units): Promise<Amount<Units>> {
    const unbondingDelegations: CosmosUnbondingDelegation[] = await this.fetchUnbondingDelegations(address)
    if (unbondingDelegations) {
      const unbondings = unbondingDelegations.map((delegation) => delegation.entries).reduce((current, next) => current.concat(next), [])

      const total = unbondings
        .reduce((current, next) => current.plus(new BigNumber(next.balance)), new BigNumber(0))
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
      return newAmount(total, denom)
    }

    return newAmount(new BigNumber(0), denom)
  }

  public async fetchRewardDetails(delegatorAddress: string): Promise<CosmosRewardDetails[]> {
    return Axios.get(this.url(`/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`))
      .then((response) => (response.data.rewards ?? []) as CosmosRewardDetails[])
      .catch(() => [])
  }

  public async fetchTotalReward(delegatorAddress: string, denom: Units): Promise<Amount<Units>> {
    const totalRewards = await Axios.get(this.url(`/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`))
      .then((response) => response.data.total as { denom: string; amount: string }[])
      .catch(() => [])

    if (totalRewards?.length > 0) {
      return newAmount(CosmosCoin.sum(CosmosCoin.fromCoins(totalRewards), denom).decimalPlaces(0, BigNumber.ROUND_FLOOR), denom)
    }

    return newAmount(new BigNumber(0), denom)
  }

  public async fetchRewardForDelegation(delegatorAddress: string, validatorAddress: string, denom: Units): Promise<Amount<Units>> {
    const totalRewards = await Axios.get(this.url(`/distribution/delegators/${delegatorAddress}/rewards/${validatorAddress}`))
      .then((response) => response.data.result as { denom: string; amount: string }[])
      .catch(() => [])
    if (totalRewards?.length > 0) {
      return newAmount(CosmosCoin.sum(CosmosCoin.fromCoins(totalRewards), denom).decimalPlaces(0, BigNumber.ROUND_FLOOR), denom)
    }

    return newAmount(new BigNumber(0), denom)
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
