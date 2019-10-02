import axios from 'axios'
import { BigNumber } from 'bignumber.js'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

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
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public async fetchTransactions(address: string, page: number, limit: number): Promise<IAirGapTransaction[]> {
    // TODO: need to find a better way to do this
    const promises: Promise<IAirGapTransaction[]>[] = []
    promises.push(
      new Promise((resolve, reject) => {
        axios
          .get(`${this.baseURL}/txs?message.sender=${address}&page=${page}&limit=${limit}`)
          .then(response => {
            // const transactionResponse = response.data
            const airGapTransactions: IAirGapTransaction[] = []
            // for (const transaction of transactionResponse) {
            // }
            resolve(airGapTransactions)
          })
          .catch(reject)
      })
    )
    promises.push(
      new Promise((resolve, reject) => {
        axios
          .get(`${this.baseURL}/txs?transfer.receiver=${address}&page=${page}&limit=${limit}`)
          .then(response => {
            // const transactionResponse = response.data
            const airGapTransactions: IAirGapTransaction[] = []
            // for (const transaction of transactionResponse) {
            // }
            resolve(airGapTransactions)
          })
          .catch(reject)
      })
    )
    return Promise.all(promises).then(transactions => {
      return transactions.reduce((current, next) => {
        return current.concat(next)
      })
    })
  }

  public async fetchBalance(address: string): Promise<BigNumber> {
    const response = await axios.get(`${this.baseURL}/bank/balances/${address}`)
    const data: any[] = response.data
    if (data.length > 0) {
      return new BigNumber(data[0].amount)
    } else {
      return new BigNumber(0)
    }
  }

  public async fetchNodeInfo(): Promise<CosmosNodeInfo> {
    const response = await axios.get(`${this.baseURL}/node_info`)
    const nodeInfo = response.data as CosmosNodeInfo
    return nodeInfo
  }

  public async broadcastSignedTransaction(transaction: string): Promise<string> {
    const response = await axios.post(`${this.baseURL}/txs`, transaction, {
      headers: {
        'Content-type': 'application/json'
      }
    })
    return response.data.hash
  }

  public async fetchAccount(address: string): Promise<CosmosAccount> {
    const response = await axios.get(`${this.baseURL}/auth/accounts/${address}`)
    const account = response.data as CosmosAccount
    return account
  }

  public async fetchDelegations(address: string): Promise<CosmosDelegation[]> {
    const response = await axios.get(`${this.baseURL}/staking/delegators/${address}/delegations`)
    const delegations = response.data as CosmosDelegation[]
    return delegations
  }

  public async fetchValidator(address: string): Promise<CosmosValidator> {
    const response = await axios.get(`${this.baseURL}/staking/validators/${address}`)
    const validator = response.data as CosmosValidator
    return validator
  }
}
