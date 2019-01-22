# Serializer

The `airgap-coin-lib` also feature a protocol-agnostic scheme that allows to encode and decode requests for signing, sharing public data of accounts and more using base58 encoded strings.

## Getting Started

Import the desired protocol, `SyncProtocolUtils` and `EncodedType` from `airgap-coin-lib`. Now you are able touse the `SyncProtocolUtils` to serialize and deserialize different payloads. Currently supported are:

- Requests to sign a TX
- Requests to broadcast a signed TX
- Syncing the public data of an account (public key + derivation path + protocol-identifier)
