### 0.6.0 (2019-10-23)

### Features

- **all**: multi transaction support

### 0.5.14 (2019-10-25)

### Features

- **xtz**: fixed reward calculation for 005 cycles

### 0.5.13 (2019-10-23)

### Features

- **xtz**: added check of tz account balance before migration of kt account

### 0.5.12 (2019-10-18)

### Features

- **xtz**: added rewards and payouts calculations
- **xtz**: added support for multiple tezos operations in one transaction

### 0.5.7 (2019-10-18)

### Features

- **xtz**: now using a different tezos node for rpc calls

### 0.5.6 (2019-10-16)

### Features

- **xtz**: replace all calls to tzscan.io with calls to the conseil api

### 0.5.5 (2019-10-11)

### Features

- **xtz**: prepare for babylon network upgrade

### 0.5.4 (2019-09-19)

### Bug Fixes

- **actions**: catch errors and propagate them
- **xtz**: handle invalid responses

### 0.5.3 (2019-09-18)

### Features

- **xtz**: use tezblock.io as the tezos block explorer
- **eth**: replace trustwallet api with etherscan.io

### 0.5.2 (2019-09-17)

### Internals

- **xtz**: forge implementation refactoring

### Features

- **actions**: add repeatable actions

### 0.5.1 (2019-08-28)

### Bug Fixes

- **xtz**: allow `getBakerInfo` for tz2 and tz3 addresses

## 0.5.0 (2019-08-07)

### Internals

- **structure:** move code from `lib` to `src` folder
- **typescript:** upgrade typescript from `2.4` to `3.5.3`
- **typescript:** enable some `strict` settings
- **tslint:** stricter TSLint rules
- **prices:** add fallback to `coingecko` if price is not found on `cryptocompare`
- **dependencies:** forked all github dependencies to `airgap-it` organisation

### Breaking Changes

- **aeternity:** renamed `AEProtocol` class to `AeternityProtocol`

### Features

- **actions:** added actions [docs](https://airgap-it.github.io/airgap-coin-lib/#/action/action)
- **examples:** added some simple examples how to use the coinlib [examples](https://github.com/airgap-it/airgap-coin-lib/tree/master/examples)

### Bug Fixes

- **xtz:** use `tezrpc.me` node instead of tzscan.io because an endpoint has been disabled

### 0.4.4 (2019-05-31)

### Bug Fixes

- **xtz:** adjust gas limit to be compatible with athens upgrade

### 0.4.3 (2019-05-23)

### Features

- **grs:** add groestlcoin support

### 0.4.2 (2019-05-06)

### Features

- **xtz:** remove tezos beta tag
- **eth:** return tx hash when getting tx details
- **ae:** add support for transaction payload

### 0.3.13 (2019-05-04)

### 0.4.1 (2019-05-03)

### 0.3.11 (2019-05-03)

### 0.3.10 (2019-04-29)

### 0.3.9 (2019-04-29)

## 0.4.0 (2019-04-26)

### 0.3.8 (2019-04-15)

### 0.3.7 (2019-04-02)

### 0.3.6 (2019-03-21)

### 0.3.5 (2019-03-20)

### 0.3.4 (2019-03-19)

### 0.3.3 (2019-03-19)

### 0.3.2 (2019-03-18)

### 0.3.1 (2019-03-13)

## 0.3.0 (2019-02-20)

## 0.2.0 (2019-01-19)

### 0.1.10 (2019-01-09)

### 0.1.9 (2018-12-18)

### 0.1.8 (2018-12-17)

### 0.1.7 (2018-12-13)

### 0.1.6 (2018-12-12)

### 0.1.5 (2018-12-12)

### 0.1.4 (2018-11-26)

### 0.1.3 (2018-11-26)

### 0.1.2 (2018-11-16)

### 0.1.1 (2018-11-16)

## 0.1.0 (2018-11-16)
