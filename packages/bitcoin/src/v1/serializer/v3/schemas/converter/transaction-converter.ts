import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'
import {
  BitcoinSegwitSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinSignedTransaction,
  BitcoinUnsignedTransaction
} from '../../../../types/transaction'
import { BitcoinTransactionSignRequest } from '../definitions/transaction-sign-request-bitcoin'
import { BitcoinSegwitTransactionSignRequest } from '../definitions/transaction-sign-request-bitcoin-segwit'
import { BitcoinTransactionSignResponse } from '../definitions/transaction-sign-response-bitcoin'
import { BitcoinSegwitTransactionSignResponse } from '../definitions/transaction-sign-response-bitcoin-segwit'

export function bitcoinUnsignedTransactionToRequest(
  unsigned: BitcoinUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): BitcoinTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function bitcoinSignedTransactionToResponse(
  signed: BitcoinSignedTransaction,
  accountIdentifier: string
): BitcoinTransactionSignResponse {
  return { ...signed, accountIdentifier }
}

export function bitcoinSegwitUnsignedTransactionToRequest(
  unsigned: BitcoinSegwitUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): BitcoinSegwitTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function bitcoinSegwitSignedTransactionToResponse(
  signed: BitcoinSegwitSignedTransaction,
  accountIdentifier: string
): BitcoinSegwitTransactionSignResponse {
  return { transaction: signed.psbt, accountIdentifier }
}

export function bitcoinTransactionSignRequestToUnsigned(request: BitcoinTransactionSignRequest): BitcoinUnsignedTransaction {
  return newUnsignedTransaction<BitcoinUnsignedTransaction>(request.transaction)
}

export function bitcoinTransactionSignResponseToSigned(response: BitcoinTransactionSignResponse): BitcoinSignedTransaction {
  return newSignedTransaction<BitcoinSignedTransaction>({
    from: response.from,
    to: response.to,
    amount: response.amount,
    fee: response.fee,
    transaction: response.transaction
  })
}

export function bitcoinSegwitTransactionSignRequestToUnsigned(
  request: BitcoinSegwitTransactionSignRequest
): BitcoinSegwitUnsignedTransaction {
  return newUnsignedTransaction(request.transaction)
}

export function bitcoinSegwitTransactionSignResponseToSigned(
  response: BitcoinSegwitTransactionSignResponse
): BitcoinSegwitSignedTransaction {
  return newSignedTransaction<BitcoinSegwitSignedTransaction>({ psbt: response.transaction })
}
