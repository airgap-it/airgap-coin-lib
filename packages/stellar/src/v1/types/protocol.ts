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
