import { EthereumUnsignedTransactionSerializer } from './transactions/ethereum-transactions.serializer'
import { TransactionSerializer } from './transactions.serializer'

const protocolVersion = 1

export { protocolVersion }

export function serializerByProtocolIdentifier(protocolIdentifier: string): TransactionSerializer {
  const implementedSerializers = {
    eth: EthereumUnsignedTransactionSerializer
  }

  const protocol = Object.keys(implementedSerializers).find(protocol => protocol.startsWith(protocolIdentifier))

  if (!protocol) {
    throw Error('no compatible protocol registered.')
  }

  return new implementedSerializers[protocol]()
}
