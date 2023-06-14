import { EtherscanBlockExplorer } from './block-explorer/EtherscanBlockExplorer'
import { EthereumInfoClient } from './clients/info/EthereumInfoClient'
import { EtherscanInfoClient } from './clients/info/EtherscanInfoClient'
import { AirGapNodeClient, EthereumRPCBody, EthereumRPCData, EthereumRPCResponse } from './clients/node/AirGapNodeClient'
import { EthereumNodeClient } from './clients/node/EthereumNodeClient'
import { erc20Tokens } from './module/ERC20Tokens'
import { EthereumModule } from './module/EthereumModule'
import { ERC20Protocol, ERC20ProtocolImpl } from './protocol/erc20/ERC20Protocol'
import { createERC20Token, ERC20Token, ERC20TokenImpl } from './protocol/erc20/ERC20Token'
import { DEFAULT_ETHEREUM_UNITS_METADATA, EthereumBaseProtocol, EthereumBaseProtocolImpl } from './protocol/EthereumBaseProtocol'
import { createEthereumProtocol, createEthereumProtocolOptions, EthereumProtocol } from './protocol/EthereumProtocol'
import {
  ethereumSignedTransactionToResponse,
  ethereumTransactionSignRequestToUnsigned,
  ethereumTransactionSignResponseToSigned,
  ethereumUnsignedTransactionToRequest
} from './serializer/v3/schemas/converter/transaction-converter'
import { EthereumTransactionValidator } from './serializer/v3/validators/transaction-validator'
import { EthereumTransactionSignRequest } from './serializer/v3/schemas/definitions/transaction-sign-request-ethereum'
import { EthereumTypedTransactionSignRequest } from './serializer/v3/schemas/definitions/transaction-sign-request-ethereum-typed'
import { EthereumTransactionSignResponse } from './serializer/v3/schemas/definitions/transaction-sign-response-ethereum'
import { EthereumCryptoConfiguration } from './types/crypto'
import {
  ERC20TokenMetadata,
  ERC20TokenOptions,
  EthereumBaseProtocolOptions,
  EthereumProtocolNetwork,
  EthereumProtocolOptions,
  EthereumUnits
} from './types/protocol'
import {
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTransactionCursor,
  EthereumTypedUnsignedTransaction,
  EthereumUnsignedTransaction
} from './types/transaction'
import { EthereumUtils } from './utils/EthereumUtils'
import { isAnyEthereumProtocol, isEthereumERC20Protocol, isEthereumERC20Token, isEthereumProtocol } from './utils/protocol'

// Module

export { EthereumModule }

// Protocol

export {
  EthereumBaseProtocol,
  EthereumBaseProtocolImpl,
  EthereumProtocol,
  createEthereumProtocol,
  createEthereumProtocolOptions,
  ERC20Protocol,
  ERC20ProtocolImpl,
  ERC20Token,
  ERC20TokenImpl,
  createERC20Token
}

// Block Explorer

export { EtherscanBlockExplorer }

// Constants

export { DEFAULT_ETHEREUM_UNITS_METADATA }

// Clients

export { EthereumNodeClient, AirGapNodeClient, EthereumInfoClient, EtherscanInfoClient }

// Types

export {
  EthereumCryptoConfiguration,
  EthereumUnits,
  EthereumProtocolNetwork,
  EthereumProtocolOptions,
  ERC20TokenMetadata,
  ERC20TokenOptions,
  EthereumBaseProtocolOptions,
  EthereumUnsignedTransaction,
  EthereumTypedUnsignedTransaction,
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTransactionCursor,
  EthereumRPCData,
  EthereumRPCBody,
  EthereumRPCResponse
}

// Serializer

export {
  EthereumTransactionSignRequest,
  EthereumTypedTransactionSignRequest,
  EthereumTransactionSignResponse,
  ethereumUnsignedTransactionToRequest,
  ethereumSignedTransactionToResponse,
  ethereumTransactionSignRequestToUnsigned,
  ethereumTransactionSignResponseToSigned,
  EthereumTransactionValidator
}

// Utils

export { EthereumUtils, isAnyEthereumProtocol, isEthereumProtocol, isEthereumERC20Protocol, isEthereumERC20Token }

// Other

export { erc20Tokens }
