// tslint:disable: no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import { createBitcoinProtocol, createBitcoinSegwitProtocol, createBitcoinTaprootProtocol } from '../../src/v1'
import { createBitcoinLegacyProtocol } from '../../src/v1/protocol/BitcoinLegacyProtocol'
import { createBitcoinTestnetProtocol } from '../../src/v1/protocol/BitcoinTestnetProtocol'

import { captureVectors, GoldenTarget, GoldenVectors } from './golden-capture'
import { BitcoinProtocolSpec } from './specs/bitcoin'
import { BitcoinTestProtocolSpec } from './specs/bitcoin-test'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const VECTORS_PATH = join(__dirname, 'golden-vectors.json')

/**
 * Guards the `bitgo-utxo-lib` -> `bitcoinjs-lib` v6 migration.
 *
 * Provenance: this snapshot was first captured from the post-migration implementation, so on its
 * own it pins "no further change", not "identical to bitgo". The pre-migration bytes are pinned by
 * the fixtures in `specs/*.ts` (`txs[].signedTx`, `messages[].signature`), which predate the
 * migration and are unchanged by it — `protocol.spec.ts` compares against those.
 *
 * Regenerate deliberately, never casually:
 *
 *     GOLDEN_UPDATE=1 npm test --workspace @airgap/bitcoin
 *
 * A diff in the committed JSON after a refactor means derived keys, addresses or signatures
 * changed. That is a released-key or signing regression until proven otherwise — investigate
 * before accepting it.
 */
describe(`Golden vectors (UTXO byte-level snapshot)`, () => {
  let captured: GoldenVectors

  before(async () => {
    const mainnetSpec = new BitcoinProtocolSpec()
    const testnetSpec = new BitcoinTestProtocolSpec()

    // Every protocol that is backed by the vendored bitgo fork today, plus the segwit/taproot
    // protocols that already use bitcoinjs-lib v6 — those act as a control: they must not move
    // either, and they show the migration target already produces stable output.
    const targets: GoldenTarget[] = [
      {
        name: 'bitcoin',
        lib: createBitcoinProtocol(),
        derivative: () => mainnetSpec.derivative(),
        txs: mainnetSpec.txs,
        messages: mainnetSpec.messages
      },
      {
        name: 'bitcoin-legacy',
        lib: createBitcoinLegacyProtocol(),
        derivative: () => mainnetSpec.derivative(),
        txs: [],
        messages: mainnetSpec.messages
      },
      {
        name: 'bitcoin-segwit',
        lib: createBitcoinSegwitProtocol(),
        derivative: () => mainnetSpec.derivative(),
        txs: [],
        messages: mainnetSpec.messages
      },
      {
        name: 'bitcoin-taproot',
        lib: createBitcoinTaprootProtocol(),
        derivative: () => mainnetSpec.derivative(),
        txs: [],
        messages: mainnetSpec.messages
      },
      {
        name: 'bitcoin-testnet',
        lib: createBitcoinTestnetProtocol(),
        derivative: () => testnetSpec.derivative(),
        txs: testnetSpec.txs,
        messages: mainnetSpec.messages
      }
    ]

    captured = await captureVectors(targets)
  })

  it('should match the committed snapshot', async () => {
    if (process.env.GOLDEN_UPDATE === '1') {
      writeFileSync(VECTORS_PATH, `${JSON.stringify(captured, undefined, 2)}\n`)
      // eslint-disable-next-line no-console
      console.log(`golden vectors rewritten: ${VECTORS_PATH}`)

      return
    }

    expect(existsSync(VECTORS_PATH), `missing ${VECTORS_PATH} — run with GOLDEN_UPDATE=1 to create it`).to.be.true

    const committed: GoldenVectors = JSON.parse(readFileSync(VECTORS_PATH, 'utf-8'))

    // Compare per protocol so a failure names the protocol that moved rather than dumping
    // the whole snapshot.
    for (const name of Object.keys(committed)) {
      expect(captured[name], `protocol "${name}" is in the snapshot but was not captured`).to.not.be.undefined
      expect(captured[name], `golden vectors changed for "${name}"`).to.deep.equal(committed[name])
    }

    expect(Object.keys(captured).sort()).to.deep.equal(Object.keys(committed).sort())
  })
})
