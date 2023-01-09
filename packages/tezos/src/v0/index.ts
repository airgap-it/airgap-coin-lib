import { MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageType, Serializer, SerializerV3 } from '@airgap/serializer'
import { ImportAccountAction, ImportAccoutActionContext } from './actions/GetKtAccountsAction'
import { TezosDomains } from './protocol/domains/TezosDomains'
import { TezosBTC } from './protocol/fa/TezosBTC'
import { TezosBTCTez, TezosBTCTezProtocolConfig } from './protocol/fa/TezosBTCtez'
import { TezosCTez, TezosCTezProtocolConfig } from './protocol/fa/TezosCTez'
import { TezosDOGA, TezosDOGAProtocolConfig } from './protocol/fa/TezosDOGA'
import { TezosETHtz } from './protocol/fa/TezosETHtz'
import { TezosFA1p2Protocol } from './protocol/fa/TezosFA1p2Protocol'
import { TezosFA1Protocol } from './protocol/fa/TezosFA1Protocol'
import { TezosFA2Protocol } from './protocol/fa/TezosFA2Protocol'
import { TezosFAProtocol } from './protocol/fa/TezosFAProtocol'
import {
  TezosBTCProtocolConfig,
  TezosETHtzProtocolConfig,
  TezosFA2ProtocolConfig,
  TezosFA2ProtocolOptions,
  TezosFAProtocolConfig,
  TezosFAProtocolOptions,
  TezosKolibriUSDProtocolConfig,
  TezosStakerProtocolConfig,
  TezosUSDProtocolConfig,
  TezosUUSDProtocolConfig,
  TezosWrappedProtocolConfig,
  TezosYOUProtocolConfig
} from './protocol/fa/TezosFAProtocolOptions'
import { TezosKolibriUSD } from './protocol/fa/TezosKolibriUSD'
import { TezosPlenty, TezosPlentyProtocolConfig } from './protocol/fa/TezosPlanty'
import { TezosQUIPU, TezosQUIPUProtocolConfig } from './protocol/fa/TezosQUIPU'
import { TezosSIRS, TezosSIRSProtocolConfig } from './protocol/fa/TezosSIRS'
import { TezosStaker } from './protocol/fa/TezosStaker'
import { TezosUBTC, TezosUBTCProtocolConfig } from './protocol/fa/TezosUBTC'
import { TezosUDEFI, TezosUDEFIProtocolConfig } from './protocol/fa/TezosUDEFI'
import { TezosUSD } from './protocol/fa/TezosUSD'
import { TezosUSDT, TezosUSDTProtocolConfig } from './protocol/fa/TezosUSDT'
import { TezosUUSD } from './protocol/fa/TezosUUSD'
import { TezosWRAP, TezosWRAPProtocolConfig } from './protocol/fa/TezosWRAP'
import { TezosWrapped } from './protocol/fa/TezosWrapped'
import { TezosYOU } from './protocol/fa/TezosYOU'
import { TezosIndexerClient } from './protocol/indexerClient/TezosIndexerClient'
import { TezosKtProtocol } from './protocol/kt/TezosKtProtocol'
import { TezosSaplingProtocol } from './protocol/sapling/TezosSaplingProtocol'
import {
  TezosSaplingExternalMethodProvider,
  TezosSaplingProtocolConfig,
  TezosSaplingProtocolOptions,
  TezosShieldedTezProtocolConfig
} from './protocol/sapling/TezosSaplingProtocolOptions'
import { TezosShieldedTezProtocol } from './protocol/sapling/TezosShieldedTezProtocol'
import { TezosAddress } from './protocol/TezosAddress'
import { TezosCryptoClient } from './protocol/TezosCryptoClient'
import {
  BakerInfo,
  DelegationInfo,
  DelegationRewardInfo,
  TezosDelegatorAction,
  TezosNetwork,
  TezosPayoutInfo,
  TezosProtocol
} from './protocol/TezosProtocol'
import {
  TezosBlockExplorer,
  TezosProtocolConfig,
  TezosProtocolNetwork,
  TezosProtocolNetworkExtras,
  TezosProtocolOptions
} from './protocol/TezosProtocolOptions'
import { TezosUtils } from './protocol/TezosUtils'
import { TezosSaplingTransaction } from './protocol/types/sapling/TezosSaplingTransaction'
import { TezosTransactionCursor } from './protocol/types/TezosTransactionCursor'
import { TezosTransactionResult } from './protocol/types/TezosTransactionResult'
import { TezosWrappedOperation } from './protocol/types/TezosWrappedOperation'
import { SignedTezosTransaction } from './types/signed-transaction-tezos'
import { SignedTezosSaplingTransaction } from './types/signed-transaction-tezos-sapling'
import { RawTezosTransaction } from './types/transaction-tezos'
import { UnsignedTezosTransaction } from './types/unsigned-transaction-tezos'
import { UnsignedTezosSaplingTransaction } from './types/unsigned-transaction-tezos-sapling'

