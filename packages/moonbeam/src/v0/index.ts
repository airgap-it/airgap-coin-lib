import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { Serializer, IACMessageType, SerializerV3 } from '@airgap/serializer'
import { MoonbaseProtocol } from './protocol/moonbase/MoonbaseProtocol'
import {
  MoonbaseProtocolConfig,
  MoonbaseProtocolNetwork,
  MoonbaseProtocolNetworkExtras,
  MoonbaseProtocolOptions,
  MoonbaseSubscanBlockExplorer
} from './protocol/moonbase/MoonbaseProtocolOptions'
import { MoonbeamProtocol } from './protocol/moonbeam/MoonbeamProtocol'
import { MoonriverProtocol } from './protocol/moonriver/MoonriverProtocol'
import {
  MoonriverProtocolConfig,
  MoonriverProtocolNetwork,
  MoonriverProtocolNetworkExtras,
  MoonriverProtocolOptions,
  MoonriverSubscanBlockExplorer
} from './protocol/moonriver/MoonriverProtocolOptions'

export {
  MoonbeamProtocol,
  MoonbaseProtocol,
  MoonriverProtocol,
  MoonbaseProtocolNetworkExtras,
  MoonbaseSubscanBlockExplorer,
  MoonbaseProtocolConfig,
  MoonbaseProtocolNetwork,
  MoonbaseProtocolOptions,
  MoonriverProtocolNetworkExtras,
  MoonriverSubscanBlockExplorer,
  MoonriverProtocolConfig,
  MoonriverProtocolNetwork,
  MoonriverProtocolOptions
}

// Serializer

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.MOONBEAM
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.MOONBEAM
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.MOONBEAM
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.MOONBEAM
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.MOONRIVER
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.MOONRIVER
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.MOONRIVER
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.MOONRIVER
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.MOONBASE
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.MOONBASE
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.MOONBASE
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.MOONBASE
)
