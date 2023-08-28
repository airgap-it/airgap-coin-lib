import { createMinaProtocol } from '../../../protocol/MinaProtocol'
import { MinaPayment, MinaSignature } from '../../../types/transaction'

export const minaValidators = {
  isValidMinaPayment: async (value: unknown) => {
    if (typeof value !== 'object') {
      return 'not an object'
    }

    const protocol = createMinaProtocol()
    const metadata = await protocol.getMetadata()
    const addressPattern = RegExp(metadata.account?.address?.regex ?? '.*')
    const amountPattern = RegExp('d+')

    const payment = value as Partial<MinaPayment>
    if (typeof payment.to !== 'string' || !addressPattern.test(payment.to)) {
      return 'not a valid Mina `to` address'
    }
    if (typeof payment.from !== 'string' || !addressPattern.test(payment.from)) {
      return 'not a valid Mina `from` address'
    }
    if (typeof payment.amount !== 'string' || !amountPattern.test(payment.amount)) {
      return 'not a valid amount'
    }
    if (typeof payment.fee !== 'string' || !amountPattern.test(payment.fee)) {
      return 'not a valid fee'
    }
    if (typeof payment.nonce !== 'string' || !amountPattern.test(payment.nonce) || parseInt(payment.nonce, 10) < 0) {
      return 'not a valid nonce'
    }
    if (typeof payment.memo !== 'undefined' && typeof payment.memo !== 'string') {
      return 'not a valid memo'
    }
    if (typeof payment.validUntil !== 'undefined' && (typeof payment.validUntil !== 'string' || !amountPattern.test(payment.validUntil))) {
      return 'not a valid timestamp'
    }

    return null
  },
  isValidMinaSignature: (value: unknown) => {
    if (typeof value !== 'object') {
      return 'not an object'
    }

    const signature = value as Partial<MinaSignature>

    if (signature.type === 'raw') {
      if (typeof signature.value !== 'string') {
        return 'not a valid Mina raw signature'
      }

      return null
    }

    if (signature.type === 'legacy') {
      if (typeof signature.field !== 'string') {
        return 'not a valid Mina legacy signature'
      }
      if (typeof signature.scalar !== 'string') {
        return 'not a valid Mina legacy signature'
      }

      return null
    }

    return 'not a valid Mina signature type'
  },
  isValidMinaNetworkType: (value: unknown) => {
    if (!value) {
      return null
    }

    if (typeof value !== 'string') {
      return 'not a string'
    }

    if (value !== 'mainnet' && value !== 'testnet') {
      return 'not a valid Mina network type'
    }

    return null
  }
}
