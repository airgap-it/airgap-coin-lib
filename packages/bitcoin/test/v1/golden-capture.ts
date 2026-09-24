/**
 * NOTE: this file exists twice, at `packages/bitcoin/test/v1/golden-capture.ts` and
 * `packages/groestlcoin/test/v1/golden-capture.ts`, and the two copies must stay byte-identical.
 * The two snapshots are only comparable if both are produced by identical logic, so any
 * change here must be mirrored there. Test trees are per-package and cannot import across
 * package boundaries, which is why this is a copy rather than a shared module.
 */

/**
 * Golden-vector capture for the UTXO protocols.
 *
 * These protocols are backed by the vendored `bitgo-utxo-lib`, which is being replaced by
 * `bitcoinjs-lib` v6. The dangerous failure mode for that migration
 * is not a crash but a silent change in derived key material or, worse, in a signature — a
 * transaction that still builds and still broadcasts, but commits to different bytes.
 *
 * The existing specs assert behaviour per protocol. This captures the *bytes* of every offline
 * operation into a single canonical snapshot, so the migration can be judged by exact equality
 * rather than by "the tests still pass".
 *
 * Capture is deliberately offline-only: derivation, address generation, signing and message
 * signing. Nothing here touches the network, so the output is fully deterministic.
 */

import { AirGapProtocol, ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey } from '@airgap/module-kit'

/** Derivation indices captured for every protocol. Covers receive/change and a non-zero index. */
const ADDRESS_INDICES: [number, number][] = [
  [0, 0],
  [0, 1],
  [0, 5],
  [1, 0],
  [1, 3]
]

export interface GoldenVectors {
  [protocolName: string]: {
    identifier: string
    keyPair: { secretKey: string; publicKey: string }
    extendedKeyPair: { secretKey: string; publicKey: string }
    addressFromPublicKey: string
    derivedAddresses: { path: string; publicKey: string; address: string }[]
    signedTransactions: { index: number; signed: string }[]
    signedMessages: { message: string; signature: string }[]
  }
}

/** Stable stringify so key ordering can never cause a spurious diff. */
function canonical(value: any): string {
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return Object.keys(val)
        .sort()
        .reduce((acc: any, k) => {
          acc[k] = val[k]
          return acc
        }, {})
    }

    return val
  })
}

/**
 * A protocol plus the fixtures needed to exercise it. Kept structural rather than typed against
 * TestProtocolSpec so that groestlcoin can reuse this with its own spec shape.
 */
export interface GoldenTarget {
  name: string
  lib: any
  derivative(): Promise<any>
  txs: { unsignedTx: any }[]
  messages?: { message: string }[]
}

export async function captureVectors(targets: GoldenTarget[]): Promise<GoldenVectors> {
  const vectors: GoldenVectors = {}

  for (const target of targets) {
    const protocol: AirGapProtocol = target.lib
    const derivative = await target.derivative()

    const metadata: any = await protocol.getMetadata()
    const keyPair: { secretKey: SecretKey; publicKey: PublicKey } = await (protocol as any).getKeyPairFromDerivative(derivative)
    const extendedKeyPair: { secretKey: ExtendedSecretKey; publicKey: ExtendedPublicKey } = await (
      protocol as any
    ).getExtendedKeyPairFromDerivative(derivative)

    const derivedAddresses: { path: string; publicKey: string; address: string }[] = []
    for (const [visibility, index] of ADDRESS_INDICES) {
      const derivedPublicKey = await (protocol as any).deriveFromExtendedPublicKey(extendedKeyPair.publicKey, visibility, index)
      const address = await (protocol as any).getAddressFromPublicKey(derivedPublicKey)

      derivedAddresses.push({
        path: `${visibility}/${index}`,
        publicKey: derivedPublicKey.value,
        address: typeof address === 'string' ? address : address.address
      })
    }

    const signedTransactions: { index: number; signed: string }[] = []
    for (let i = 0; i < target.txs.length; i++) {
      const signed = await (protocol as any).signTransactionWithSecretKey(target.txs[i].unsignedTx, extendedKeyPair.secretKey)
      // Capture the whole signed structure, not just a hex field: different protocols surface the
      // serialised transaction under different keys, and a change anywhere in it matters.
      signedTransactions.push({ index: i, signed: canonical(signed) })
    }

    const signedMessages: { message: string; signature: string }[] = []
    for (const { message } of target.messages ?? []) {
      const signature = await (protocol as any).signMessageWithKeyPair(message, keyPair)
      signedMessages.push({ message, signature: signature.value })
    }

    const address = await (protocol as any).getAddressFromPublicKey(keyPair.publicKey)

    vectors[target.name] = {
      identifier: metadata.identifier,
      keyPair: { secretKey: keyPair.secretKey.value, publicKey: keyPair.publicKey.value },
      extendedKeyPair: { secretKey: extendedKeyPair.secretKey.value, publicKey: extendedKeyPair.publicKey.value },
      addressFromPublicKey: typeof address === 'string' ? address : address.address,
      derivedAddresses,
      signedTransactions,
      signedMessages
    }
  }

  return vectors
}
