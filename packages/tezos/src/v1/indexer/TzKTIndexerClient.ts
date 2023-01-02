import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import { AirGapTransaction, Amount, newAmount } from '@airgap/module-kit'

import { BigMap } from '../types/contract/bigmap/BigMap'
import { BigMapEntryFilter } from '../types/contract/bigmap/BigMapEnrtyFilter'
import { BigMapEntry } from '../types/contract/bigmap/BigMapEntry'
import { TezosUnits } from '../types/protocol'

import { TezosIndexerClient, Token } from './TezosIndexerClient'

export class TzKTIndexerClient implements TezosIndexerClient {
  constructor(public readonly baseUrl: string) {}

  public async getTransactions(
    address: string,
    limit?: number,
    offset?: number
  ): Promise<Omit<AirGapTransaction<TezosUnits>, 'network'>[]> {
    const url = this.url(`/accounts/${address}/operations`, 'type=transaction', limit, offset)
    const result = (await axios.get<any[]>(url)).data

    return result.map(
      (transaction): Omit<AirGapTransaction<TezosUnits>, 'network'> => ({
        from: [transaction.sender.address],
        to: [transaction.target.address],
        isInbound: transaction.target.address === address,

        amount: newAmount(transaction.amount, 'blockchain'),
        fee: newAmount(transaction.bakerFee, 'blockchain'),

        timestamp: Math.floor(new Date(transaction.timestamp).getTime() / 1000),
        status: {
          type: transaction.status === 'applied' ? 'applied' : transaction.status === 'failed' ? 'failed' : 'unknown',
          hash: transaction.hash,
          block: transaction.level.toString()
        }
      })
    )
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
  ): Promise<Omit<AirGapTransaction<never, TezosUnits>, 'network'>[]> {
    const url = this.url(
      `/tokens/transfers`,
      `anyof.from.to.eq=${address}&token.contract=${token.contractAddress}&token.tokenId=${token.id}`,
      limit,
      offset
    )
    const result = (await axios.get<any[]>(url)).data

    return result.map(
      (transaction): Omit<AirGapTransaction<never, TezosUnits>, 'network'> => ({
        from: [transaction.from?.address ?? ''],
        to: [transaction.to?.address ?? ''],
        isInbound: transaction.to.address === address,

        amount: newAmount(transaction.amount, 'blockchain'),
        fee: newAmount(0, 'blockchain'),

        timestamp: Math.floor(new Date(transaction.timestamp).getTime() / 1000),
        status: {
          type: 'unknown',
          block: transaction.level.toString()
        }
      })
    )
  }

  public async getTokenTransactions(
    token: Token,
    limit?: number,
    offset?: number
  ): Promise<Omit<AirGapTransaction<never, TezosUnits>, 'network'>[]> {
    const url = this.url(`/tokens/transfers`, `token.contract=${token.contractAddress}&token.tokenId=${token.id}`, limit, offset)
    const result = (await axios.get<any[]>(url)).data

    return result.map(
      (transaction): Omit<AirGapTransaction<never, TezosUnits>, 'network'> => ({
        from: [transaction.from?.address ?? ''],
        to: [transaction.to?.address ?? ''],
        isInbound: false,

        amount: newAmount(transaction.amount, 'blockchain'),
        fee: newAmount(0, 'blockchain'),

        timestamp: Math.floor(new Date(transaction.timestamp).getTime() / 1000),
        status: {
          type: 'unknown',
          block: transaction.level
        }
      })
    )
  }

  public async getTokenBalances(token: Token, limit?: number, offset?: number): Promise<{ address: string; amount: Amount<never> }[]> {
    const url = this.url(
      `/tokens/balances`,
      `token.contract=${token.contractAddress}&token.tokenId=${token.id}&balance.gt=0`,
      limit,
      offset
    )
    const result = (await axios.get<any[]>(url)).data
    return result.map((item) => ({
      address: item.account.address,
      amount: newAmount(item.balance, 'blockchain')
    }))
  }

  public async getContractCodeHash(contractAddress: string): Promise<{ typeHash: string; codeHash: string }> {
    const url = this.url(`/contracts/${contractAddress}`)
    const result = (await axios.get<any>(url)).data
    return {
      typeHash: result.typeHash.toString(),
      codeHash: result.codeHash.toString()
    }
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
