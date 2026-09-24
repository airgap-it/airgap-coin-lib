// tslint:disable: no-floating-promises
import chai = require('chai')
import 'mocha'

import { assert, hexToU8a, isHex, u8aToU8a } from '@airgap/substrate/v1/utils/u8a'

const expect = chai.expect

/**
 * These helpers replaced `@polkadot/util`'s `assert` / `u8aToU8a`. The expected values below were
 * captured from @polkadot/util 2.0.1, so the sr25519 message-signing path keeps hashing exactly the
 * same bytes.
 */
describe('substrate u8a helpers (behaviour pinned to @polkadot/util 2.0.1)', () => {
  const cases: [string, string][] = [
    ['', ''],
    ['0x', ''],
    ['0x00ff', '00ff'],
    // odd-length hex is NOT hex to @polkadot/util: it is treated as a UTF-8 string
    ['0xabc', '3078616263'],
    ['hello', '68656c6c6f'],
    ['héllo €', '68c3a96c6c6f20e282ac'],
    ['0xZZ', '30785a5a']
  ]

  for (const [input, hex] of cases) {
    it(`u8aToU8a(${JSON.stringify(input)}) -> ${hex || '<empty>'}`, () => {
      expect(Buffer.from(u8aToU8a(input)).toString('hex')).to.equal(hex)
    })
  }

  it('passes Buffers and Uint8Arrays through as the same bytes', () => {
    const buffer = Buffer.from([1, 2, 3])
    const result = u8aToU8a(buffer)
    expect(Buffer.from(result).toString('hex')).to.equal('010203')
    expect(result).to.be.instanceOf(Uint8Array)
    expect(u8aToU8a(new Uint8Array([9]))[0]).to.equal(9)
  })

  it('copies number arrays and maps undefined/null to empty', () => {
    expect(Buffer.from(u8aToU8a([4, 5])).toString('hex')).to.equal('0405')
    expect(u8aToU8a(undefined).length).to.equal(0)
    expect(u8aToU8a(null).length).to.equal(0)
  })

  it('isHex / hexToU8a agree with the string rules', () => {
    expect(isHex('0x')).to.be.true
    expect(isHex('0x00ff')).to.be.true
    expect(isHex('0xabc')).to.be.false
    expect(isHex('00ff')).to.be.false
    expect(() => hexToU8a('nope')).to.throw(/Expected hex value/)
  })

  it('assert throws the given message', () => {
    expect(() => assert(false, 'boom')).to.throw('boom')
    expect(() => assert(true, 'boom')).to.not.throw()
  })
})
