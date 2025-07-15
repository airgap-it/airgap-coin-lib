import { TransactionBuilder, Networks, StrKey } from '@stellar/stellar-sdk'
import { createStellarProtocol } from '../../../protocol/StellarProtocol'
import { newPublicKey } from '@airgap/module-kit'

export const stellarValidators = {
  isStellarNetworkId: (value: unknown) => {
    if (value === null || typeof value === 'undefined') {
      return null
    }

    if (value !== Networks.PUBLIC) {
      return 'is not a valid Stellar mainnet network ID'
    }

    return null
  },

  isValidStellarTx: (transaction: unknown) => {
    if (transaction === null || typeof transaction === 'undefined') {
      return null
    }

    try {
      const xdr = typeof transaction === 'string' ? transaction : (transaction as { transaction: string }).transaction
      TransactionBuilder.fromXDR(xdr, Networks.PUBLIC)
      return null
    } catch {
      return 'is not a valid Stellar transaction XDR'
    }
  },

  isStellarAddress: (address: unknown) => {
    if (typeof address !== 'string' || !StrKey.isValidEd25519PublicKey(address)) {
      return 'is not a valid Stellar address'
    }

    return null
  },

  isValidStellarAccount: async (address: string) => {
    try {
      const protocol = createStellarProtocol()
      await protocol.getTransactionsForPublicKey(newPublicKey(address, 'encoded'), 1)
      return null
    } catch {
      return 'not a valid or reachable Stellar account'
    }
  }
}
