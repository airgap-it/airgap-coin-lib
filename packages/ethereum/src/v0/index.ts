import { MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'

import { GenericERC20 } from './protocol/erc20/GenericERC20'
import { EthereumAddress } from './protocol/EthereumAddress'
import { EthereumClassicProtocol } from './protocol/EthereumClassicProtocol'
import { EthereumCryptoClient } from './protocol/EthereumCryptoClient'
import { EthereumProtocol } from './protocol/EthereumProtocol'
import {
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumProtocolConfig,
  EthereumProtocolNetwork,
  EthereumProtocolNetworkExtras,
  EthereumProtocolOptions,
  EtherscanBlockExplorer
} from './protocol/EthereumProtocolOptions'
import { EthereumRopstenProtocol } from './protocol/EthereumRopstenProtocol'
import { EthereumTransactionValidatorFactory, EthereumTransactionValidatorFactoryV2 } from './serializer/validators/transaction-validator'
import { SignedEthereumTransaction } from './types/signed-transaction-ethereum'
import { RawEthereumTransaction } from './types/transaction-ethereum'
import { UnsignedEthereumTransaction } from './types/unsigned-transaction-ethereum'
import { UnsignedTypedEthereumTransaction } from './types/unsigned-transaction-ethereum-typed'

export {
  EthereumProtocol,
  EthereumRopstenProtocol,
  EthereumClassicProtocol,
  GenericERC20,
  EthereumCryptoClient,
  EthereumProtocolNetworkExtras,
  EtherscanBlockExplorer,
  EthereumProtocolNetwork,
  EthereumProtocolConfig,
  EthereumProtocolOptions,
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumAddress,
  RawEthereumTransaction,
  UnsignedEthereumTransaction,
  UnsignedTypedEthereumTransaction,
  SignedEthereumTransaction
}

// Serializer

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-ethereum.json') },
  MainProtocolSymbols.ETH
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-ethereum.json') },
  MainProtocolSymbols.ETH
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-ethereum.json') },
  MainProtocolSymbols.ETH
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-ethereum-typed.json') },
  MainProtocolSymbols.ETH
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-ethereum.json') },
  MainProtocolSymbols.ETH
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-ethereum.json') },
  SubProtocolSymbols.ETH_ERC20
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-ethereum.json') },
  SubProtocolSymbols.ETH_ERC20
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-ethereum.json') },
  SubProtocolSymbols.ETH_ERC20
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-ethereum.json') },
  SubProtocolSymbols.ETH_ERC20
)

Serializer.addValidator(MainProtocolSymbols.ETH, new EthereumTransactionValidatorFactoryV2())
SerializerV3.addValidator(MainProtocolSymbols.ETH, new EthereumTransactionValidatorFactory())
