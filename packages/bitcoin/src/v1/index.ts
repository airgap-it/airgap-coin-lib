import { BlockCypherBlockExplorer } from './block-explorer/BlockCypherBlockExplorer'
import { BitcoinModule } from './module/BitcoinModule'
import { BitcoinLegacyProtocol, createBitcoinLegacyProtocol } from './protocol/BitcoinLegacyProtocol'
import { BitcoinProtocol, createBitcoinProtocol, createBitcoinProtocolOptions } from './protocol/BitcoinProtocol'
import { BitcoinSegwitProtocol, createBitcoinSegwitProtocol } from './protocol/BitcoinSegwitProtocol'
import { BitcoinTaprootProtocol, createBitcoinTaprootProtocol } from './protocol/BitcoinTaprootProtocol'
import { BitcoinTestnetProtocol, createBitcoinTestnetProtocol } from './protocol/BitcoinTestnetProtocol'
import {
  bitcoinSignedTransactionToResponse,
  bitcoinTransactionSignRequestToUnsigned,
  bitcoinTransactionSignResponseToSigned,
  bitcoinUnsignedTransactionToRequest
} from './serializer/v3/schemas/converter/transaction-converter'
import { BitcoinTransactionSignRequest } from './serializer/v3/schemas/definitions/transaction-sign-request-bitcoin'
import { BitcoinLegacyTransactionSignRequest } from './serializer/v3/schemas/definitions/transaction-sign-request-bitcoin-legacy'
import { BitcoinSegwitTransactionSignRequest } from './serializer/v3/schemas/definitions/transaction-sign-request-bitcoin-segwit'
import { BitcoinTaprootTransactionSignRequest } from './serializer/v3/schemas/definitions/transaction-sign-request-bitcoin-taproot'
import { BitcoinTransactionSignResponse } from './serializer/v3/schemas/definitions/transaction-sign-response-bitcoin'
import { BitcoinSegwitTransactionSignResponse } from './serializer/v3/schemas/definitions/transaction-sign-response-bitcoin-segwit'
import { BitcoinLegacyTransactionSignResponse } from './serializer/v3/schemas/definitions/transaction-sign-response-bitcoin-legacy'
import { BitcoinTaprootTransactionSignResponse } from './serializer/v3/schemas/definitions/transaction-sign-response-bitcoin-taproot'
import { BitcoinTransactionValidator } from './serializer/v3/validators/transaction-validator'
import { bitcoinValidators } from './serializer/v3/validators/validators'
import { BitcoinCryptoConfiguration } from './types/crypto'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions, BitcoinUnits } from './types/protocol'
import {
  BitcoinInTransaction,
  BitcoinOutTransaction,
  BitcoinLegacySignedTransaction,
  BitcoinLegacyUnsignedTransaction,
  BitcoinSegwitSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinTaprootSignedTransaction,
  BitcoinTaprootUnsignedTransaction,
  BitcoinSignedTransaction,
  BitcoinTransactionCursor,
  BitcoinUnsignedTransaction
} from './types/transaction'
import { isBitcoinProtocol, isBitcoinSegwitProtocol, isBitcoinTaprootProtocol } from './utils/protocol'

// Module

export { BitcoinModule }

// Protocol

export {
  BitcoinProtocol,
  BitcoinTestnetProtocol,
  BitcoinLegacyProtocol,
  BitcoinSegwitProtocol,
  BitcoinTaprootProtocol,
  createBitcoinProtocol,
  createBitcoinLegacyProtocol,
  createBitcoinTestnetProtocol,
  createBitcoinSegwitProtocol,
  createBitcoinTaprootProtocol,
  createBitcoinProtocolOptions
}

// Block Explorer

export { BlockCypherBlockExplorer }

// Types

export {
  BitcoinCryptoConfiguration,
  BitcoinUnits,
  BitcoinProtocolNetwork,
  BitcoinProtocolOptions,
  BitcoinUnsignedTransaction,
  BitcoinSignedTransaction,
  BitcoinLegacyUnsignedTransaction,
  BitcoinLegacySignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinSegwitSignedTransaction,
  BitcoinTaprootUnsignedTransaction,
  BitcoinTaprootSignedTransaction,
  BitcoinInTransaction,
  BitcoinOutTransaction,
  BitcoinTransactionCursor
}

// Serializer

export {
  BitcoinTransactionSignRequest,
  BitcoinTransactionSignResponse,
  BitcoinLegacyTransactionSignRequest,
  BitcoinSegwitTransactionSignRequest,
  BitcoinTaprootTransactionSignRequest,
  BitcoinLegacyTransactionSignResponse,
  BitcoinSegwitTransactionSignResponse,
  BitcoinTaprootTransactionSignResponse,
  BitcoinTransactionValidator,
  bitcoinValidators,
  bitcoinUnsignedTransactionToRequest,
  bitcoinSignedTransactionToResponse,
  bitcoinTransactionSignRequestToUnsigned,
  bitcoinTransactionSignResponseToSigned
}

// Utils

export { isBitcoinProtocol, isBitcoinSegwitProtocol, isBitcoinTaprootProtocol }
