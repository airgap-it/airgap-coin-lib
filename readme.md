# AirGap Coin Library

[![npm](https://img.shields.io/npm/v/airgap-coin-lib.svg?colorB=brightgreen)](https://www.npmjs.com/package/airgap-coin-lib)
[![documentation](https://img.shields.io/badge/documentation-online-brightgreen.svg)](https://airgap-it.github.io/airgap-coin-lib/)
[![build](https://img.shields.io/travis/airgap-it/airgap-coin-lib.svg)](https://travis-ci.org/airgap-it/airgap-coin-lib/)
[![codecov](https://img.shields.io/codecov/c/gh/airgap-it/airgap-coin-lib.svg)](https://codecov.io/gh/airgap-it/airgap-coin-lib/)

The `airgap-coin-lib` is a protocol-agnostic library that allows easy handling of the most important tasks relating cryptocurrencies and blockchains.

It implements operations such as preparing, signing and broadcasting transactions for a range of protocols.

The library consists of a shared interface for all implements protocols. This is especially useful in the context of AirGap. The following operations are specified:

- prepareTransaction - This is done on the wallet (online) side. Either a public key or extended public key is used and will fetch the required information from the network
- signTransaction - This is done on the vault (offline) side. The output of "prepareTransaction" is the input for this method (hence the output of "prepareTransaction" is transferred via URL scheme (same-device) or QR code (2-device-setup)).
- broadcastTransaction - This is done on the wallet (online) side. The output of "signTransaction" is the input for this method (hence the output of "signTransaction" is transferred via URL scheme (same-device) or QR code (2-device-setup)).

## Supported Protocols

The modular design used in this library allows you to simply add new protocols with special logic. Adding a new Bitcoin-like protocol basically means:

1. select the correct network parameters (see `lib/networks.ts`)
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

## Features

The way the interface was designed is to allow stateless calls. This means the class itself stores very little state itself.
All required input comes from the method params (public key, extended public key, etc...)

Currently we support for Bitcoin-like protocols:

- Single Address Wallets
- HD Wallets

Currently we support for Ethereum-like protocols:

- Single Address Wallets (HD-Wallets make no sense for account-based protocols)

## Synchronising information between wallet and vault

Such that the system works we need to be able to synchronise wallets. A wallet can be:

- Single Address Wallet
- HD Wallet

For the single address wallet we only need to share the public key. For HD Wallet we need to share the extended public key.

## Getting started

### Requirements

```
npm >= 5
NodeJS >= 8
```

Everything else gets installed automatically using `npm install`.

### Clone and Run

```
$ git clone https://github.com/airgap-it/airgap-coin-lib.git
$ cd airgap-coin-lib
$ npm install
$ npm test
```
