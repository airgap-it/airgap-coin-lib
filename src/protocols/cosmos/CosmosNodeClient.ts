import Axios, { AxiosResponse } from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'

export interface CosmosNodeInfo {
  protocol_version: {
    p2p: string
    block: string
    app: string
  }
  id: string
  listen_addr: string
  network: string
  version: string
  channels: string
  moniker: string
  other: {
    tx_index: string
    rpc_address: string
  }
}

export interface CosmosAccount {
  type: string
  value: CosmosAccountValue
}

export interface CosmosAccountValue {
  account_number: string
  address: string
  coins: CosmosAccountCoin[]
  sequence: string
  public_key?: string
}

export interface CosmosAccountCoin {
  denom: string
  amount: string
}

export interface CosmosDelegation {
  delegator_address: string
  validator_address: string
  shares: string
  balance: string
}

export interface CosmosUnbondingDelegation {
  delegator_address: string
  validator_address: string
  initial_balance: string
  balance: string
  creation_height: number
  min_time: number
}

export interface CosmosValidator {
  operator_address: string
  consensus_pubkey: string
  jailed: boolean
  status: number
  tokens: string
  delegator_shares: string
  description: CosmosValidatorDescription
  unbonding_height: string
  unbonding_time: string
  commission: CosmosValidatorCommission
  min_self_delegation: string
}

export interface CosmosValidatorDescription {
  moniker: string
  identity: string
  website: string
  details: string
}

export interface CosmosValidatorCommission {
  commission_rates: CosmosValidatorCommissionRate
  update_time: string
}

export interface CosmosValidatorCommissionRate {
  rate: string
  max_rate: string
  max_change_rate: string
}

export interface CosmosBroadcastSignedTransactionResponse {
  txhash: string
  height: number
}

export class CosmosNodeClient {
  constructor(public readonly baseURL: string, public useCORSProxy: boolean = false) {}

  public async fetchBalance(address: string, totalBalance?: boolean): Promise<BigNumber> {
    const response = await Axios.get(this.url(`/bank/balances/${address}`))
    const data: any[] = response.data.result
    if (data.length > 0) {
      const availableBalance = data[0].amount
      if (totalBalance) {
        const results = await Promise.all([
          this.fetchTotalReward(address), 
          this.fetchTotalUnbondingAmount(address), 
          this.fetchTotalDelegatedAmount(address)
        ])
        const totalRewardValue = results[0]
        const totalUnbondingValue = results[1]
        const totalDelegatedValue = results[2]
        return BigNumber.sum.apply(null, [availableBalance, totalRewardValue, totalUnbondingValue, totalDelegatedValue])
      } else {
        return new BigNumber(availableBalance)
      }
    } else {
      return new BigNumber(0)
    }
  }

  public async fetchNodeInfo(): Promise<CosmosNodeInfo> {
    const response = await Axios.get(this.url(`/node_info`))
    const nodeInfo = response.data.node_info as CosmosNodeInfo

    return nodeInfo
  }

  public async broadcastSignedTransaction(transaction: string): Promise<string> {
    const response: AxiosResponse<CosmosBroadcastSignedTransactionResponse> = await Axios.post(this.url(`/txs`), transaction, {
      headers: {
        'Content-type': 'application/json'
      }
    })

    return response.data.txhash
  }

  public async fetchAccount(address: string): Promise<CosmosAccount> {
    const response = await Axios.get(this.url(`/auth/accounts/${address}`))
    const account = response.data.result as CosmosAccount

    return account
  }

  public async fetchDelegations(address: string): Promise<CosmosDelegation[]> {
    const response = await Axios.get(this.url(`/staking/delegators/${address}/delegations`))
    if (response.data === null) {
      return []
    }
    const delegations = response.data.result as CosmosDelegation[]

    return delegations
  }

  public async fetchTotalDelegatedAmount(address: string): Promise<BigNumber> {
    const delegations = await this.fetchDelegations(address)
    return new BigNumber(delegations.map(delegation => parseFloat(delegation.shares)).reduce((a, b) => a + b, 0))
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
    const unbondingDelegations = response.data as CosmosUnbondingDelegation[]
    return unbondingDelegations
  }

  public async fetchTotalUnbondingAmount(address: string): Promise<BigNumber> {
    const unbondingDelegations: CosmosUnbondingDelegation[] = await this.fetchUnbondingDelegations(address)
    if (unbondingDelegations) {
      return new BigNumber(unbondingDelegations.map(delegation => parseFloat(delegation.balance)).reduce((a, b) => a + b, 0))
    }
    return new BigNumber(0)
  }

  public async fetchTotalReward(delegatorAddress: string): Promise<BigNumber> {
    const response = await Axios.get(this.url(`/distribution/delegators/${delegatorAddress}/rewards`))
    const totalRewards = response.data.result.total as { denom: string; amount: string }[]
    if (totalRewards.length > 0) {
      return new BigNumber(totalRewards[0].amount)
    }

    return new BigNumber(0)
  }

  public async fetchRewardForDelegation(delegatorAddress: string, validatorAddress: string): Promise<BigNumber> {
    const response = await Axios.get(this.url(`/distribution/delegators/${delegatorAddress}/rewards/${validatorAddress}`))
    const totalRewards = response.data.result as { denom: string; amount: string }[]
    if (totalRewards.length > 0) {
      return new BigNumber(totalRewards[0].amount)
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
