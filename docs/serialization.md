# Serializer

The `airgap-coin-lib` also feature a protocol-agnostic scheme that allows to encode and decode requests for signing, sharing public data of accounts and more using base58 encoded strings.

## Getting Started

Import the desired protocol, `SyncProtocolUtils` and `EncodedType` from `airgap-coin-lib`. Now you are able to use the `SyncProtocolUtils` to serialize and deserialize different payloads. Currently supported are:

- Syncing the public data of an account (public key + derivation path + protocol-identifier)
- Requests to sign a TX
- Requests to broadcast a signed TX

## Structure

The code that defines the sync scheme can be found [here](https://github.com/airgap-it/airgap-coin-lib/blob/master/lib/serializer/serializer.ts)

The general structure of a sync request is the following:

```rlp
[
  [1], // Version
  [1], // EncodedType
  ["eth"], // Protocol
  ["payload"] // Payload depending on the EncodedType
]
```

We currently support 3 types:

```typescript
export enum EncodedType {
  UNSIGNED_TRANSACTION,
  SIGNED_TRANSACTION,
  WALLET_SYNC
}
```

For each protocol and type, a new serializer has to be created in order to efficiently serialize the data.

For example in Ethereum, the raw unsigned transaction is in JSON. Instead of saving the plain JSON, which is quite size-inefficient, we instead convert the JSON to an RLP compatible Buffer Array.

```typescript
const serializedTx: SerializedSyncProtocolTransaction = toBuffer([
  [
    transaction.transaction.nonce,
    transaction.transaction.gasPrice,
    transaction.transaction.gasLimit,
    transaction.transaction.to,
    transaction.transaction.value,
    transaction.transaction.chainId,
    transaction.transaction.data ? transaction.transaction.data : '0x' // data is optional, include empty if necessary
  ],
  transaction.publicKey, // publicKey
  transaction.callback ? transaction.callback : 'airgap-wallet://?d=' // callback-scheme
]) as SerializedSyncProtocolTransaction
```

The deserialization step will then recreate the original JSON:

```typescript
const unsignedEthereumTx: UnsignedEthereumTransaction = {
  publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
  transaction: {
    nonce: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0].toString(),
    gasPrice: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][1] as Buffer).toString(),
    gasLimit: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][2] as Buffer).toString(),
    to: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][3] as Buffer).toString(),
    value: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][4] as Buffer).toString(),
    chainId: parseInt((serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][5] as Buffer).toString(), 10),
    data: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][6] as Buffer).toString()
  },
  callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
}
```

### Serialization

We use RLP for the following reasons:

- RLP is enjoying more adaption in crypto, with Aeternity adapting RLP as well after Ethereum
- It is able to serialize and deserialize data in a predictable way
- Easy to understand and implement
- Encoded Data as Binary, size-efficient

### Encoding

We use base58 to encode the strings because it is URL-safe.

### Transport Layers

The string output from the [Serializer](#structure) chapter above can be sent through different transports.

Currently in AirGap, we use the following 3 transports:

- QR Codes
- Deeplinking (URL)
- Clipboard copy/paste

Other transports would be easily possible, but are not used in AirGap:

- Push Notifications
- WebSockets
- Webhook
- Bluetooth
- NFC

Depending on the transport, the **size** can be a big issue. QR codes are limited in size (theoretical limits, but also practical limits after which the codes become hard to scan). And while tehcnically not having a predefined limit, some browsers do have a maximum URL length.

Size is especially problematic in these cases:

- Many inputs/outputs (eg. BTC)
- Contract calls

To make sync scheme future proof for more diverse use cases, we have to add support for some form of [paging](#paging).

### Callback URL

The UnsignedTransaction request supports passing a callback URL.

By default, the callback URL is set to `airgap-wallet://?d=`, but it can be overwritten by setting the callback URL in the unsigned transaction request.

Using the callback URL, the signer can redirect the user back to where his signed transaction can be handled. In AirGap, the signer will always redirect the signed transaction back to the wallet app, where the user can verify the data one last time before broadcasting. Another app might choose to redirect their users back to their app after signing, or directly to website.

### Paging

Paging is currently not supported by our sync scheme, but will have to be added soon.

A simple wrapper that splits up the playload into multiple chunks could look like this:

```rlp
[
  [1], // version
  [1], // current page
  [4], // number of pages
  ['1/4 of data'], // chunk data
]
```

The app would then have to collect all chunks, and pass them into the deserializer together, which will then strip away the metadata, merge the chunks and decode the underlying data.
