import { SyncProtocolUtils, EncodedType } from './serializer'
import { getProtocolByIdentifier } from '..'

const syncProtocol = new SyncProtocolUtils()
;(async () => {
  const deserializedSync = await syncProtocol.fromURLScheme('airgap-vault://?d=')

  if (deserializedSync.type === EncodedType.UNSIGNED_TRANSACTION) {
    const protocol = getProtocolByIdentifier(deserializedSync.protocol)

    if (protocol) {
      protocol.signWithPrivateKey(Buffer.from('', 'hex'), deserializedSync.payload.transaction)
    }
  }
})()
