import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'

import { GroestlcoinProtocol } from './protocol/GroestlcoinProtocol'
import {
  CryptoidBlockExplorer,
  GroestlcoinProtocolConfig,
  GroestlcoinProtocolNetwork,
  GroestlcoinProtocolNetworkExtras,
  GroestlcoinProtocolOptions
} from './protocol/GroestlcoinProtocolOptions'
import { GroestlcoinTestnetProtocol } from './protocol/GroestlcoinTestnetProtocol'

export {
  GroestlcoinProtocol,
  GroestlcoinTestnetProtocol,
  GroestlcoinProtocolNetworkExtras,
  CryptoidBlockExplorer,
  GroestlcoinProtocolNetwork,
  GroestlcoinProtocolConfig,
  GroestlcoinProtocolOptions
}

// Serializer

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/bitcoin/v0/serializer/schemas/v2/transaction-sign-request-bitcoin.json') },
  MainProtocolSymbols.GRS
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/bitcoin/v0/serializer/schemas/v2/transaction-sign-response-bitcoin.json') },
  MainProtocolSymbols.GRS
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('@airgap/bitcoin/v0/serializer/schemas/v3/transaction-sign-request-bitcoin.json') },
  MainProtocolSymbols.GRS
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('@airgap/bitcoin/v0/serializer/schemas/v3/transaction-sign-response-bitcoin.json') },
  MainProtocolSymbols.GRS
)
