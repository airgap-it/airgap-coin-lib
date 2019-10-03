import axios from 'axios'
import { BigNumber } from 'bignumber.js'

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
  public_key: string
}

export interface CosmosAccountValue {
  account_number: string
  address: string
  coins: CosmosAccountCoin[]
  sequence: string
}

export interface CosmosAccountCoin {
  denom: string
  amount: string
}

export interface CosmosDelegation {
  delegator_address: string
  validator_address: string
  shares: string
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
  rate: string
  max_rate: string
  max_change_rate: string
  update_time: string
}

export class CosmosNodeClient {
  constructor(public readonly baseURL: string, public useCORSProxy: boolean = false) {}

  public async fetchBalance(address: string): Promise<BigNumber> {
    const response = await axios.get(this.url(`/bank/balances/${address}`))
    const data: any[] = response.data
    if (data.length > 0) {
      return new BigNumber(data[0].amount)
    } else {
      return new BigNumber(0)
    }
  }

  public async fetchNodeInfo(): Promise<CosmosNodeInfo> {
    const response = await axios.get(this.url(`/node_info`))
    const nodeInfo = response.data as CosmosNodeInfo
    return nodeInfo
  }

  public async broadcastSignedTransaction(transaction: string): Promise<string> {
    const response = await axios.post(this.url(`/txs`), transaction, {
      headers: {
        'Content-type': 'application/json'
      }
    })
    return response.data.hash
  }

  public async fetchAccount(address: string): Promise<CosmosAccount> {
    const response = await axios.get(this.url(`/auth/accounts/${address}`))
    const account = response.data as CosmosAccount
    return account
  }

  public async fetchDelegations(address: string): Promise<CosmosDelegation[]> {
    const response = await axios.get(this.url(`/staking/delegators/${address}/delegations`))
    if (response.data === null) {
      return []
    }
    const delegations = response.data as CosmosDelegation[]
    return delegations
  }

  public async fetchValidator(address: string): Promise<CosmosValidator> {
    const response = await axios.get(this.url(`/staking/validators/${address}`))
    const validator = response.data as CosmosValidator
    return validator
  }

  private url(path: string): string {
    let result = `${this.baseURL}${path}`
    if (this.useCORSProxy) {
      result = `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=${encodeURI(result)}`
    }
    return result
  }
}
