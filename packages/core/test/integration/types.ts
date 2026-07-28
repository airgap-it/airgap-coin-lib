import { Amount, Balance, ExtendedPublicKey, PublicKey, UnsignedTransaction } from '@airgap/module-kit'

export type IntegrationCoin = 'btc' | 'eth' | 'polkadot' | 'acurast'

export interface IntegrationBalanceExpectation {
  exact?: string
  min?: string
}

export interface IntegrationPrepareFixture {
  to: string
  amount: Amount<string>
  fee: Amount<string>
  unsignedTx?: UnsignedTransaction
}

export interface IntegrationProtocolContext {
  name: string
  coin: IntegrationCoin
  lib: {
    getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<string>>
    getBalanceOfAddresses?(addresses: string[]): Promise<Balance<string>>
    prepareTransactionWithPublicKey(
      publicKey: PublicKey | ExtendedPublicKey,
      details: { to: string; amount: Amount<string> }[],
      configuration?: { fee?: Amount<string> }
    ): Promise<UnsignedTransaction>
  }
  publicKey: PublicKey | ExtendedPublicKey
  addresses: string[]
  prepare: IntegrationPrepareFixture
  balance: IntegrationBalanceExpectation
  checkAddressesBalance?: boolean
}

export interface IntegrationCheckResult {
  ok: boolean
  error?: string
}
