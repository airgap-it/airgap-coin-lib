import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as sinon from 'sinon'

import { assertBalanceValue, assertPreparedTx } from './assertions'
import { isIntegrationLive } from './env'
import { IntegrationCheckResult, IntegrationProtocolContext } from './types'

/**
 * Display balance check: fetches the balance via the protocol's public API and
 * asserts shape + value (exact in mocked mode, min-threshold in live mode).
 * Throws on failure so callers get the original assertion error and stack trace.
 */
export async function checkBalance(context: IntegrationProtocolContext): Promise<void> {
  const live = isIntegrationLive()

  const balance = await context.lib.getBalanceOfPublicKey(context.publicKey)
  assertBalanceValue(balance, context.balance, live)

  if (context.checkAddressesBalance && context.lib.getBalanceOfAddresses !== undefined && context.addresses.length > 0) {
    const addressBalance = await context.lib.getBalanceOfAddresses(context.addresses)
    assertBalanceValue(addressBalance, context.balance, live)
  }
}

/**
 * Prepare transaction check: prepares (but never signs or broadcasts) a
 * transaction and asserts its structure. In live mode it additionally prepares
 * a second time and verifies the output is stable within the same run.
 */
export async function checkPrepareTransaction(context: IntegrationProtocolContext): Promise<void> {
  const live = isIntegrationLive()
  const configuration = live ? undefined : { fee: context.prepare.fee }

  const preparedTx = await context.lib.prepareTransactionWithPublicKey(
    context.publicKey,
    [{ to: context.prepare.to, amount: context.prepare.amount }],
    configuration
  )

  assertPreparedTx(preparedTx, context.coin, context.prepare, live)

  if (live) {
    const secondPreparedTx = await context.lib.prepareTransactionWithPublicKey(
      context.publicKey,
      [{ to: context.prepare.to, amount: context.prepare.amount }],
      configuration
    )
    expectPreparedTxStable(preparedTx, secondPreparedTx, context.coin)
  }
}

/**
 * Live prepare checks need a funded monitoring wallet (transferable balance > 0).
 * Empty wallets can still pass the balance shape check but cannot cover fees.
 */
export async function getLivePrepareSkipReason(context: IntegrationProtocolContext): Promise<string | undefined> {
  const balance = await context.lib.getBalanceOfPublicKey(context.publicKey)
  const transferable = new BigNumber(balance.transferable?.value ?? balance.total.value)

  if (transferable.lte(0)) {
    return 'monitoring wallet has no transferable balance; fund the wallet to enable live prepare checks'
  }

  return undefined
}

// Result-wrapping variants for non-test callers (e.g. monitoring wrappers).

export async function runBalanceCheck(context: IntegrationProtocolContext): Promise<IntegrationCheckResult> {
  try {
    await checkBalance(context)

    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function runPrepareCheck(context: IntegrationProtocolContext): Promise<IntegrationCheckResult> {
  try {
    await checkPrepareTransaction(context)

    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

function expectPreparedTxStable(first: unknown, second: unknown, coin: IntegrationProtocolContext['coin']): void {
  if (coin === 'eth') {
    const a = first as { nonce?: string }
    const b = second as { nonce?: string }
    if (a.nonce !== undefined && b.nonce !== undefined && a.nonce !== b.nonce) {
      throw new Error('Live prepare check: nonce changed between consecutive prepares')
    }
  }

  if (coin === 'polkadot' || coin === 'acurast') {
    const a = first as { encoded?: string }
    const b = second as { encoded?: string }
    if (a.encoded !== b.encoded) {
      throw new Error('Live prepare check: encoded payload changed between consecutive prepares')
    }
  }
}

/**
 * Registers the standard two-scenario integration suite (display balance +
 * prepare transaction) for a coin. In mocked mode (default) the provided stub
 * is installed before each test; in live mode (INTEGRATION_LIVE=1) tests hit
 * the real network and no stubs are used.
 */
export function registerIntegrationSuite(context: IntegrationProtocolContext, registerStub?: () => Promise<void>): void {
  const live = isIntegrationLive()

  const setupHooks = () => {
    beforeEach(async () => {
      if (!live && registerStub !== undefined) {
        await registerStub()
      }
    })

    afterEach(() => {
      if (!live) {
        sinon.restore()
      }
    })
  }

  describe(`Integration: ${context.name}${live ? ' (live)' : ''}`, () => {
    describe('Display balance', () => {
      setupHooks()

      it('getBalanceOfPublicKey returns expected balance', async () => {
        await checkBalance(context)
      })
    })

    describe('Prepare transaction', () => {
      setupHooks()

      it('prepareTransactionWithPublicKey returns unsigned transaction', async function () {
        if (live) {
          const skipReason = await getLivePrepareSkipReason(context)
          if (skipReason !== undefined) {
            this.skip()
          }
        }

        await checkPrepareTransaction(context)
      })
    })
  })
}
