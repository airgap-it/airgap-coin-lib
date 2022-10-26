import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

import { BigMap } from '../types/contract/BigMap'
import { BigMapEntryFilter } from '../types/contract/BigMapEnrtyFilter'
import { BigMapEntry } from '../types/contract/BigMapEntry'

import { TezosProtocolIndexerClient, Token } from './TezosProtocolIndexerClient'

export class TezosIndexerClient implements TezosProtocolIndexerClient {
  constructor(public readonly baseUrl: string) {}

  public async getTransactions(
    address: string,
    limit?: number,
    offset?: number
  ): Promise<Omit<IAirGapTransaction, 'protocolIdentifier' | 'network'>[]> {
    const url = this.url(`/accounts/${address}/operations`, 'type=transaction', limit, offset)
    const result = (await axios.get<any[]>(url)).data
    return result.map((transaction) => ({
      amount: new BigNumber(transaction.amount).toFixed(),
      fee: new BigNumber(transaction.bakerFee).toFixed(),
      from: [transaction.sender.address],
      to: [transaction.target.address],
      isInbound: transaction.target.address === address,
      hash: transaction.hash,
      timestamp: Math.floor(new Date(transaction.timestamp).getTime() / 1000),
      blockHeight: transaction.level,
      status: transaction.status
    }))
  }

  public async getDelegationInfo(address: string): Promise<{ date: Date; level: number } | undefined> {
    const url = this.url(`/accounts/${address}`)
    const result = (await axios.get(url)).data
    return result.delegate !== undefined && result.delegate.active
      ? {
          date: new Date(result.delegationTime),
          level: result.delegationLevel
        }
      : undefined
  }

  public async getTokenTransactionsForAddress(
    token: Token,
    address: string,
    limit?: number,
    offset?: number
  ): Promise<Omit<IAirGapTransaction, 'protocolIdentifier' | 'network'>[]> {
    const url = this.url(
      `/tokens/transfers`,
      `anyof.from.to.eq=${address}&token.contract=${token.contractAddress}&token.tokenId=${token.id}`,
      limit,
      offset
    )
    const result = (await axios.get<any[]>(url)).data
    return result.map((transaction) => ({
      amount: transaction.amount,
      fee: '0',
      from: [transaction.from?.address ?? ''],
      to: [transaction.to?.address ?? ''],
      isInbound: transaction.to.address === address,
      timestamp: Math.floor(new Date(transaction.timestamp).getTime() / 1000),
      blockHeight: transaction.level
    }))
  }

  public async getTokenTransactions(
    token: Token,
    limit?: number,
    offset?: number
  ): Promise<Omit<IAirGapTransaction, 'protocolIdentifier' | 'network'>[]> {
    const url = this.url(`/tokens/transfers`, `token.contract=${token.contractAddress}&token.tokenId=${token.id}`, limit, offset)
    const result = (await axios.get<any[]>(url)).data
    return result.map((transaction) => ({
      amount: transaction.amount,
      fee: '0',
      from: [transaction.from?.address ?? ''],
      to: [transaction.to?.address ?? ''],
      isInbound: false,
      timestamp: Math.floor(new Date(transaction.timestamp).getTime() / 1000),
      blockHeight: transaction.level
    }))
  }

  public async getTokenBalances(token: Token, limit?: number, offset?: number): Promise<{ address: string; amount: string }[]> {
    const url = this.url(
      `/tokens/balances`,
      `token.contract=${token.contractAddress}&token.tokenId=${token.id}&balance.gt=0`,
      limit,
      offset
    )
    const result = (await axios.get<any[]>(url)).data
    return result.map((item) => ({
      address: item.account.address,
      amount: item.balance
    }))
  }

  public async getContractBigMaps(contractAddress: string, limit?: number, offset?: number): Promise<BigMap[]> {
    const url = this.url(`/contracts/${contractAddress}/bigmaps`, 'micheline=2', limit, offset)
    const result = (await axios.get<any[]>(url)).data
    return result.map((bigMap) => ({
      id: bigMap.ptr,
      path: bigMap.path,
      keyType: bigMap.keyType,
      valueType: bigMap.valueType
    }))
  }

  public async getContractBigMapValues(
    contractAddress: string,
    bigMap: Omit<BigMap, 'keyType' | 'valueType'>,
    filters?: BigMapEntryFilter[],
    limit?: number,
    offset?: number
  ): Promise<BigMapEntry[]> {
    let url = this.url(`/contracts/${contractAddress}/bigmaps/${bigMap.path}/keys`, 'micheline=2', limit, offset)
    if (filters !== undefined) {
      for (const filter of filters) {
        url = `${url}&${filter.field}.${filter.operation}=${filter.value}`
      }
    }
    const result = (await axios.get<any[]>(url)).data
    return result.map((entry) => ({
      bigMapId: bigMap.id,
      key: entry.key,
      keyHash: entry.hash,
      value: entry.value
    }))
  }

  public async getContractBigMapValue(
    contractAddress: string,
    bigMap: Omit<BigMap, 'keyType' | 'valueType'>,
    key: string,
    limit?: number,
    offset?: number
  ): Promise<BigMapEntry> {
    let url = this.url(`/contracts/${contractAddress}/bigmaps/${bigMap.path}/keys/${key}`, 'micheline=2', limit, offset)
    const entry = (await axios.get(url)).data
    return {
      bigMapId: bigMap.id,
      key: entry.key,
      keyHash: entry.hash,
      value: entry.value
    }
  }

  public async getDelegatorContracts(address: string, limit?: number, offset?: number): Promise<string[]> {
    const url = this.url('/operations/originations', `contractManager=${address}&status=applied&select=originatedContract`)
    const result = (await axios.get<any[]>(url)).data
    return result.filter((contract) => contract.kind === 'delegator_contract').map((contract) => contract.address)
  }

  private url(path: string, query?: string, limit?: number, offset?: number): string {
    return `${this.baseUrl}/v1${path}${query ? `?${query}` : ''}${limit ? `${query ? '&' : '?'}limit=${limit}` : ''}${
      offset ? `${query || limit ? '&' : '?'}offset=${offset}` : ''
    }`
  }
}
