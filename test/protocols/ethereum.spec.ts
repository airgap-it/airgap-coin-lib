import 'mocha'

import { expect } from 'chai'
import { EthereumTestProtocolSpec } from './specs/ethereum'

const ethProtocolSpec = new EthereumTestProtocolSpec()
const ethLib = ethProtocolSpec.lib

describe(`ICoinProtocol Ethereum - Custom Tests`, () => {
  it('should calculate the correct page', async () => {
    const values = [
      {
        limit: -1,
        offset: 0,
        expectedPage: 1
      },
      {
        limit: 0,
        offset: -1,
        expectedPage: 1
      },
      {
        limit: 0,
        offset: 0,
        expectedPage: 1
      },
      {
        limit: 10,
        offset: 0,
        expectedPage: 1
      },
      {
        limit: 10,
        offset: 5,
        expectedPage: 1
      },
      {
        limit: 10,
        offset: 10,
        expectedPage: 2
      },
      {
        limit: 10,
        offset: 11,
        expectedPage: 2
      },
      {
        limit: 10,
        offset: 19,
        expectedPage: 2
      },
      {
        limit: 10,
        offset: 20,
        expectedPage: 3
      }
    ]
    const ethLib1 = ethLib as any
    values.forEach(data => {
      expect(ethLib1.getPageNumber(data.limit, data.offset)).to.equal(data.expectedPage)
    })
  })
})
