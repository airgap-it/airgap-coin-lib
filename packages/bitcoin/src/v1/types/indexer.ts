export interface UTXOResponse {
  txid: string
  vout: number
  value: string
  height: number
  confirmations: number
  address: string
  path: string
}

export interface Vin {
  txid: string
  vout: number
  sequence: any
  n: number
  addresses: string[]
  isAddress: boolean
  isOwn: boolean
  value: string
  hex: string
}

export interface Vout {
  value: string
  n: number
  hex: string
  addresses: string[]
  isAddress: boolean
  isOwn?: boolean
  spent?: boolean
}

export interface Transaction {
  txid: string
  version: number
  vin: Vin[]
  vout: Vout[]
  blockHash: string
  blockHeight: number
  confirmations: number
  blockTime: number
  value: string
  valueIn: string
  fees: string
  hex: string
}

export interface Token {
  type: string
  name: string
  path: string
  transfers: number
  decimals: number
  balance: string
  totalReceived: string
  totalSent: string
}

export interface XPubResponse {
  page: number
  totalPages: number
  itemsOnPage: number
  address: string
  balance: string
  totalReceived: string
  totalSent: string
  unconfirmedBalance: string
  unconfirmedTxs: number
  txs: number
  transactions?: Transaction[]
  totalTokens?: number
  tokens?: Token[]
}

export interface AddressResponse {
  page: number
  totalPages: number
  itemsOnPage: number
  address: string
  balance: string
  totalReceived: string
  totalSent: string
  unconfirmedBalance: string
  unconfirmedTxs: number
  txs: number
  transactions?: Transaction[]
}
