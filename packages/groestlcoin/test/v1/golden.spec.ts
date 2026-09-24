// tslint:disable: no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Duplicated from the bitcoin package's test tree (test dirs cannot be imported across packages).
// Both copies must stay identical or the two snapshots stop being comparable.
import { captureVectors, GoldenTarget, GoldenVectors } from './golden-capture'

import { createGroestlcoinProtocol } from '../../src/v1'
import { GroestlcoinProtocolSpec } from './specs/groestlcoin'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const VECTORS_PATH = join(__dirname, 'golden-vectors.json')

/**
 * Guards the `bitgo-utxo-lib` -> `groestlcoinjs-lib` v6 migration (Stage 3).
 *
 * Groestlcoin is the reason the vendored bitgo fork exists at all — it swaps double-SHA256 for
 * the groestl hash in address checksums and txids. That makes it the most likely place for a
 * migration to produce plausible-looking but wrong output, so its bytes are pinned separately.
 *
 * Regenerate deliberately:
 *
 *     GOLDEN_UPDATE=1 npm test --workspace @airgap/groestlcoin
 */
describe(`Golden vectors (Groestlcoin byte-level snapshot)`, () => {
  let captured: GoldenVectors

  before(async () => {
    const spec = new GroestlcoinProtocolSpec()

    const targets: GoldenTarget[] = [
      { name: 'groestlcoin', lib: createGroestlcoinProtocol(), derivative: () => spec.derivative(), txs: spec.txs, messages: spec.messages }
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

    for (const name of Object.keys(committed)) {
      expect(captured[name], `protocol "${name}" is in the snapshot but was not captured`).to.not.be.undefined
      expect(captured[name], `golden vectors changed for "${name}"`).to.deep.equal(committed[name])
    }

    expect(Object.keys(captured).sort()).to.deep.equal(Object.keys(committed).sort())
  })
})
