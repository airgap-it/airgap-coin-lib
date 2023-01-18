import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'

import { AstarProtocol } from './protocol/astar/AstarProtocol'
import {
  AstarProtocolConfig,
  AstarProtocolNetwork,
  AstarProtocolNetworkExtras,
  AstarProtocolOptions,
  AstarSubscanBlockExplorer
} from './protocol/astar/AstarProtocolOptions'
import { ShidenProtocol } from './protocol/shiden/ShidenProtocol'
import {
  ShidenProtocolConfig,
  ShidenProtocolNetwork,
  ShidenProtocolNetworkExtras,
  ShidenProtocolOptions,
  ShidenSubscanBlockExplorer
} from './protocol/shiden/ShidenProtocolOptions'

export {
  AstarProtocol,
  AstarProtocolNetworkExtras,
  AstarSubscanBlockExplorer,
  AstarProtocolConfig,
  AstarProtocolNetwork,
  AstarProtocolOptions,
  ShidenProtocol,
  ShidenProtocolNetworkExtras,
  ShidenSubscanBlockExplorer,
  ShidenProtocolConfig,
  ShidenProtocolNetwork,
  ShidenProtocolOptions
}

// Serializer

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.ASTAR
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.ASTAR
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.ASTAR
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.ASTAR
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.SHIDEN
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.SHIDEN
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.SHIDEN
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.SHIDEN
)
