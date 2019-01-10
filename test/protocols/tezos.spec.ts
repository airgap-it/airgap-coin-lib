import 'mocha'

import { expect } from 'chai'
import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'
import axios from 'axios'
import { TezosProtocol, isCoinlibReady } from '../../lib'
import { TezosTestProtocolSpec } from '../protocols/specs/tezos'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const tezosLib = tezosProtocolSpec.lib as TezosProtocol

describe(`ICoinProtocol Tezos - Custom Tests`, () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('TX Lists', () => {
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
              },
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

    it('can give a list of transactions from TZScan API', async () => {
      const transactions = await tezosLib.getTransactionsFromAddresses(tezosProtocolSpec.wallet.addresses, 20, 0)

      expect(transactions).to.deep.equal([
        {
          amount: new BigNumber(1000000),
          fee: new BigNumber(1420),
          from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          isInbound: true,
          timestamp: 1546941735,
          protocolIdentifier: tezosLib.identifier,
          to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          hash: 'ooNNmftGhsUriHVWYgHGq6AE3F2sHZFYaCq41NQZSeUdm1UZEAP',
          blockHeight: 261513
        },
        {
          amount: new BigNumber(1000000),
          fee: new BigNumber(1420),
          from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          isInbound: true,
          timestamp: 1546941735,
          protocolIdentifier: tezosLib.identifier,
          to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          hash: 'ooNNmftGhsUriHVWYgHGq6AE3F2sHZFYaCq41NQZSeUdm1UZEAP',
          blockHeight: 261513
        }
      ])
    })
  })

  describe('Address Init', () => {
    beforeEach(async () => {
      await isCoinlibReady()
      const stub = sinon.stub(axios, 'get')

      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/counter`)
        .returns(Promise.resolve({ data: 917315 }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
        .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/balance`)
        .returns(Promise.resolve({ data: 1000000 }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S/balance`)
        .returns(Promise.resolve({ data: 0 }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/manager_key`)
        .returns(Promise.resolve({ data: { key: 'test-key' } }))
    })

    it('will deduct necessary fee to initialize empty TZ1 accounts, if amount + fee === balance', async () => {
      const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'],
        [new BigNumber(900000)],
        new BigNumber(100000)
      )
      const airGapTx = tezosLib.getTransactionDetails({ transaction: rawTezosTx, publicKey: tezosProtocolSpec.wallet.publicKey })

      expect(airGapTx.amount.toFixed()).to.equal('643000')
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })

    it('will not deduct fee if enough funds are available on the account', async () => {
      const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'],
        [new BigNumber(100000)], // send only 1/10 of funds, so it should
        new BigNumber(100000)
      )
      const airGapTx = tezosLib.getTransactionDetails({ transaction: rawTezosTx, publicKey: tezosProtocolSpec.wallet.publicKey })

      expect(airGapTx.amount.toFixed()).to.equal('100000') // amount should be correct
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })
  })
})
