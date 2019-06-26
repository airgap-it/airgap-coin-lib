import { expect } from 'chai'
import 'mocha'

import { padStart } from '../../src/utils/padStart'

describe(`padStart`, () => {
  it('does not pad if length is already reached', async () => {
    expect(padStart('a', 1, 'b')).to.be.equal('a')
  })

  it('can pad properly for a given length', async () => {
    expect(padStart('a', 3, 'b')).to.be.equal('bba')
  })

  it('can pad properly if maximum length is reached', async () => {
    expect(padStart('abc', 3, 'd')).to.be.equal('abc')
    expect(padStart('abc', -3, 'b')).to.be.equal('abc')
  })

  it('can pad if string with maximum length equal to length plus filler length', async () => {
    expect(padStart('cd', 3, 'ab')).to.be.equal('acd')
  })
})
