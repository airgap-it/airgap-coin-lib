import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'

import { BitcoinAddress } from './protocol/BitcoinAddress'
import { BitcoinCryptoClient } from './protocol/BitcoinCryptoClient'
import { BitcoinProtocol } from './protocol/BitcoinProtocol'
import {
  BitcoinProtocolConfig,
  BitcoinProtocolNetwork,
  BitcoinProtocolNetworkExtras,
  BitcoinProtocolOptions,
  BlockcypherBlockExplorer
} from './protocol/BitcoinProtocolOptions'
import { BitcoinSegwitAddress } from './protocol/BitcoinSegwitAddress'
import { BitcoinSegwitProtocol } from './protocol/BitcoinSegwitProtocol'
import { BitcoinTestnetProtocol } from './protocol/BitcoinTestnetProtocol'
import { BitcoinTransactionValidatorFactory, BitcoinTransactionValidatorFactoryV2 } from './serializer/validators/transaction-validator'
import { SignedBitcoinTransaction } from './types/signed-transaction-bitcoin'
import { SignedBitcoinSegwitTransaction } from './types/signed-transaction-bitcoin-segwit'
import { RawBitcoinSegwitTransaction, RawBitcoinTransaction } from './types/transaction-bitcoin'
import { UnsignedBitcoinTransaction } from './types/unsigned-transaction-bitcoin'
import { UnsignedBitcoinSegwitTransaction } from './types/unsigned-transaction-bitcoin-segwit'

export {
  BitcoinProtocol,
  BitcoinTestnetProtocol,
  BitcoinCryptoClient,
  BitcoinProtocolNetworkExtras,
  BlockcypherBlockExplorer,
  BitcoinProtocolNetwork,
  BitcoinProtocolConfig,
  BitcoinProtocolOptions,
  BitcoinAddress,
  RawBitcoinTransaction,
  UnsignedBitcoinTransaction,
  UnsignedBitcoinSegwitTransaction,
  SignedBitcoinTransaction,
  SignedBitcoinSegwitTransaction
}

// Segwit
export { BitcoinSegwitProtocol, BitcoinSegwitAddress, RawBitcoinSegwitTransaction }

// Serializer

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-bitcoin-segwit.json') },
  MainProtocolSymbols.BTC_SEGWIT
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-bitcoin-segwit.json') },
  MainProtocolSymbols.BTC_SEGWIT
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-bitcoin.json') },
  MainProtocolSymbols.BTC
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-bitcoin.json') },
  MainProtocolSymbols.BTC
)

// SerializerV3.addSchema(
//   IACMessageType.TransactionSignRequest,
//   { schema: require('./serializer/schemas/v3/transaction-sign-request-bitcoin.json') },
//   MainProtocolSymbols.BTC
// )
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-bitcoin.json') },
  MainProtocolSymbols.BTC
)

Serializer.addValidator(MainProtocolSymbols.BTC, new BitcoinTransactionValidatorFactoryV2())
SerializerV3.addValidator(MainProtocolSymbols.BTC, new BitcoinTransactionValidatorFactory())