export {
  TezosProtocol,
  TezosKtProtocol,
  TezosFAProtocol,
  TezosFA1Protocol,
  TezosFA1p2Protocol,
  TezosFA2Protocol,
  TezosBTC,
  TezosStaker,
  TezosUSD,
  TezosUSDT,
  TezosETHtz as TezosETH,
  TezosUUSD,
  TezosYOU,
  TezosUDEFI,
  TezosUBTC,
  TezosWrapped,
  TezosWRAP,
  TezosKolibriUSD,
  TezosCTez,
  TezosPlenty,
  TezosQUIPU,
  TezosDOGA,
  TezosBTCTez,
  TezosSIRS,
  TezosTransactionResult,
  TezosTransactionCursor,
  BakerInfo,
  DelegationRewardInfo,
  DelegationInfo,
  TezosPayoutInfo,
  TezosDelegatorAction,
  TezosCryptoClient,
  TezosProtocolNetworkExtras,
  TezosBlockExplorer,
  TezosProtocolNetwork,
  TezosProtocolConfig,
  TezosProtocolOptions,
  TezosFAProtocolConfig,
  TezosFA2ProtocolConfig,
  TezosBTCProtocolConfig,
  TezosETHtzProtocolConfig as TezosETHProtocolConfig,
  TezosUUSDProtocolConfig,
  TezosYOUProtocolConfig,
  TezosWrappedProtocolConfig,
  TezosKolibriUSDProtocolConfig,
  TezosStakerProtocolConfig,
  TezosUSDProtocolConfig,
  TezosUSDTProtocolConfig,
  TezosCTezProtocolConfig,
  TezosPlentyProtocolConfig,
  TezosUDEFIProtocolConfig,
  TezosUBTCProtocolConfig,
  TezosWRAPProtocolConfig,
  TezosQUIPUProtocolConfig,
  TezosDOGAProtocolConfig,
  TezosSIRSProtocolConfig,
  TezosBTCTezProtocolConfig,
  TezosFAProtocolOptions,
  TezosFA2ProtocolOptions,
  TezosNetwork,
  TezosSaplingProtocol,
  TezosShieldedTezProtocol,
  TezosSaplingProtocolOptions,
  TezosSaplingProtocolConfig,
  TezosShieldedTezProtocolConfig,
  TezosSaplingExternalMethodProvider,
  TezosSaplingTransaction,
  TezosUtils,
  TezosWrappedOperation,
  TezosAddress,
  RawTezosTransaction,
  TezosDomains,
  TezosIndexerClient,
  UnsignedTezosTransaction,
  UnsignedTezosSaplingTransaction,
  SignedTezosTransaction,
  SignedTezosSaplingTransaction
}

export { ImportAccountAction, ImportAccoutActionContext }

// Serializer

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  MainProtocolSymbols.XTZ
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  MainProtocolSymbols.XTZ
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  MainProtocolSymbols.XTZ
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  MainProtocolSymbols.XTZ
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos-sapling.json') },
  MainProtocolSymbols.XTZ_SHIELDED
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos-sapling.json') },
  MainProtocolSymbols.XTZ_SHIELDED
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos-sapling.json') },
  MainProtocolSymbols.XTZ_SHIELDED
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos-sapling.json') },
  MainProtocolSymbols.XTZ_SHIELDED
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_BTC
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_BTC
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_BTC
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_BTC
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_ETHTZ
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_ETHTZ
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_ETHTZ
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_ETHTZ
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_KUSD
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_KUSD
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_KUSD
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_KUSD
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_KT
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_KT
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_KT
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_KT
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_USD
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_USD
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_USD
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_USD
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_USDT
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_USDT
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_USDT
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_USDT
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_UUSD
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_UUSD
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_UUSD
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_UUSD
)

Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v2/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_YOU
)
Serializer.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v2/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_YOU
)

SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: require('./serializer/schemas/v3/transaction-sign-request-tezos.json') },
  SubProtocolSymbols.XTZ_YOU
)
SerializerV3.addSchema(
  IACMessageType.TransactionSignResponse,
  { schema: require('./serializer/schemas/v3/transaction-sign-response-tezos.json') },
  SubProtocolSymbols.XTZ_YOU
)
