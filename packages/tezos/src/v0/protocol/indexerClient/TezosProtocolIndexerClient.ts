import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

import { BigMap } from '../types/contract/BigMap'
import { BigMapEntryFilter } from '../types/contract/BigMapEnrtyFilter'
import { BigMapEntry } from '../types/contract/BigMapEntry'

export interface Token {
  contractAddress: string
  id: number
}

export interface TezosProtocolIndexerClient {
  baseUrl: string
  getTransactions(address: string, limit?: number, offset?: number): Promise<Omit<IAirGapTransaction, 'protocolIdentifier' | 'network'>[]>
  getDelegationInfo(address: string): Promise<{ date: Date; level: number } | undefined>

  getTokenTransactionsForAddress(
    token: Token,
    address: string,
    limit?: number,
    offset?: number
  ): Promise<Omit<IAirGapTransaction, 'protocolIdentifier' | 'network'>[]>
  getTokenTransactions(token: Token, limit?: number, offset?: number): Promise<Omit<IAirGapTransaction, 'protocolIdentifier' | 'network'>[]>
  getTokenBalances(token: Token, limit?: number, offset?: number): Promise<{ address: string; amount: string }[]>

  getContractCodeHash(contractAddress: string): Promise<{ typeHash: string; codeHash: string }>
  getContractBigMaps(contractAddress: string, limit?: number, offset?: number): Promise<BigMap[]>
  getContractBigMapValues(
    contractAddress: string,
    bigMap: Omit<BigMap, 'keyType' | 'valueType'>,
    filters?: BigMapEntryFilter[],
    limit?: number,
    offset?: number
  ): Promise<BigMapEntry[]>
  getContractBigMapValue(
    contractAddress: string,
    bigMap: Omit<BigMap, 'keyType' | 'valueType'>,
    key: string,
    limit?: number,
    offset?: number
  ): Promise<BigMapEntry>
  getDelegatorContracts(address: string, limit?: number, offset?: number): Promise<string[]>
}
