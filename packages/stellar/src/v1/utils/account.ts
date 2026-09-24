import axios from '@airgap/coinlib-core/dependencies/src/axios-0.33.0/index'
import { Account } from '@stellar/stellar-base'

import { StellarAccountResponse, StellarBalanceLine, StellarSigner, StellarThresholds } from '../types/protocol'

/**
 * An account loaded from Horizon.
 *
 * Stands in for `AccountResponse` from `@stellar/stellar-sdk`. That package is not used here
 * because it pulls in its own HTTP stack (`axios`, `feaxios`, `eventsource`, `urijs`), which would
 * put a second, unvendored HTTP client in the dependency graph. `@stellar/stellar-base` provides
 * everything else this protocol needs and has no network dependencies.
 *
 * Like `AccountResponse`, this extends `Account`, so it can be handed straight to
 * `new TransactionBuilder(account, ...)` — the builder only calls `accountId()`,
 * `sequenceNumber()` and `incrementSequenceNumber()`.
 */
export class StellarAccount extends Account {
  public readonly balances: StellarBalanceLine[]
  public readonly signers: StellarSigner[]
  public readonly thresholds: StellarThresholds

  public constructor(response: StellarAccountResponse) {
    super(response.account_id, response.sequence)

    this.balances = response.balances
    this.signers = response.signers
    this.thresholds = response.thresholds
  }
}

/**
 * Fetches an account from Horizon.
 *
 * Mirrors the behaviour of `Horizon.Server#loadAccount`, including how it fails: a missing account
 * makes Horizon answer `404`, which surfaces as a rejected promise carrying `response.status`.
 * Callers rely on that to detect unfunded destinations.
 */
export async function loadAccount(rpcUrl: string, address: string): Promise<StellarAccount> {
  // `Horizon.Server` URI-escaped the account segment and normalised the base URL; keep both now
  // that the request is a plain axios call. Without the escaping, a crafted "address" could
  // redirect the request to a different Horizon endpoint (e.g. `G.../../fee_stats`).
  const baseUrl: string = rpcUrl.replace(/\/+$/, '')
  const { data } = await axios.get<StellarAccountResponse>(`${baseUrl}/accounts/${encodeURIComponent(address)}`)

  return new StellarAccount(data)
}
