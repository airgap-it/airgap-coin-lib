import { EthereumUnsignedTransactionSerializer } from './unsigned-transactions/ethereum-transactions.serializer'
import { BitcoinUnsignedTransactionSerializer } from './unsigned-transactions/bitcoin-transactions.serializer'
import { UnsignedTransactionSerializer } from './unsigned-transaction.serializer'
import { BitcoinSignedTransactionSerializer } from './signed-transactions/bitcoin-transactions.serializer'
import { EthereumSignedTransactionSerializer } from './signed-transactions/ethereum-transactions.serializer'
import { SignedTransactionSerializer } from './signed-transaction.serializer'

const protocolVersion = 1

export { protocolVersion }

export function unsignedTransactionSerializerByProtocolIdentifier(protocolIdentifier: string): UnsignedTransactionSerializer {
  const implementedSerializers = {
    eth: EthereumUnsignedTransactionSerializer,
    btc: BitcoinUnsignedTransactionSerializer
  }

  const protocol = Object.keys(implementedSerializers).find(protocol => protocol.startsWith(protocolIdentifier))

  if (!protocol) {
    throw Error('no compatible protocol registered.')
  }

  return new implementedSerializers[protocol]()
}

export function signedTransactionSerializerByProtocolIdentifier(protocolIdentifier: string): SignedTransactionSerializer {
  const implementedSerializers = {
    eth: EthereumSignedTransactionSerializer,
    btc: BitcoinSignedTransactionSerializer
  }

  const protocol = Object.keys(implementedSerializers).find(protocol => protocol.startsWith(protocolIdentifier))

  if (!protocol) {
    throw Error('no compatible protocol registered.')
  }

  return new implementedSerializers[protocol]()
}
