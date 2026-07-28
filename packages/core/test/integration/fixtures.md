# Integration tests

Integration tests verify that each coin protocol can fetch a balance and prepare an unsigned transaction end-to-end. They reuse the shared runner in `runner.ts` and per-coin specs under `packages/<coin>/test/integration/`.

Transactions are prepared but **never signed or broadcast**.

## Commands

| Command | Mode | Network |
|---------|------|---------|
| `npm run test:integration` | Mocked (default) | None — sinon stubs |
| `npm run test:integration:live` | Live (`INTEGRATION_LIVE=1`) | Mainnet RPC / indexers |

Run from the repository root. Both commands currently cover Bitcoin, Ethereum, Polkadot, and Acurast.

## Scenarios

Each coin runs two tests via `registerIntegrationSuite()`:

1. **Display balance** — `getBalanceOfPublicKey` returns a valid balance object.
2. **Prepare transaction** — `prepareTransactionWithPublicKey` returns a valid unsigned transaction.

In live mode, prepare is run twice and the output is checked for same-run stability (e.g. nonce for ETH, encoded payload for Substrate chains).

## Modes

| Mode | Assertions |
|------|------------|
| Mocked | Exact balance values; deep-equal against golden `unsignedTx` fixtures |
| Live | Balance shape + `min: 0` threshold; prepared-tx structure + same-run stability |

## Wallet fixtures

Live tests reuse the unit-test wallets defined in each coin's `test/v1/specs/` file.

| Coin | Fixture source | Live balance assertion | Live prepare amount |
|------|----------------|------------------------|---------------------|
| BTC | `packages/bitcoin/test/v1/specs/bitcoin.ts` (xpub wallet) | `min: 0` | `0` (skipped when balance is 0) |
| ETH | `packages/ethereum/test/v1/specs/ethereum.ts` (xpub wallet) | `min: 0` | `0` (skipped when balance is 0) |
| Polkadot | `packages/polkadot/test/v1/specs/polkadot.ts` | `min: 0` | `0` (skipped when balance is 0) |
| Acurast | `packages/acurast/test/v1/specs/acurast.ts` | `min: 0` | `0` (skipped when balance is 0) |

Mocked mode uses the full fixture amounts and fees from each spec's `txs[0]` entry.

## Live prepare requirements

Live prepare checks are skipped when the fixture wallet has zero transferable balance. To enable them, fund the monitoring wallet for each coin:

- **BTC** — confirmed UTXOs on the xpub-derived addresses (amount `0` is used; fees still require spendable inputs).
- **ETH / Polkadot / Acurast** — enough transferable balance to cover network fees (amount `0` is used).

Once wallets are funded, live balance assertions can be tightened from `min: 0` to exact or near-exact values in the coin's `test/integration/balance-prepare.integration.spec.ts`.

## Adding a new coin

1. Create `packages/<coin>/test/integration/balance-prepare.integration.spec.ts`.
2. Define an `IntegrationProtocolContext` with wallet keys, balance expectations, and prepare fixture from the coin's unit-test spec.
   Use whichever key actually derives `wallet.addresses[0]` — for BTC and ETH that is `extendedPublicKey`, not `publicKey`. Picking the
   wrong one silently points the live checks at a different wallet.
3. Call `registerIntegrationSuite(context, () => protocol.stub.registerStub(protocol))`.
4. Add `test:integration` and `test:integration:live` scripts to the coin's `package.json` (see an existing coin for the mocha invocation).
5. Add the package scope to `test:integration` and `test:integration:live` in the root `package.json`.

Shared types and helpers live in `packages/core/test/integration/` (`types.ts`, `runner.ts`, `assertions.ts`, `env.ts`).
