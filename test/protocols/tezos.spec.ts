import 'mocha'

import { expect } from 'chai'
import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'
import axios from 'axios'
import { TezosProtocol, isCoinlibReady } from '../../lib'
import { TezosTestProtocolSpec } from '../protocols/specs/tezos'
import { TezosOperationType, TezosSpendOperation } from '../../lib/protocols/TezosProtocol'

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

  describe('KT1 Prepare/Sign', () => {
    beforeEach(async () => {
      await isCoinlibReady()
      const stub = sinon.stub(axios, 'get')

      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/counter`)
        .returns(Promise.resolve({ data: 917326 }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
        .returns(Promise.resolve({ data: 'BMT1dwxYkLbssY34irU2LbSHEAYBZ3KfqtYCixaZoMoaarhx3Ko' }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/balance`)
        .returns(Promise.resolve({ data: 100000000 }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
        .returns(Promise.resolve({ data: { key: 'test-key' } }))
    })

    it('will properly prepare a TX to a KT1 address', async () => {
      const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'],
        [new BigNumber(100000)],
        new BigNumber(1420)
      )
      const airGapTx = tezosLib.getTransactionDetails({ transaction: rawTezosTx, publicKey: tezosProtocolSpec.wallet.publicKey })

      expect(rawTezosTx.jsonTransaction.contents[0].storage_limit).to.equal('300')
      expect(airGapTx.amount.toFixed()).to.equal('100000')
      expect(airGapTx.fee.toFixed()).to.equal('1420')
      expect(rawTezosTx.binaryTransaction).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44eac02a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
      )
    })

    it('will properly sign a TX to a KT1 address', async () => {
      const signedTezosTx = await tezosLib.signWithPrivateKey(Buffer.from(tezosProtocolSpec.wallet.privateKey, 'hex'), {
        jsonTransaction: {
          branch: 'BMT1dwxYkLbssY34irU2LbSHEAYBZ3KfqtYCixaZoMoaarhx3Ko',
          contents: [
            {
              kind: TezosOperationType.TRANSACTION,
              fee: '1420',
              gas_limit: '10100',
              storage_limit: '300',
              amount: '100000',
              counter: '917327',
              destination: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy',
              source: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
            } as TezosSpendOperation
          ]
        },
        binaryTransaction:
          'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44eac02a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
      })

      expect(signedTezosTx).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44eac02a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000a39862b8a5a80ae96f1040c999f9075ba7490d9206ec6443b06d2df3442d6cf09ea264daa09164622b7cb565d8ba37a02c9de7fd04ae50a78f531136cfd9b00e'
      )
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
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7/balance`)
        .returns(Promise.resolve({ data: 0.1 }))
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

      // check that storage is properly set
      expect(rawTezosTx.jsonTransaction.contents[0].storage_limit).to.equal('300')

      expect(airGapTx.amount.toFixed()).to.equal('643000')
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })

    it('will not deduct fee if enough funds are available on the account', async () => {
      const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'],
        [new BigNumber(100000)], // send only 1/10 of funds, so it should not deduct anything
        new BigNumber(100000)
      )
      const airGapTx = tezosLib.getTransactionDetails({ transaction: rawTezosTx, publicKey: tezosProtocolSpec.wallet.publicKey })

      // check that storage is properly set
      expect(rawTezosTx.jsonTransaction.contents[0].storage_limit).to.equal('300')

      expect(airGapTx.amount.toFixed()).to.equal('100000') // amount should be correct
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })

    it('will not mess with anything, given the receiving account has balance already', async () => {
      const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'],
        [new BigNumber(900000)], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
        new BigNumber(100000)
      )
      const airGapTx = tezosLib.getTransactionDetails({ transaction: rawTezosTx, publicKey: tezosProtocolSpec.wallet.publicKey })

      // check that storage is properly set
      expect(rawTezosTx.jsonTransaction.contents[0].storage_limit).to.equal('0')

      expect(airGapTx.amount.toFixed()).to.equal('900000') // amount should be correct
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })
  })
})
