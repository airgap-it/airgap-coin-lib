# Serialization / Deserialization

## Request to sign a transaction

This can be used to request for example [Airgap Vault](https://github.com/airgap-it/airgap-vault) to sign a transation.

```typescript
import { EthereumProtocol, SyncProtocolUtils, EncodedType } from 'airgap-coin-lib'

...

const ethereum = new EthereumProtocol()
const rawEthereumTx = await ethereum.prepareTransactionFromPublicKey(
    publicKey,
    [destination],
    [amount],
    fee
)

const syncProtocolUtils = new SyncProtocolUtils()

const syncString = await syncProtocolUtils.serialize({
    version: SERIALIZER_VERSION,
    protocol: ethereum.identifier,
    type: EncodedType.UNSIGNED_TRANSACTION,
    payload: {
        publicKey: publicKey,
        callback: 'airgap-wallet://?d=',
        transaction: rawEthereumTx
    }
})
```

The returned string `syncString` can now be used to be embedded in a QR-Code, or sent using other means to a device capable of deserializing it, for example using deep-links or through HTTP.

```typescript
import { EthereumProtocol, SyncProtocolUtils, EncodedType } from 'airgap-coin-lib'

const syncProtocolUtils = new SyncProtocolUtils()
const deserializedSync = await syncProtocol.deserialize(syncString)
```

`deserializedSync` is of type `DeserializedSyncProtocol`, having a member that exposes the `EncodedType` of content (`type`), as well as the payload. The payload in this case would be a `UnsignedTransaction`, consisting of public key, callback-url and the raw transaction string that can be signed using the appropriate signing method of the protocol.

## Request to broadcast a signed transaction

This can be used to request for example [Airgap Wallet](https://github.com/airgap-it/airgap-wallet) to broadcast a signed transaction to the network.

```typescript
import { EthereumProtocol, SyncProtocolUtils, EncodedType } from 'airgap-coin-lib'

...

const ethereum = new EthereumProtocol()

...

const signedEthereumTx = await ethereum.signWithPrivateKey(privateKey, rawEthereumTx)

const syncProtocolUtils = new SyncProtocolUtils()

const deserializedTxSigningRequest: DeserializedSyncProtocol = {
    protocol: ethereum.protocolIdentifier,
    type: EncodedType.SIGNED_TRANSACTION,
    payload: {
        accountIdentifier: publicKey.substr(-6) // you can use really anything here, up to you
        transaction: signedEthereumTx,
        // the following properties are optional for certain currencies and not included in the actual QR, but can be recovered form the signed tx
        from: from,
        amount: amount,
        fee: fee,
        to: to
    }
}

const serializedTx = await syncProtocol.serialize(deserializedTxSigningRequest)
```

The returned string `serializedTx` can now be used to be embedded in a QR-Code, or sent using other means to a device capable of deserializing it, for example using deep-links or through HTTP.

```typescript
import { EthereumProtocol, SyncProtocolUtils, EncodedType } from 'airgap-coin-lib'

const syncProtocolUtils = new SyncProtocolUtils()
const deserializedSync = await syncProtocol.deserialize(syncString)
```

`deserializedSync` is of type `DeserializedSyncProtocol`, having a member that exposes the `EncodedType` of content (`type`), as well as the payload. The payload in this case would be a `SignedTransaction`, consisting of public key, callback-url and the signed transaction string.
