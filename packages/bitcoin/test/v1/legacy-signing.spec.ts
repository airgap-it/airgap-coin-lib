// tslint:disable: no-floating-promises
import chai = require('chai')
import 'mocha'

import { buildAndSignLegacyTransaction, LegacySigner } from '../../src/v1/utils/legacy-signing'

const expect = chai.expect

/**
 * Output values arrive as strings inside an unsigned transaction that crosses the air gap, so they
 * are attacker-influenceable. An earlier revision of this module parsed them with `parseInt`, which
 * silently truncates at the first non-numeric character: `"100abc"` became `100` and `"1e3"` became
 * `1`. Both are valid satoshi amounts, so bitcoinjs-lib's `Satoshi` type check accepts them and the
 * transaction gets signed committing to an amount the user was never shown.
 *
 * These cases pin the rejection.
 */
describe('legacy signing — output value parsing', () => {
  // vendored copy — bitcoinjs-lib is no longer an npm dependency
  const bjs = require('@airgap/coinlib-core/dependencies/src/bitcoinjs-lib-6.1.7/src/index')
  const network = bjs.networks.bitcoin

  // A fixed, valid key; the tests here never get as far as signing.
  const signer: LegacySigner = {
    publicKey: Buffer.from('034c33b5df1162b52363beb6bdc84a051f04bda51ba1d1a1cd0e3f8ae0e0e2a1c1', 'hex'),
    sign: () => Buffer.alloc(64, 1)
  }

  const recipient = '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'
  const inputs = [{ txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b', vout: 0 }]

  function build(value: string): string {
    return buildAndSignLegacyTransaction(bjs, network, inputs, [{ recipient, value }], () => signer)
  }

  const rejected: [string, string][] = [
    ['trailing garbage', '100abc'],
    ['fractional', '100.5'],
    ['negative', '-5'],
    ['empty', ''],
    ['not a number', 'abc'],
    ['whitespace separated', '1 000'],
    ['above max safe integer', '9007199254740993']
  ]

  for (const [name, value] of rejected) {
    it(`rejects ${name}: ${JSON.stringify(value)}`, () => {
      // Assert on *our* guard, not on "something threw": bitcoinjs-lib's own Satoshi typeforce
      // would reject most of these too, which would let the guard be deleted without a red test.
      // (Matched by message: with an es5 target `instanceof` does not survive `extends Error`.)
      expect(() => build(value)).to.throw(/CONDITION_VIOLATION\): (Invalid output value|Output value is not safely representable)/)
    })
  }

  it('accepts a plain decimal amount', () => {
    expect(() => build('32391999')).to.not.throw()
  })

  it('accepts the maximum plausible supply in satoshis', () => {
    expect(() => build('2100000000000000')).to.not.throw()
  })

  // Forms that BigNumber accepts are accepted here too, and must resolve to the *same* number the
  // rest of the protocol computes with. The invariant is "signed amount == displayed amount", not
  // "only canonical decimal is allowed" — rejecting these would diverge from the display path.
  const equivalent: [string, string, string][] = [
    ['scientific notation', '1e3', '1000'],
    ['hex literal', '0x10', '16'],
    ['leading whitespace', '  100', '100']
  ]

  for (const [name, value, canonicalValue] of equivalent) {
    it(`parses ${name} the same way the display path does: ${JSON.stringify(value)}`, () => {
      expect(build(value)).to.equal(build(canonicalValue))
    })
  }

  it('does not silently truncate — "1e3" must not become 1', () => {
    // BigNumber reads "1e3" as 1000, which is what the rest of the protocol computes with, so this
    // must either produce 1000 or throw. It must never produce 1.
    let hex: string | undefined
    try {
      hex = build('1e3')
    } catch {
      return // rejecting is an acceptable outcome
    }

    const oneThousand = build('1000')
    expect(hex).to.equal(oneThousand)
  })
})

/**
 * Transaction ids also cross the air gap as strings. `Buffer.from(str, 'hex')` stops decoding at
 * the first non-hex character, so a 32-byte length check alone does not reject trailing garbage,
 * and a duplicate check keyed on the raw string can be bypassed with two spellings of one txid.
 */
describe('legacy signing — input validation', () => {
  const bjs = require('@airgap/coinlib-core/dependencies/src/bitcoinjs-lib-6.1.7/src/index')
  const network = bjs.networks.bitcoin

  const signer: LegacySigner = {
    publicKey: Buffer.from('034c33b5df1162b52363beb6bdc84a051f04bda51ba1d1a1cd0e3f8ae0e0e2a1c1', 'hex'),
    sign: () => Buffer.alloc(64, 1)
  }

  const recipient = '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'
  const txId = '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b'

  function build(inputs: { txId: string; vout: number }[]): string {
    return buildAndSignLegacyTransaction(bjs, network, inputs, [{ recipient, value: '1000' }], () => signer)
  }

  const rejectedTxIds: [string, any][] = [
    ['trailing non-hex garbage', `${txId}zz`],
    ['one trailing character', `${txId}a`],
    ['too short', txId.slice(0, 62)],
    ['too long', `${txId}00`],
    ['non-hex characters', `${'g'.repeat(64)}`],
    ['empty', ''],
    ['not a string', 42]
  ]

  for (const [name, value] of rejectedTxIds) {
    it(`rejects txId with ${name}`, () => {
      expect(() => build([{ txId: value, vout: 0 }])).to.throw(/CONDITION_VIOLATION\): Invalid transaction id/)
    })
  }

  it('accepts upper- and lower-case hex and treats them as the same outpoint', () => {
    expect(build([{ txId: txId.toUpperCase(), vout: 0 }])).to.equal(build([{ txId, vout: 0 }]))
    expect(() =>
      build([
        { txId, vout: 0 },
        { txId: txId.toUpperCase(), vout: 0 }
      ])
    ).to.throw(/CONDITION_VIOLATION\): Duplicate transaction input/)
  })

  it('rejects a duplicate outpoint', () => {
    expect(() =>
      build([
        { txId, vout: 1 },
        { txId, vout: 1 }
      ])
    ).to.throw(/CONDITION_VIOLATION\): Duplicate transaction input/)
  })

  it('accepts the same txid with different output indices', () => {
    expect(() =>
      build([
        { txId, vout: 0 },
        { txId, vout: 1 }
      ])
    ).to.not.throw()
  })

  it('rejects coinbase inputs', () => {
    expect(() => build([{ txId: '0'.repeat(64), vout: 0 }])).to.throw(/CONDITION_VIOLATION\): Coinbase/)
  })

  const rejectedVouts: [string, any][] = [
    ['negative', -1],
    ['fractional', 0.5],
    ['above uint32', 0x100000000],
    ['not a number', '0']
  ]

  for (const [name, vout] of rejectedVouts) {
    it(`rejects vout ${name}`, () => {
      expect(() => build([{ txId, vout }])).to.throw(/CONDITION_VIOLATION\): Invalid transaction output index/)
    })
  }
})
