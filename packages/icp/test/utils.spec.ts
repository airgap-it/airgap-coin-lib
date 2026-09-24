// tslint:disable: no-floating-promises
import chai = require('chai')
import { createHash } from 'crypto'
import 'mocha'

import { blsVerify } from '../src/v1/utils/bls'
import { calculateCrc32, crc32 } from '../src/v1/utils/convert'
import { sha224, sha256 } from '../src/v1/utils/sha2'

const expect = chai.expect

/** The sha2 adapter replaced `js-sha256`; every input form icp feeds it must hash like Node's crypto. */
describe('icp sha2 adapter', () => {
  const bytes: number[] = [0x0a, 0x61, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x2d, 0x69, 0x64]
  const reference = (algo: string): string => createHash(algo).update(Buffer.from(bytes)).digest('hex')

  it('sha224 over a number array (account identifier path)', () => {
    expect(Buffer.from(sha224.create().update(bytes).array()).toString('hex')).to.equal(reference('sha224'))
  })

  it('sha256 over an ArrayBuffer via arrayBuffer() (request-id path)', () => {
    const input: ArrayBuffer = Uint8Array.from(bytes).buffer
    expect(Buffer.from(sha256.create().update(input).arrayBuffer()).toString('hex')).to.equal(reference('sha256'))
  })

  it('sha256 over a Uint8Array via digest() (signing path)', () => {
    expect(Buffer.from(sha256.create().update(Uint8Array.from(bytes)).digest()).toString('hex')).to.equal(reference('sha256'))
  })

  it('chained updates equal a single update', () => {
    const chained = sha256.create().update(bytes.slice(0, 4)).update(bytes.slice(4)).array()
    expect(Buffer.from(chained).toString('hex')).to.equal(reference('sha256'))
  })
})

/** crc32 replaced the `crc-32` npm package; pinned to the IEEE check value and the previous byte layout. */
describe('icp crc32', () => {
  it('matches the standard CRC-32 check value for "123456789"', () => {
    expect(crc32(Buffer.from('123456789', 'ascii'))).to.equal(0xcbf43926)
  })

  it('empty input is 0', () => {
    expect(crc32(new Uint8Array())).to.equal(0)
  })

  it('calculateCrc32 keeps the big-endian 4-byte layout used in account identifiers', () => {
    expect(calculateCrc32(Buffer.from('123456789', 'ascii')).toString('hex')).to.equal('cbf43926')
  })
})

/** The inlined BLS WASM module is base64-decoded with Buffer now (was base64-arraybuffer); it must still instantiate and verify. */
describe('icp bls wasm', () => {
  // Vector from the Internet Computer agent test suite (BLS12-381 G2 public key, G1 signature over "hello").
  const publicKey = Buffer.from(
    'a7623a93cdb56c4d23d99c14216afaab3dfd6d4f9eb3db23d038280b6d5cb2caaee2a19dd92c9df7001dede23bf036bc0f33982dfb41e8fa9b8e96b5dc3e83d55ca4dd146c7eb2e8b6859cb5a5db815db86810b8d12cee1588b5dbf34a4dc9a5',
    'hex'
  )
  const signature = Buffer.from('b89e13a212c830586eaa9ad53946cd968718ebecc27eda849d9232673dcd4f440e8b5df39bf14a88048c15e16cbcaabe', 'hex')

  it('verifies a known-good signature', async () => {
    expect(await blsVerify(publicKey, signature, Buffer.from('hello'))).to.equal(true)
  })

  it('rejects the same signature over a different message', async () => {
    expect(await blsVerify(publicKey, signature, Buffer.from('hallo'))).to.equal(false)
  })
})
