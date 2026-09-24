import { ProtocolNetwork } from '@airgap/module-kit'

export type StellarUnits = 'XLM'

export interface StellarProtocolNetwork extends ProtocolNetwork {}

export interface StellarProtocolOptions {
  network: StellarProtocolNetwork
}

export type StellarAssetUnit = StellarAssetMetadata['assetCode']

export interface StellarAssetMetadata {
  name: string
  assetCode: string
  marketSymbol: string
  issuer: string
  decimals: number
  identifier: string
}

export interface StellarSigner {
  weight: number
  key: string
  type: string
}

export interface StellarThresholds {
  low_threshold: number
  med_threshold: number
  high_threshold: number
}

/**
 * A single entry of the `balances` array returned by Horizon's `GET /accounts/{id}`.
 *
 * Replaces `HorizonApi.BalanceLine` from `@stellar/stellar-sdk`, which is not available in
 * `@stellar/stellar-base`. Only the fields this library reads are declared; `asset_code` and
 * `asset_issuer` are absent on the `native` entry, and `limit` (the trustline limit) is only
 * present on non-native entries, hence optional.
 */
export interface StellarBalanceLine {
  balance: string
  asset_type: 'native' | 'credit_alphanum4' | 'credit_alphanum12' | 'liquidity_pool_shares'
  asset_code?: string
  asset_issuer?: string
  limit?: string
}

/**
 * The subset of Horizon's `GET /accounts/{id}` response this library depends on.
 */
export interface StellarAccountResponse {
  account_id: string
  sequence: string
  balances: StellarBalanceLine[]
  signers: StellarSigner[]
  thresholds: StellarThresholds
}

export enum StellarAssetType {
  NATIVE = 'native',
  ASSET = 'asset',
  XLM = 'XLM'
}

export enum StellarTransactionType {
  PAYMENT = 'payment',
  CREATE_ACCOUNT = 'createAccount',
  PATH_PAYMENT_RECIEVE = 'pathPaymentStrictReceive',
  PATH_PAYMENT_SEND = 'pathPaymentStrictSend',
  CHANGE_TRUST = 'changeTrust',
  INOKE_HOST_FUNCTION = 'invokeHostFunction',
  LIQUIDITY_POOL_DEPOSIT = 'liquidityPoolDeposit',
  LIQUIDITY_POOL_WITHDRAW = 'liquidityPoolWithdraw',
  SET_OPTIONS = 'setOptions'
}
