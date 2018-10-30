import { SyncProtocolUtils, EncodedType, DeserializedSyncProtocol } from './serializer'
import { getProtocolByIdentifier, EthereumProtocol } from '..'

const syncProtocol = new SyncProtocolUtils()
;(async () => {
  const ethereumProtocol = new EthereumProtocol()

  const deserializedSync = await syncProtocol.fromURLScheme('airgap-vault://?d=')

  if (deserializedSync.type === EncodedType.UNSIGNED_TRANSACTION) {
    const protocol = getProtocolByIdentifier(deserializedSync.protocol)

    if (protocol) {
      protocol.signWithPrivateKey(Buffer.from('', 'hex'), deserializedSync.payload.transaction)
    }
  }
})()
