import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'

import { KusamaProtocol } from './protocol/kusama/KusamaProtocol'
import {
  KusamaProtocolConfig,
  KusamaProtocolNetwork,
  KusamaProtocolNetworkExtras,
  KusamaProtocolOptions,
  KusamaSubscanBlockExplorer
} from './protocol/kusama/KusamaProtocolOptions'
import { PolkadotProtocol } from './protocol/polkadot/PolkadotProtocol'
import {
  PolkadotProtocolConfig,
  PolkadotProtocolNetwork,
  PolkadotProtocolNetworkExtras,
  PolkadotProtocolOptions,
  PolkadotSubscanBlockExplorer
} from './protocol/polkadot/PolkadotProtocolOptions'

export {
  PolkadotProtocol,
  KusamaProtocol,
  KusamaProtocolNetworkExtras,
  KusamaSubscanBlockExplorer as KusamaPolkascanBlockExplorer,
  KusamaProtocolConfig,
  KusamaProtocolNetwork,
  KusamaProtocolOptions,
  PolkadotProtocolNetworkExtras,
  PolkadotSubscanBlockExplorer,
  PolkadotProtocolConfig,
  PolkadotProtocolNetwork,
  PolkadotProtocolOptions
}

// Serializer

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.POLKADOT
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.POLKADOT
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.POLKADOT
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.POLKADOT
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.KUSAMA
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v2/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.KUSAMA
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-request-substrate.json') },
  MainProtocolSymbols.KUSAMA
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/substrate/v0/serializer/schemas/v3/transaction-sign-response-substrate.json') },
  MainProtocolSymbols.KUSAMA
)
