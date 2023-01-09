import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'

import { CosmosAddress } from './protocol/CosmosAddress'
import { CosmosCryptoClient } from './protocol/CosmosCryptoClient'
import { CosmosDelegationActionType, CosmosProtocol } from './protocol/CosmosProtocol'
import { CosmosProtocolConfig, CosmosProtocolNetwork, CosmosProtocolOptions, MintscanBlockExplorer } from './protocol/CosmosProtocolOptions'
import { CosmosTransaction } from './protocol/CosmosTransaction'
import { CosmosUnbondingDelegation, CosmosValidator } from './protocol/CosmosTypes'
import { CosmosTransactionValidatorFactory, CosmosTransactionValidatorFactoryV2 } from './serializer/validators/transaction-validator'
import { SignedCosmosTransaction } from './types/signed-transaction-cosmos'
import { UnsignedCosmosTransaction } from './types/transaction-cosmos'
import { SerializableUnsignedCosmosTransaction } from './types/unsigned-transaction-cosmos'

export {
  CosmosProtocol,
  CosmosCryptoClient,
  MintscanBlockExplorer,
  CosmosProtocolNetwork,
  CosmosProtocolConfig,
  CosmosProtocolOptions,
  CosmosUnbondingDelegation,
  CosmosValidator,
  CosmosDelegationActionType,
  CosmosAddress,
  CosmosTransaction,
  UnsignedCosmosTransaction,
  SignedCosmosTransaction,
  SerializableUnsignedCosmosTransaction
}

// Serializer

function unsignedTransactionTransformer(value: SerializableUnsignedCosmosTransaction): SerializableUnsignedCosmosTransaction {
  value.transaction = CosmosTransaction.fromJSON(value) as any

  return value
}

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-cosmos.json'), transformer: unsignedTransactionTransformer },
  MainProtocolSymbols.COSMOS
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-cosmos.json') },
  MainProtocolSymbols.COSMOS
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-cosmos.json'), transformer: unsignedTransactionTransformer },
  MainProtocolSymbols.COSMOS
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-cosmos.json') },
  MainProtocolSymbols.COSMOS
)

Serializer.addValidator(MainProtocolSymbols.COSMOS, new CosmosTransactionValidatorFactoryV2())
SerializerV3.addValidator(MainProtocolSymbols.COSMOS, new CosmosTransactionValidatorFactory())
