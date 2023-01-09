import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'

import { AeternityAddress } from './protocol/AeternityAddress'
import { AeternityCryptoClient } from './protocol/AeternityCryptoClient'
import { AeternityProtocol } from './protocol/AeternityProtocol'
import { AeternalBlockExplorer, AeternityProtocolNetwork, AeternityProtocolOptions } from './protocol/AeternityProtocolOptions'
import { AeternityTransactionValidatorFactory, AeternityTransactionValidatorFactoryV2 } from './serializer/validators/transaction-validator'
import { SignedAeternityTransaction } from './types/signed-transaction-aeternity'
import { RawAeternityTransaction } from './types/transaction-aeternity'
import { UnsignedAeternityTransaction } from './types/unsigned-transaction-aeternity'

export {
  AeternityProtocol,
  AeternityCryptoClient,
  AeternityProtocolOptions,
  AeternalBlockExplorer,
  AeternityProtocolNetwork,
  AeternityAddress,
  RawAeternityTransaction,
  UnsignedAeternityTransaction,
  SignedAeternityTransaction
}

// Serializer

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-aeternity.json') },
  MainProtocolSymbols.AE
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-aeternity.json') },
  MainProtocolSymbols.AE
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-aeternity.json') },
  MainProtocolSymbols.AE
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-aeternity.json') },
  MainProtocolSymbols.AE
)

Serializer.addValidator(MainProtocolSymbols.AE, new AeternityTransactionValidatorFactoryV2())
SerializerV3.addValidator(MainProtocolSymbols.AE, new AeternityTransactionValidatorFactory())
