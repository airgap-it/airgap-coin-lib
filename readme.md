# AirGap Coin Library

[![npm](https://img.shields.io/npm/v/airgap-coin-lib.svg?colorB=brightgreen)](https://www.npmjs.com/package/airgap-coin-lib)
[![documentation](https://img.shields.io/badge/documentation-online-brightgreen.svg)](https://airgap-it.github.io/airgap-coin-lib/)
[![build](https://img.shields.io/travis/airgap-it/airgap-coin-lib.svg)](https://travis-ci.org/airgap-it/airgap-coin-lib/)
[![codecov](https://img.shields.io/codecov/c/gh/airgap-it/airgap-coin-lib.svg)](https://codecov.io/gh/airgap-it/airgap-coin-lib/)

The `airgap-coin-lib` is a protocol-agnostic library that allows easy handling of the most important tasks relating cryptocurrencies and blockchains.

It implements operations such as preparing, signing and broadcasting transactions for a range of protocols.

The library consists of a shared interface for all implements protocols. This is especially useful in the context of AirGap because we some methods are targeted towards offline usage. The following operations are specified:

- `prepareTransaction` - This is done on AirGap Wallet (online) side. Either a public key or extended public key is used and will fetch the required information from the network.
- `signTransaction` - This is done in AirGap Vault (offline) side. The output of "prepareTransaction" is the input for this method (hence the output of "prepareTransaction" is transferred via URL scheme (same-device) or QR code (2-device-setup)).
- `broadcastTransaction` - This is done in AirGap Wallet (online) side. The output of "signTransaction" is the input for this method (hence the output of "signTransaction" is transferred via URL scheme (same-device) or QR code (2-device-setup)).

## Supported Protocols

The modular design used in this library allows you to simply add new protocols with special logic. Adding a new Bitcoin-like protocol basically means:

1. select the correct network parameters (see `src/networks.ts`)
2. set the Insight API URL to communicate with the blockchain

Adding a new Ethereum-like protocol means:

1. set the correct chain id
2. set the JSON RPC URL

Currently supported are:

- Bitcoin
- Ethereum
  - Generic ERC20 Tokens
- Aeternity
- Tezos
- Groestlcoin
- Cosmos
- Polkadot
- Kusama

## Features

### Protocols

The way the interface was designed is to allow stateless calls. This means the class itself stores very little state itself.
All required input comes from the method params (public key, extended public key, etc...)

Currently we support for Bitcoin-like (UTXO) protocols:

- Single Address Wallets (deprecated)
- HD Wallets

Currently we support for Ethereum-like (Account-based) protocols:

- Single Address Wallets

### Delegation

There is a different interface that can be implemented if the protocol supports delegation. The delegation flow usually requires some changes in the user interface of the AirGap Wallet as well.

### Inter App Communication

A serializer is included that encodes JSON structures with RLP and base58check. Those strings can then be sent to the other app, either through QR codes or a URL. The serializer can only serialize messages in predefined formats, so new message types have to be added when new protocols are added.

## Synchronising information between wallet and vault

Such that the system works we need to be able to synchronise wallets. A wallet can be:

- Single Address Wallet
- HD Wallet

For the single address wallet we only need to share the public key. For HD Wallet we need to share the extended public key.

## Getting started

### Requirements

```
npm >= 6
NodeJS >= 12
```

Build dependencies get installed using `npm install`.

### Clone and Run

```
$ git clone https://github.com/airgap-it/airgap-coin-lib.git
$ cd airgap-coin-lib
$ npm install
```

To run the tests, you will have to install the test dependencies

```
$ npm run install-test-dependencies
$ npm test
```

To remove the test dependencies and clean up the `package.json` and `package-lock.json`, execute this command

```
$ npm run install-build-dependencies
```

### Contributing

We welcome contributions from the community. Simple readme updates or bugfixes can be addressed with a PR directly.

For larger changes like new protocols, new features or larger refactorings, please contact us first by opening an issue. This project is under constant development and until version `1.x.x` has been reached, there will be frequent breaking changes. So make sure to take a look at the `develop` branch.

Regarding new protocols / currencies, we cannot guarantee that they will be merged, but we're more than happy to discuss the details of a specific integration in a github issue.