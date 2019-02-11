import 'mocha'

import { expect } from 'chai'
import bs64check from '../../../lib/utils/base64Check'
import * as rlp from 'rlp'

describe('Base64Check', () => {
  it('should properly encode and decode an input string', () => {
    const testString = 'test-string-to-encode-properly'
    const hashed = bs64check.encode(testString)
    expect(bs64check.decode(hashed)).to.deep.equal(Buffer.from(testString))
  })

  it('should properly encode and decode an input buffer', () => {
    const testString = Buffer.from('test-string-to-encode-properly')
    const hashed = bs64check.encode(testString)
    expect(bs64check.decode(hashed)).to.deep.equal(testString)
  })

  it('should properly checksum an input string', () => {
    const testString = 'test-string-to-encode-properly'
    const hashed = bs64check.encode(testString)

    const checkSum = Buffer.from(hashed, 'base64').slice(-4)
    const newCheckSum = bs64check.checkSum(testString)

    expect(checkSum).to.deep.equal(newCheckSum)
  })

  it('should properly encode and decode RLP encoded data', () => {
    const txObj = {
      test1: 'test1',
      test2: 'test2'
    }

    const txArray = Object.keys(txObj).map(a => txObj[a])

    const rlpEncoded = rlp.encode(txArray)
    const hashed = bs64check.encode(rlpEncoded)
    const decoded = bs64check.decode(hashed)
    const rlpDecoded = rlp.decode(decoded)

    expect(rlpDecoded).to.deep.equal([Buffer.from('test1'), Buffer.from('test2')])
  })
})
