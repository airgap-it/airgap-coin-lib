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
