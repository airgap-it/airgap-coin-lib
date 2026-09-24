/**
 * Legacy (P2PKH) transaction construction and signing on top of the bitcoinjs-lib v6 API.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT `Psbt`
 * -----------------------------------------
 * This replaces `TransactionBuilder` from the vendored `bitgo-utxo-lib` fork, which was removed
 * from bitcoinjs-lib in v6 in favour of `Psbt`. `Psbt` cannot be used here: signing a legacy P2PKH
 * input requires `nonWitnessUtxo`, i.e. the *full previous transaction*. Our unsigned transaction
 * format carries only `txId`, `vout`, `value`, `address` and `derivationPath`, and it crosses the
 * air gap as a QR code, so the previous transactions are simply not available to the signer.
 * (Segwit can use `witnessUtxo` instead because the segwit sighash commits to the input value;
 * the legacy sighash does not, which is exactly why `nonWitnessUtxo` is mandatory there.)
 *
 * So we do what `TransactionBuilder` did internally for P2PKH, explicitly:
 *
 *   1. build the transaction with empty input scripts,
 *   2. compute the legacy sighash per input over the input's P2PKH scriptPubKey,
 *   3. sign it, DER-encode the signature with the hash type appended,
 *   4. set the scriptSig to `<signature> <pubkey>`.
 *
 * Output is byte-identical to the previous `TransactionBuilder` implementation; the golden-vector
 * snapshots in `test/v1/golden-vectors.json` pin that and will fail loudly if it ever stops being
 * true.
 *
 * SAFETY NOTES FOR REVIEWERS
 * --------------------------
 * - Only SIGHASH_ALL is produced, matching the previous behaviour. Any other hash type would
 *   change what the signature commits to.
 * - `txId` is reversed into internal byte order, as the wire format requires.
 * - Signatures are *not* low-R ground. `TransactionBuilder` did not grind either, and grinding
 *   would change the bytes (and therefore the txid) without changing validity.
 * - The signer is only ever handed the sighash; no key material is logged or returned.
 */

import { Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { ECPairFactory } from '@airgap/coinlib-core/dependencies/src/ecpair-2.1.0/src/ecpair'
import * as ecc from '@airgap/coinlib-core/dependencies/src/@bitcoinerlab/secp256k1-1.2.0/src/index'

// Constructed once at module load: the factory runs a full elliptic-curve self-test (testEcc)
// on every construction, which is far too expensive to repeat per signing call.
const ecPair = ECPairFactory(ecc as any)

/**
 * Converts an output value to satoshis.
 *
 * Uses the same BigNumber parse as the surrounding code so the signed amount always equals the
 * displayed amount, and rejects anything that is not an exact, non-negative, safely representable
 * integer instead of silently coercing it.
 */
/** A transaction id is exactly 32 bytes, hex encoded, nothing else. */
const TX_ID_PATTERN: RegExp = /^[0-9a-fA-F]{64}$/

function toSatoshis(value: string): number {
  const parsed: BigNumber = new BigNumber(value)

  if (!parsed.isFinite() || !parsed.isInteger() || parsed.isNegative()) {
    throw new ConditionViolationError(Domain.BITCOIN, `Invalid output value: ${JSON.stringify(value)}`)
  }

  const satoshis: number = parsed.toNumber()
  if (!Number.isSafeInteger(satoshis)) {
    throw new ConditionViolationError(Domain.BITCOIN, `Output value is not safely representable: ${JSON.stringify(value)}`)
  }

  return satoshis
}

export interface LegacyInput {
  /** Transaction id of the output being spent, in display (big-endian) order. */
  txId: string
  vout: number
}

export interface LegacyOutput {
  recipient: string
  /** Value in the smallest unit, as a decimal string. */
  value: string
}

/** Minimal signer surface — satisfied by a bip32 node. */
export interface LegacySigner {
  publicKey: Uint8Array
  sign(hash: Buffer): Uint8Array
}

/** Wraps a raw 32-byte secret key in the minimal signer shape used for legacy signing. */
export function ecPairSigner(secretKey: Buffer, network: any): LegacySigner {
  const keyPair = ecPair.fromPrivateKey(secretKey, { network })

  return { publicKey: keyPair.publicKey, sign: (hash: Buffer) => keyPair.sign(hash) }
}

/**
 * The subset of the bitcoinjs-lib v6 API this module needs. Both `bitcoinjs-lib` and
 * `groestlcoinjs-lib` satisfy it; the latter transparently swaps in the groestl hash, which is the
 * whole reason Groestlcoin needs a different library rather than a different parameter.
 */
export interface BitcoinJSLib {
  Transaction: any
  payments: any
  address: any
  script: any
}

/**
 * Builds and signs a legacy P2PKH transaction.
 *
 * `signerForInput` is called once per input, in order, and must return the key that owns that
 * input — the caller is responsible for the derivation.
 */
export function buildAndSignLegacyTransaction(
  lib: BitcoinJSLib,
  network: any,
  inputs: LegacyInput[],
  outputs: LegacyOutput[],
  signerForInput: (index: number) => LegacySigner
): string {
  if (inputs.length === 0) {
    throw new ConditionViolationError(Domain.BITCOIN, 'Transaction has no inputs.')
  }
  if (outputs.length === 0) {
    throw new ConditionViolationError(Domain.BITCOIN, 'Transaction has no outputs.')
  }

  const transaction = new lib.Transaction()
  // TransactionBuilder defaulted to version 1; preserved so the serialisation is unchanged.
  transaction.version = 1

  const seenOutpoints: Set<string> = new Set()
  for (const input of inputs) {
    // Validate the full string before decoding: `Buffer.from(str, 'hex')` silently stops at the
    // first non-hex character, so `<64 hex chars> + 'zz'` would decode to a valid-looking 32 bytes
    // and the signer would commit to a different outpoint than the one the UI displayed.
    if (typeof input.txId !== 'string' || !TX_ID_PATTERN.test(input.txId)) {
      throw new ConditionViolationError(Domain.BITCOIN, `Invalid transaction id: ${JSON.stringify(input.txId)}`)
    }
    if (!Number.isSafeInteger(input.vout) || input.vout < 0 || input.vout > 0xffffffff) {
      throw new ConditionViolationError(Domain.BITCOIN, `Invalid transaction output index: ${JSON.stringify(input.vout)}`)
    }

    // Transaction ids are displayed big-endian but serialised little-endian.
    const hash: Buffer = Buffer.from(input.txId, 'hex').reverse()
    if (hash.every((byte: number) => byte === 0)) {
      throw new ConditionViolationError(Domain.BITCOIN, 'Coinbase inputs are not supported.')
    }
    // Key on the decoded bytes, not the caller's string, so two spellings of one txid cannot
    // slip past the duplicate check.
    const outpoint: string = `${hash.toString('hex')}:${input.vout}`
    if (seenOutpoints.has(outpoint)) {
      throw new ConditionViolationError(Domain.BITCOIN, `Duplicate transaction input: ${input.txId.toLowerCase()}:${input.vout}`)
    }
    seenOutpoints.add(outpoint)

    transaction.addInput(hash, input.vout)
  }

  for (const output of outputs) {
    transaction.addOutput(lib.address.toOutputScript(output.recipient, network), toSatoshis(output.value))
  }

  for (let index = 0; index < inputs.length; index++) {
    const signer: LegacySigner = signerForInput(index)
    const publicKey: Buffer = Buffer.from(signer.publicKey)

    // For P2PKH the script the sighash is computed over is the input's own scriptPubKey.
    const prevOutScript: Buffer = lib.payments.p2pkh({ pubkey: publicKey, network }).output
    const sighash: Buffer = transaction.hashForSignature(index, prevOutScript, lib.Transaction.SIGHASH_ALL)

    const signature: Buffer = Buffer.from(signer.sign(sighash))
    const encodedSignature: Buffer = lib.script.signature.encode(signature, lib.Transaction.SIGHASH_ALL)

    transaction.setInputScript(index, lib.script.compile([encodedSignature, publicKey]))
  }

  return transaction.toHex()
}
