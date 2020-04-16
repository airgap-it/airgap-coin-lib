import { ProtocolNotSupported } from './errors'
import { SignedTransactionSerializer } from './signed-transaction.serializer'
import { AeternitySignedTransactionSerializer } from './signed-transactions/aeternity-transactions.serializer'
import { BitcoinSignedTransactionSerializer } from './signed-transactions/bitcoin-transactions.serializer'
import { EthereumSignedTransactionSerializer } from './signed-transactions/ethereum-transactions.serializer'
import { TezosSignedTransactionSerializer } from './signed-transactions/tezos-transactions.serializer'
import { UnsignedTransactionSerializer } from './unsigned-transaction.serializer'
import { AeternityUnsignedTransactionSerializer } from './unsigned-transactions/aeternity-transactions.serializer'
import { BitcoinUnsignedTransactionSerializer } from './unsigned-transactions/bitcoin-transactions.serializer'
import { EthereumUnsignedTransactionSerializer } from './unsigned-transactions/ethereum-transactions.serializer'
import { TezosUnsignedTransactionSerializer } from './unsigned-transactions/tezos-transactions.serializer'
import { SubstrateUnsignedTransactionsSerializer } from './unsigned-transactions/substrate-transactions.serializer'
import { SubstrateSignedTransactionSerializer } from './signed-transactions/substrate-transactions.serializer'

export function unsignedTransactionSerializerByProtocolIdentifier(protocolIdentifier: string): UnsignedTransactionSerializer {
  const implementedSerializers = {
    eth: EthereumUnsignedTransactionSerializer,
    btc: BitcoinUnsignedTransactionSerializer,
    grs: BitcoinUnsignedTransactionSerializer,
    ae: AeternityUnsignedTransactionSerializer,
    xtz: TezosUnsignedTransactionSerializer,
    polkadot: SubstrateUnsignedTransactionsSerializer,
    kusama: SubstrateUnsignedTransactionsSerializer
  }

  const protocol = Object.keys(implementedSerializers).find(protocol => protocolIdentifier.startsWith(protocol))

  if (!protocol) {
    throw new ProtocolNotSupported()
  }

  return new implementedSerializers[protocol]()
}

export function signedTransactionSerializerByProtocolIdentifier(protocolIdentifier: string): SignedTransactionSerializer {
  const implementedSerializers = {
    eth: EthereumSignedTransactionSerializer,
    btc: BitcoinSignedTransactionSerializer,
    grs: BitcoinSignedTransactionSerializer,
    ae: AeternitySignedTransactionSerializer,
    xtz: TezosSignedTransactionSerializer,
    polkadot: SubstrateSignedTransactionSerializer,
    kusama: SubstrateSignedTransactionSerializer
  }

  const protocol = Object.keys(implementedSerializers).find(protocol => protocolIdentifier.startsWith(protocol))

  if (!protocol) {
    throw new ProtocolNotSupported()
  }

  return new implementedSerializers[protocol]()
}
