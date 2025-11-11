import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'
import {
  BitcoinLegacySignedTransaction,
  BitcoinLegacyUnsignedTransaction,
  BitcoinSegwitSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinSignedTransaction,
  BitcoinTaprootSignedTransaction,
  BitcoinTaprootUnsignedTransaction,
  BitcoinUnsignedTransaction
} from '../../../../types/transaction'
import { BitcoinTransactionSignRequest } from '../definitions/transaction-sign-request-bitcoin'
import { BitcoinSegwitTransactionSignRequest } from '../definitions/transaction-sign-request-bitcoin-segwit'
import { BitcoinTransactionSignResponse } from '../definitions/transaction-sign-response-bitcoin'
import { BitcoinSegwitTransactionSignResponse } from '../definitions/transaction-sign-response-bitcoin-segwit'
import { BitcoinTaprootTransactionSignRequest } from '../definitions/transaction-sign-request-bitcoin-taproot'
import { BitcoinTaprootTransactionSignResponse } from '../definitions/transaction-sign-response-bitcoin-taproot'
import { BitcoinLegacyTransactionSignRequest } from '../definitions/transaction-sign-request-bitcoin-legacy'
import { BitcoinLegacyTransactionSignResponse } from '../definitions/transaction-sign-response-bitcoin-legacy'

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

export function bitcoinLegacyUnsignedTransactionToRequest(
  unsigned: BitcoinSegwitUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): BitcoinLegacyTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function bitcoinLegacySignedTransactionToResponse(
  signed: BitcoinSegwitSignedTransaction,
  accountIdentifier: string
): BitcoinLegacyTransactionSignResponse {
  return { transaction: signed.psbt, accountIdentifier }
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

export function bitcoinTaprootUnsignedTransactionToRequest(
  unsigned: BitcoinTaprootUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): BitcoinTaprootTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function bitcoinTaprootSignedTransactionToResponse(
  signed: BitcoinTaprootSignedTransaction,
  accountIdentifier: string
): BitcoinTaprootTransactionSignResponse {
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

export function bitcoinLegacyTransactionSignRequestToUnsigned(
  request: BitcoinLegacyTransactionSignRequest
): BitcoinLegacyUnsignedTransaction {
  return newUnsignedTransaction(request.transaction)
}

export function bitcoinLegacyTransactionSignResponseToSigned(
  response: BitcoinLegacyTransactionSignResponse
): BitcoinLegacySignedTransaction {
  return newSignedTransaction<BitcoinLegacySignedTransaction>({ psbt: response.transaction })
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

export function bitcoinTaprootTransactionSignRequestToUnsigned(
  request: BitcoinTaprootTransactionSignRequest
): BitcoinTaprootUnsignedTransaction {
  return newUnsignedTransaction(request.transaction)
}

export function bitcoinTaprootTransactionSignResponseToSigned(
  response: BitcoinTaprootTransactionSignResponse
): BitcoinTaprootSignedTransaction {
  return newSignedTransaction<BitcoinSegwitSignedTransaction>({ psbt: response.transaction })
}
