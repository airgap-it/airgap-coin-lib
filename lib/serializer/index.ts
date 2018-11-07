import { EthereumUnsignedTransactionSerializer } from './unsigned-transactions/ethereum-transactions.serializer'
import { BitcoinUnsignedTransactionSerializer } from './unsigned-transactions/bitcoin-transactions.serializer'
import { UnsignedTransactionSerializer } from './unsigned-transaction.serializer'
import { BitcoinSignedTransactionSerializer } from './signed-transactions/bitcoin-transactions.serializer'
import { EthereumSignedTransactionSerializer } from './signed-transactions/ethereum-transactions.serializer'
import { SignedTransactionSerializer } from './signed-transaction.serializer'
import { AeternitySignedTransactionSerializer } from './signed-transactions/aeternity-transactions.serializer'
import { AeternityUnsignedTransactionSerializer } from './unsigned-transactions/aeternity-transactions.serializer'
import { ProtocolNotSupported } from './errors'

export function unsignedTransactionSerializerByProtocolIdentifier(protocolIdentifier: string): UnsignedTransactionSerializer {
  const implementedSerializers = {
    eth: EthereumUnsignedTransactionSerializer,
    btc: BitcoinUnsignedTransactionSerializer,
    ae: AeternityUnsignedTransactionSerializer
  }

  const protocol = Object.keys(implementedSerializers).find(protocol => protocol.startsWith(protocolIdentifier))

  if (!protocol) {
    throw new ProtocolNotSupported()
  }

  return new implementedSerializers[protocol]()
}

export function signedTransactionSerializerByProtocolIdentifier(protocolIdentifier: string): SignedTransactionSerializer {
  const implementedSerializers = {
    eth: EthereumSignedTransactionSerializer,
    btc: BitcoinSignedTransactionSerializer,
    ae: AeternitySignedTransactionSerializer
  }

  const protocol = Object.keys(implementedSerializers).find(protocol => protocol.startsWith(protocolIdentifier))

  if (!protocol) {
    throw new ProtocolNotSupported()
  }

  return new implementedSerializers[protocol]()
}
