import { AirGapTransaction, Amount } from '@airgap/module-kit'

import { BigMap } from '../types/contract/bigmap/BigMap'
import { BigMapEntryFilter } from '../types/contract/bigmap/BigMapEnrtyFilter'
import { BigMapEntry, BigMapEntryType } from '../types/contract/bigmap/BigMapEntry'
import { TezosUnits } from '../types/protocol'

export interface Token {
  contractAddress: string
  id: number
}

export interface TezosIndexerClient {
  baseUrl: string
  getTransactions(address: string, limit?: number, offset?: number): Promise<Omit<AirGapTransaction<TezosUnits>, 'network'>[]>
  getDelegationInfo(address: string): Promise<{ date: Date; level: number } | undefined>

  getTokenTransactionsForAddress(
    token: Token,
    address: string,
    limit?: number,
    offset?: number
  ): Promise<Omit<AirGapTransaction<never, TezosUnits>, 'network'>[]>
  getTokenTransactions(token: Token, limit?: number, offset?: number): Promise<Omit<AirGapTransaction<never, TezosUnits>, 'network'>[]>
  getTokenBalances(token: Token, limit?: number, offset?: number): Promise<{ address: string; amount: Amount<never> }[]>

  getContractCodeHash(contractAddress: string): Promise<{ typeHash: string; codeHash: string }>
  getContractBigMaps(contractAddress: string, limit?: number, offset?: number): Promise<BigMap[]>
  getContractBigMapValues<T extends BigMapEntryType>(
    contractAddress: string,
    bigMap: Omit<BigMap, 'keyType' | 'valueType'>,
    entryType: T,
    filters?: BigMapEntryFilter[],
    limit?: number,
    offset?: number
  ): Promise<BigMapEntry<T>[]>
  getContractBigMapValue<T extends BigMapEntryType>(
    contractAddress: string,
    bigMap: Omit<BigMap, 'keyType' | 'valueType'>,
    key: string,
    entryType: T,
    limit?: number,
    offset?: number
  ): Promise<BigMapEntry<T>>
  getDelegatorContracts(address: string, limit?: number, offset?: number): Promise<string[]>
}
