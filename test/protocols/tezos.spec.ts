import 'mocha'

import { expect } from 'chai'
import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'
import axios from 'axios'
import { TezosProtocol } from '../../lib'
import { TezosTestProtocolSpec } from '../protocols/specs/tezos'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const tezosLib = tezosProtocolSpec.lib as TezosProtocol

describe(`ICoinProtocol Tezos - Custom Tests`, () => {
  beforeEach(() => {
    sinon
      .stub(axios, 'get')
      .withArgs(`${tezosLib.baseApiUrl}/v3/operations/${tezosProtocolSpec.wallet.addresses[0]}?type=Transaction&p=0&number=20`)
      .returns(
        Promise.resolve({
          data: [
            {
              hash: 'ooNNmftGhsUriHVWYgHGq6AE3F2sHZFYaCq41NQZSeUdm1UZEAP',
              block_hash: 'BMVuKQVUh2hxdgAf7mnXUQuf82BcMxuZjoLNxCi7YSJ4Mzvk7Qe',
              network_hash: 'NetXdQprcVkpaWU',
              type: {
                kind: 'manager',
                source: {
                  tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
                },
                operations: [
                  {
                    kind: 'transaction',
                    src: {
                      tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
                    },
                    amount: 1000000,
                    destination: {
                      tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
                    },
                    failed: false,
                    internal: false,
                    burn: 0,
                    counter: 917316,
                    fee: 1420,
                    gas_limit: '10100',
                    storage_limit: '0',
                    op_level: 261513,
                    timestamp: '2019-01-08T10:02:15Z'
                  }
                ]
              }
            }
          ]
        })
      )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('can give a list of transactions from TZScan API', async () => {
    const transactions = await tezosLib.getTransactionsFromAddresses(tezosProtocolSpec.wallet.addresses, 20, 0)

    expect(transactions).to.deep.equal([
      {
        amount: new BigNumber(1000000),
        fee: new BigNumber(1420),
        from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
        isInbound: true,
        timestamp: 1546941735000,
        protocolIdentifier: tezosLib.identifier,
        to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
        hash: 'ooNNmftGhsUriHVWYgHGq6AE3F2sHZFYaCq41NQZSeUdm1UZEAP',
        blockHeight: 261513
      }
    ])
  })
})
