import { expect } from 'chai'
import 'mocha'
import * as sinon from 'sinon'

import { IAirGapTransaction, isCoinlibReady, TezosProtocol } from '../../src'
import BigNumber from '../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { RawTezosTransaction } from '../../src/serializer/types'
import { TezosTestProtocolSpec } from '../protocols/specs/tezos'
import { TezosTransactionOperation } from '../../src/protocols/tezos/types/operations/Transaction'
import { TezosOperationType } from '../../src/protocols/tezos/types/TezosOperationType'
import { TezosOriginationOperation } from '../../src/protocols/tezos/types/operations/Origination'
import { TezosWrappedOperation } from '../../src/protocols/tezos/types/TezosWrappedOperation'
import { TezosRevealOperation } from '../../src/protocols/tezos/types/operations/Reveal'
import { RunOperationMetadata } from '../../src/protocols/tezos/TezosProtocol'
import { TezosProtocolStub } from './stubs/tezos.stub'
import { AirGapTransactionStatus } from '../../src/interfaces/IAirGapTransaction'
import { TezosOperation } from '../../src/protocols/tezos/types/operations/TezosOperation'
import { ConditionViolationError } from '../../src/errors'
import { Domain } from '../../src/errors/coinlib-error'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const tezosLib = tezosProtocolSpec.lib

const prepareTxHelper = async (rawTezosTx: RawTezosTransaction, protocol: TezosProtocol = tezosLib) => {
  const airGapTxs = await protocol.getTransactionDetails({
    transaction: rawTezosTx,
    publicKey: tezosProtocolSpec.wallet.publicKey
  })

  const unforgedTransaction = await protocol.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

  const spendOperation = unforgedTransaction.contents.find((content) => content.kind === TezosOperationType.TRANSACTION)
  if (spendOperation) {
    const spendTransaction: TezosTransactionOperation = spendOperation as TezosTransactionOperation

    return {
      spendTransaction,
      originationTransaction: {} as any,
      unforgedTransaction,
      airGapTxs,
      rawTezosTx
    }
  }

  const originationOperation = unforgedTransaction.contents.find((content) => content.kind === TezosOperationType.ORIGINATION)
  if (originationOperation) {
    const originationTransaction: TezosOriginationOperation = originationOperation as TezosOriginationOperation
    return {
      spendTransaction: {} as any,
      originationTransaction,
      unforgedTransaction,
      airGapTxs,
      rawTezosTx
    }
  }

  throw new Error('no supported operation')
}

const prepareSpend = async (receivers: string[], amounts: string[], fee: string) => {
  const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(tezosProtocolSpec.wallet.publicKey, receivers, amounts, fee)

  return prepareTxHelper(rawTezosTx)
}

describe(`ICoinProtocol Tezos - Custom Tests`, () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('TX Lists', () => {
    let getStub
    let postStub

    beforeEach(() => {
      const res = new TezosProtocolStub().registerStub(new TezosTestProtocolSpec(), tezosLib)
      getStub = res.getStub
      postStub = res.postStub

      getStub
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

    it('will parse various operations', async () => {
      const hexString =
        'a732d3520eeaa3de98d78e5e5cb6c85f72204fd46feb9f76853841d4a701add36c0008ba0cb2fad622697145cf1665124096d25bc31ef44e0af44e00b960000008ba0cb2fad622697145cf1665124096d25bc31e006c0008ba0cb2fad622697145cf1665124096d25bc31ed3e7bd1008d3bb0300b1a803000008ba0cb2fad622697145cf1665124096d25bc31e00' // contains: fee, counter, gas_limit, storage_limit and amount

      /*
    { "branch":"BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk",
      "contents":[{
      "kind":"transaction",
      "fee":"10100",
      "gas_limit":"10100",
      "storage_limit": "0",
      "amount":"12345",
      "counter":"10",
      "destination":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA",
      "source":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA"},
      {
      "kind":"transaction",
      "fee":"34567123",
      "gas_limit":"56787",
      "storage_limit": "0",
      "amount":"54321",
      "counter":"8",
      "destination":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA",
      "source":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA"}]
    }

           */

      let tezosWrappedOperation: TezosWrappedOperation = await tezosLib.unforgeUnsignedTezosWrappedOperation(hexString)

      expect(tezosWrappedOperation.branch).to.equal('BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk')
      expect(tezosWrappedOperation.contents.length).to.equal(2)

      const spendOperation1: TezosTransactionOperation = tezosWrappedOperation.contents[0] as TezosTransactionOperation
      const spendOperation2: TezosTransactionOperation = tezosWrappedOperation.contents[1] as TezosTransactionOperation

      expect(spendOperation1.fee).to.equal('10100')
      expect(spendOperation1.gas_limit).to.equal('10100')
      expect(spendOperation1.storage_limit).to.equal('0')
      expect(spendOperation1.amount).to.equal('12345')
      expect(spendOperation1.counter).to.equal('10')
      expect(spendOperation1.source).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')
      expect(spendOperation1.destination).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')

      expect(spendOperation2.fee).to.equal('34567123')
      expect(spendOperation2.gas_limit).to.equal('56787')
      expect(spendOperation2.storage_limit).to.equal('0')
      expect(spendOperation2.amount).to.equal('54321')
      expect(spendOperation2.counter).to.equal('8')
      expect(spendOperation2.source).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')
      expect(spendOperation2.destination).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')
      /*
    { "branch":"BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk",
      "contents":[
      {
      "kind":"reveal",
      "fee":"7866",
      "gas_limit":"3984",
      "storage_limit": "9",
      "counter":"13",
      "public_key":"edpkvCq9fHmAukBpFurMwR7YVukezNW7GCdQop3PJsGCo62t5MDeNw",
      "source":"tz1i6q8g1dcUha9PkKYpt3NtaXiQDLdLPSVn"
      },
      {
      "kind":"transaction",
      "fee":"56723",
      "gas_limit":"9875",
      "storage_limit": "2342356",
      "amount":"67846",
      "counter":"87988",
      "destination":"KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy",
      "source":"tz1KtGwriE7VuLwT3LwuvU9Nv4wAxP7XZ57d"
      },
      {
      "kind":"transaction",
      "fee":"31656123",
      "gas_limit":"6780893",
      "storage_limit": "0",
      "amount":"67867",
      "counter":"23423856",
      "destination":"KT1J5mFAxxzAYDLjYeVXkLcyEzNGRZ3kuFGq",
      "source":"tz1dBVokTuhh5UXtKxaVqmiUyhqoQhu71BmS"
      }
      ]
    }
           */
      const hexBigOperationTransaction =
        'a732d3520eeaa3de98d78e5e5cb6c85f72204fd46feb9f76853841d4a701add36b00f6645951a38c13586cda1edb9bdbebcf34a50773ba3d0d901f0900cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a2346c0002b1b8e2338ea7bf67ef23ff1277cbc7d4b6842493bb03b4af05934dd4fb8e0186920401ba4e7349ac25dc5eb2df5a43fceacc58963df4f500006c00c06daac32b63628ff2ed4b75ade88132cbef78d5bb918c0ff0d6950bddef9d03009b9204016834ed66e95b00e7aeeab2778d7c6b5a571171550000'
      tezosWrappedOperation = await tezosLib.unforgeUnsignedTezosWrappedOperation(hexBigOperationTransaction)
      expect(tezosWrappedOperation.branch).to.equal('BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk')
      expect(tezosWrappedOperation.contents.length).to.equal(3)

      const operation1: TezosRevealOperation = tezosWrappedOperation.contents[0] as TezosRevealOperation
      const operation2: TezosTransactionOperation = tezosWrappedOperation.contents[1] as TezosTransactionOperation
      const operation3: TezosTransactionOperation = tezosWrappedOperation.contents[2] as TezosTransactionOperation

      expect(operation1.fee).to.equal('7866')
      expect(operation1.gas_limit).to.equal('3984')
      expect(operation1.storage_limit).to.equal('9')
      expect(operation1.counter).to.equal('13')
      expect(operation1.source).to.equal('tz1i6q8g1dcUha9PkKYpt3NtaXiQDLdLPSVn')
      expect(operation1.public_key).to.equal('edpkvCq9fHmAukBpFurMwR7YVukezNW7GCdQop3PJsGCo62t5MDeNw')

      expect(operation2.fee).to.equal('56723')
      expect(operation2.gas_limit).to.equal('9875')
      expect(operation2.storage_limit).to.equal('2342356')
      expect(operation2.amount).to.equal('67846')
      expect(operation2.counter).to.equal('87988')
      expect(operation2.source).to.equal('tz1KtGwriE7VuLwT3LwuvU9Nv4wAxP7XZ57d')
      expect(operation2.destination).to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

      expect(operation3.fee).to.equal('31656123')
      expect(operation3.gas_limit).to.equal('6780893')
      expect(operation3.storage_limit).to.equal('0')
      expect(operation3.amount).to.equal('67867')
      expect(operation3.counter).to.equal('23423856')
      expect(operation3.source).to.equal('tz1dBVokTuhh5UXtKxaVqmiUyhqoQhu71BmS')
      expect(operation3.destination).to.equal('KT1J5mFAxxzAYDLjYeVXkLcyEzNGRZ3kuFGq')
    })

    it('can unforge a delegation TX', async () => {})

    it('can give a list of transactions from Conseil API', async () => {
      postStub.withArgs(`${tezosLib.baseApiUrl}/v2/data/tezos/mainnet/operations`).returns(
        Promise.resolve({
          data: [
            {
              source: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
              timestamp: 1561035943000,
              block_level: 261513,
              operation_group_hash: 'ooNNmftGhsUriHVWYgHGq6AE3F2sHZFYaCq41NQZSeUdm1UZEAP',
              amount: 1000000,
              destination: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
              fee: 1420,
              status: 'applied'
            }
          ]
        })
      )
      const transactions = await (await tezosLib.getTransactionsFromAddresses(tezosProtocolSpec.wallet.addresses, 20)).transactions

      expect(transactions.map((transaction) => ({ ...transaction, network: undefined }))).to.deep.eq([
        {
          amount: new BigNumber(1000000),
          fee: new BigNumber(1420),
          from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          isInbound: true,
          network: undefined,
          timestamp: 1561035943,
          protocolIdentifier: tezosLib.identifier,
          to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          hash: 'ooNNmftGhsUriHVWYgHGq6AE3F2sHZFYaCq41NQZSeUdm1UZEAP',
          blockHeight: 261513,
          status: AirGapTransactionStatus.APPLIED
        }
      ])

      expect(transactions.map((transaction) => ({ ...transaction.network, blockExplorer: undefined, extras: undefined }))).to.deep.eq([
        {
          blockExplorer: undefined,
          extras: undefined,
          name: 'Mainnet',
          rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
          type: 'MAINNET'
        }
      ])
    })
  })

  describe('KT1 Prepare/Sign', () => {
    let getStub
    let postStub

    beforeEach(async () => {
      await isCoinlibReady()

      const res = new TezosProtocolStub().registerStub(new TezosTestProtocolSpec(), tezosLib)
      getStub = res.getStub
      postStub = res.postStub

      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/counter`)
        .returns(Promise.resolve({ data: 917326 }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
        .returns(Promise.resolve({ data: 'BMT1dwxYkLbssY34irU2LbSHEAYBZ3KfqtYCixaZoMoaarhx3Ko' }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/balance`)
        .returns(Promise.resolve({ data: 100000000 }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
        .returns(Promise.resolve({ data: { key: 'test-key' } }))
    })

    it('will properly prepare a TX to a KT1 address', async () => {
      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                metadata: {
                  balance_updates: [],
                  operation_result: {
                    status: 'applied',
                    balance_updates: [],
                    consumed_gas: '15385',
                    paid_storage_size_diff: '0'
                  },
                  internal_operation_results: []
                }
              }
            ],
            signature: ''
          }
        })
      )

      const result = await prepareSpend(
        ['KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'],
        ['100000'], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
        '1420'
      )

      expect(result.spendTransaction.storage_limit).to.equal('0') // kt addresses do not need to get funed, they are originated :)
      expect(result.airGapTxs.length).to.equal(1)
      expect(result.airGapTxs[0].amount).to.equal('100000')
      expect(result.airGapTxs[0].fee).to.equal('1420')
      expect(result.rawTezosTx.binaryTransaction).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a36c0091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37997800a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
      )
    })

    it('will properly sign a TX to a KT1 address', async () => {
      const signedTezosTx = await tezosLib.signWithPrivateKey(Buffer.from(tezosProtocolSpec.wallet.privateKey, 'hex'), {
        binaryTransaction:
          'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44eac02a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
      })

      expect(signedTezosTx).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44eac02a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000a39862b8a5a80ae96f1040c999f9075ba7490d9206ec6443b06d2df3442d6cf09ea264daa09164622b7cb565d8ba37a02c9de7fd04ae50a78f531136cfd9b00e'
      )
    })
  })

  describe('Address Init', () => {
    let getStub
    let postStub

    // const sendFee = new BigNumber('1400')
    // const revealFee = new BigNumber('1300')
    const initializationFee: BigNumber = new BigNumber('257000')
    // const originationBurn = new BigNumber('257000')

    beforeEach(async () => {
      await isCoinlibReady()
      sinon.restore()

      const res = new TezosProtocolStub().registerStub(new TezosTestProtocolSpec(), tezosLib)
      getStub = res.getStub
      postStub = res.postStub

      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/counter`)
        .returns(Promise.resolve({ data: 917315 }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
        .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/balance`)
        .returns(Promise.resolve({ data: 1000000 }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S/balance`)
        .returns(Promise.resolve({ data: 0 }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7/balance`)
        .returns(Promise.resolve({ data: 0.1 }))
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/manager_key`)
        .returns(Promise.resolve({ data: { key: 'test-key' } }))
    })

    describe('Spend', () => {
      it('will deduct fee to initialize empty tz1 receiving address, if amount + fee === balance', async () => {
        postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
          Promise.resolve({
            data: {
              contents: [
                {
                  kind: 'transaction',
                  metadata: {
                    balance_updates: [],
                    operation_result: {
                      status: 'applied',
                      balance_updates: [],
                      consumed_gas: '10300',
                      paid_storage_size_diff: '300'
                    },
                    internal_operation_results: []
                  }
                }
              ],
              signature: ''
            }
          })
        )

        const address = 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'
        const amount = '900000'
        const fee = '100000'
        const result = await prepareSpend(
          [address],
          [amount], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          fee
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('300')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount).to.equal('643000') // 900000 - 257000 amount - initializationFee
        expect(result.airGapTxs[0].amount).to.equal(new BigNumber(amount).minus(initializationFee).toFixed())

        expect(result.airGapTxs[0].fee).to.equal('100000')
        expect(result.airGapTxs[0].fee).to.equal(fee)
      })

      it('will not deduct fee if enough funds are available on the account', async () => {
        postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
          Promise.resolve({
            data: {
              contents: [
                {
                  kind: 'transaction',
                  metadata: {
                    balance_updates: [],
                    operation_result: {
                      status: 'applied',
                      balance_updates: [],
                      consumed_gas: '10300',
                      paid_storage_size_diff: '300'
                    },
                    internal_operation_results: []
                  }
                }
              ],
              signature: ''
            }
          })
        )

        const result = await prepareSpend(
          ['tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'],
          ['100000'], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          '100000'
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('300')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount).to.equal('100000') // amount should be correct
        expect(result.airGapTxs[0].fee).to.equal('100000')
      })

      it('will correctly calculate the max transaction value for both revealed and unrevealed accounts', async () => {
        const address = tezosProtocolSpec.wallet.addresses[0]
        const configs = [tezosProtocolSpec.revealedAddressConfig, tezosProtocolSpec.unrevealedAddressConfig]

        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`)
          .returns(Promise.resolve({ data: '10147076' }))
        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
          .returns(Promise.resolve({ data: 'BLKAx9imSqD5t1qyu3K1cuZwVzddZRjuHpa8w94fh1aUmPgMohM' }))

        for (let config of configs) {
          getStub
            .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/balance`)
            .returns(Promise.resolve({ data: config.balance }))
          getStub
            .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
            .returns(Promise.resolve({ data: config.manager_key }))
          postStub
            .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`)
            .returns(Promise.resolve({ data: config.run_operation }))

          const estimatedFeeDefaults = await tezosLib.estimateFeeDefaultsFromPublicKey(
            tezosProtocolSpec.wallet.publicKey,
            [config.toAddress],
            [new BigNumber(config.balance).toString()]
          )

          // in case the account is unrevealed, maxFee includes the revealFee of 1300
          const maxFee = new BigNumber(estimatedFeeDefaults.medium).shiftedBy(tezosLib.decimals).toNumber()
          const maxTransfer = await tezosLib.estimateMaxTransactionValueFromPublicKey(tezosProtocolSpec.wallet.publicKey, [
            config.toAddress
          ])

          expect(new BigNumber(maxTransfer).toNumber()).to.equal(new BigNumber(config.balance - maxFee - 1).toNumber())
        }
      })

      // TODO: create an issue
      it.skip('will correctly prepare operations for an unrevealed address', async () => {
        const address = tezosProtocolSpec.wallet.addresses[0]

        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`)
          .returns(Promise.resolve({ data: '10147076' }))
        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
          .returns(Promise.resolve({ data: 'BLKAx9imSqD5t1qyu3K1cuZwVzddZRjuHpa8w94fh1aUmPgMohM' }))
        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/balance`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.unrevealedAddressConfig.balance }))
        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.unrevealedAddressConfig.manager_key }))
        postStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.unrevealedAddressConfig.run_operation }))

        const operationRequest = {
          kind: 'transaction',
          amount: tezosProtocolSpec.unrevealedAddressConfig.balance - 1,
          destination: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ',
          fee: '0'
        } as TezosOperation

        const tezosWrappedOperation = await tezosLib.prepareOperations(tezosProtocolSpec.wallet.publicKey, [operationRequest])

        const containsRevealOperation = tezosWrappedOperation.contents.some(
          (tezosOperation: TezosOperation) => tezosOperation.kind === TezosOperationType.REVEAL
        )

        expect(containsRevealOperation).eq(true)

        const transactions = tezosWrappedOperation.contents.filter(
          (tezosOperation: TezosOperation) => tezosOperation.kind === TezosOperationType.TRANSACTION
        )

        const revealFee = 1300
        const totalAmount = transactions
          .map((transaction) => (transaction as TezosTransactionOperation).amount)
          .reduce((a, b) => new BigNumber(a).plus(b).toString())

        expect(totalAmount).eq(new BigNumber(tezosProtocolSpec.unrevealedAddressConfig.balance - 1).minus(revealFee).toString())
      })

      it('will correctly prepare operations, taking the specified parameters as is', async () => {
        const address = tezosProtocolSpec.wallet.addresses[0]

        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`)
          .returns(Promise.resolve({ data: '10147076' }))
        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
          .returns(Promise.resolve({ data: 'BLKAx9imSqD5t1qyu3K1cuZwVzddZRjuHpa8w94fh1aUmPgMohM' }))
        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/balance`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.revealedAddressConfig.balance }))
        getStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.revealedAddressConfig.manager_key }))
        postStub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.revealedAddressConfig.run_operation }))

        const setValue = '1008'
        const operationRequest = {
          kind: 'transaction',
          amount: tezosProtocolSpec.revealedAddressConfig.balance - 1,
          destination: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ',
          fee: setValue,
          counter: setValue,
          gas_limit: setValue,
          storage_limit: setValue
        } as TezosOperation

        const tezosWrappedOperation = await tezosLib.prepareOperations(tezosProtocolSpec.wallet.publicKey, [operationRequest], false)

        const preparedOperation = tezosWrappedOperation.contents[0] as any
        expect(preparedOperation.kind).to.equal('transaction')
        expect(preparedOperation.fee).to.equal(setValue)
        expect(preparedOperation.gas_limit).to.equal(setValue)
        expect(preparedOperation.storage_limit).to.equal(setValue)
        expect(preparedOperation.counter).to.equal(setValue)
      })

      it('will not mess with anything, given the receiving account has balance already', async () => {
        const result = await prepareSpend(
          ['tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'],
          ['899999'], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          '100000'
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('0')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount).to.equal('899999') // amount should be correct
        expect(result.airGapTxs[0].fee).to.equal('100000')
      })

      it('will leave 1 mutez behind if we try to send the full balance', async () => {
        const result = await prepareSpend(
          ['tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'],
          ['900000'], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          '100000'
        )
        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('0')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount).to.equal('899999') // amount should be 1 less
        expect(result.airGapTxs[0].fee).to.equal('100000')
      })
    })

    it('will prepare a transaction with multiple spend operations to KT addresses', async () => {
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_gas: '10300',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [txRunOperation, txRunOperation],
            signature: ''
          }
        })
      )

      const result = await prepareSpend(
        ['KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'],
        ['12345', '54321'],
        '111'
      )

      // check that storage is properly set
      expect(result.spendTransaction.gas_limit).to.equal('10300')
      expect(result.spendTransaction.storage_limit).to.equal('0')

      expect(result.airGapTxs.length).to.equal(2)

      expect(result.airGapTxs[0].amount).to.equal('12345')
      expect(result.airGapTxs[0].fee).to.equal('111')

      expect(result.airGapTxs[1].amount).to.equal('54321')
      expect(result.airGapTxs[1].fee).to.equal('111')
    })

    it('will correctly prepare a single operation group if below the threshold', async () => {
      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_gas: '10300',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      const numberOfOperations: number = 50

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [...Array(numberOfOperations)].map((x) => txRunOperation),
            signature: ''
          }
        })
      )

      const result = await prepareSpend(
        [...Array(numberOfOperations)].map((x) => 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'),
        [...Array(numberOfOperations)].map((v, i) => i.toString()),
        '1'
      )
      expect(result.airGapTxs.length).to.equal(50)
    })

    it('will throw an error if number of operations is above the threshold for a single operation group', async () => {
      const numberOfOperations: number = 51

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_gas: '10300',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [...Array(numberOfOperations)].map((x) => txRunOperation),
            signature: ''
          }
        })
      )

      return prepareSpend(
        [...Array(numberOfOperations)].map((x) => 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'),
        [...Array(numberOfOperations)].map((v, i) => i.toString()),
        '1'
      ).catch((error: Error) =>
        expect(error)
          .to.be.an('error')
          .with.property(
            'message',
            'this transaction exceeds the maximum allowed number of transactions per operation. Please use the "prepareTransactionsFromPublicKey" method instead.'
          )
      )
    })

    it('will correctly prepare a single operation group when calling prepareTransactionsFromPublicKey', async () => {
      const numberOfOperations: number = 50
      const protocol = new TezosProtocol()

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_gas: '10300',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [...Array(numberOfOperations)].map((x) => txRunOperation),
            signature: ''
          }
        })
      )

      const transactions = await protocol.prepareTransactionsFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        [...Array(numberOfOperations)].map((x) => 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'),
        [...Array(numberOfOperations)].map((v, i) => i.toString()),
        '1'
      )

      expect(transactions.length).to.equal(1)

      const result1 = await prepareTxHelper(transactions[0])

      expect(result1.airGapTxs.length).to.equal(50)
    })

    it('will return 2 operation groups when calling prepareTransactionsFromPublicKey with a number of operations above the threshold', async () => {
      const numberOfOperations: number = 215
      const protocol = new TezosProtocol()

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_gas: '10300',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`)
        .onCall(0)
        .returns(
          Promise.resolve({
            data: {
              contents: [...Array(200)].map((x) => txRunOperation),
              signature: ''
            }
          })
        )
      postStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`)
        .onCall(1)
        .returns(
          Promise.resolve({
            data: {
              contents: [...Array(15)].map((x) => txRunOperation),
              signature: ''
            }
          })
        )

      const transactions = await protocol.prepareTransactionsFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        [...Array(numberOfOperations)].map((x) => 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'),
        [...Array(numberOfOperations)].map((v, i) => i.toString()),
        '1'
      )

      expect(transactions.length).to.equal(2)

      const result1 = await prepareTxHelper(transactions[0])
      const result2 = await prepareTxHelper(transactions[1])

      expect(result1.airGapTxs.length).to.equal(200)
      expect(result2.airGapTxs.length).to.equal(15)

      expect(result1.airGapTxs[0].amount, 'result1 first amount').to.equal('0')
      expect(result1.airGapTxs[0].fee, 'result1 first fee').to.equal('1')
      expect(result1.airGapTxs[0].transactionDetails.counter, 'result1 first counter').to.equal('917316')

      expect(result1.airGapTxs[199].amount).to.equal('199')
      expect(result1.airGapTxs[199].fee).to.equal('1')
      expect(result1.airGapTxs[199].transactionDetails.counter).to.equal('917515')

      expect(result2.airGapTxs[0].amount).to.equal('200')
      expect(result2.airGapTxs[0].fee).to.equal('1')
      expect(result2.airGapTxs[0].transactionDetails.counter).to.equal('917516')
    })

    // TODO: add test to test the add reveal to spend transactions

    it('will prepare an FA 1.2 transaction', async () => {
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/`).returns(
        Promise.resolve({
          data: {
            protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
            chain_id: 'NetXdQprcVkpaWU',
            hash: 'BKuTvcx5LJQgtiNXbd4py3RFRE4x7EYjTFwJjVjj4XP7h2vSxs6',
            header: {
              level: 940455,
              proto: 6,
              predecessor: 'BLurthGbZXstELdA3hXtGAA5kXxgtxmfUpzCq7bzpPVB92u9g1z',
              timestamp: '2020-05-06T10:41:32Z',
              validation_pass: 4,
              operations_hash: 'LLoajfGAHirmjbJWjX81gNiZPqyv8pqEyUx7FAygiYBXLQ18H2kX8',
              fitness: ['01', '00000000000459a7'],
              context: 'CoVNfjwSR78ChDuvVpRW6Lvjq6nwC6UsyrZzhDgrU2ZMiPYXNjYy',
              priority: 0,
              proof_of_work_nonce: '0639894462090000',
              signature: 'sigjnLFcgqv8QC1QwNhPgg4WomUGtL4nQ68u3GavKXLLWyFcf8g2ceaT6FeuRRVGcdDY7qj7MBo2iUo83L1rtroQKMhqZbw2'
            },
            metadata: {
              protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              test_chain_status: { status: 'not_running' },
              max_operations_ttl: 60,
              max_operation_data_length: 16384,
              max_block_header_length: 238,
              max_operation_list_length: [
                {
                  max_size: 32768,
                  max_op: 32
                },
                { max_size: 32768 },
                {
                  max_size: 135168,
                  max_op: 132
                },
                { max_size: 524288 }
              ],
              baker: 'tz1Kt4P8BCaP93AEV4eA7gmpRryWt5hznjCP',
              level: {
                level: 940455,
                level_position: 940454,
                cycle: 229,
                cycle_position: 2470,
                voting_period: 28,
                voting_period_position: 22950,
                expected_commitment: false
              },
              voting_period_kind: 'proposal',
              nonce_hash: null,
              consumed_gas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )
      const protocol = tezosProtocolSpec.fa12
      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/script`).returns(
        Promise.resolve({
          data: {
            code: []
          }
        })
      )

      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/entrypoints`).returns(
        Promise.resolve({
          data: {
            entrypoints: {
              transfer: {
                prim: 'pair',
                args: [
                  {
                    prim: 'address',
                    annots: [':from']
                  },
                  {
                    prim: 'pair',
                    args: [
                      {
                        prim: 'address',
                        annots: [':to']
                      },
                      {
                        prim: 'nat',
                        annots: [':value']
                      }
                    ]
                  }
                ]
              }
            }
          }
        })
      )

      const tx = {
        kind: 'transaction',
        amount: '0',
        fee: '500000',
        storage_limit: '60000',
        destination: 'KT1LH2o12xVRwTpJMZ6QJG74Fox8gE9QieFd',
        parameters: {
          entrypoint: 'transfer',
          value: {
            prim: 'Pair',
            args: [
              {
                string: 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'
              },
              {
                prim: 'Pair',
                args: [
                  {
                    string: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'
                  },
                  {
                    int: '10'
                  }
                ]
              }
            ]
          }
        }
      }

      const metadata: RunOperationMetadata = {
        balance_updates: [],
        operation_result: {
          status: 'applied',
          balance_updates: [],
          consumed_gas: '350000'
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              { ...tx, metadata },
              { ...tx, metadata }
            ]
          }
        })
      )

      const incompleteTransaction: any[] = [tx, tx]

      const transaction = await protocol.prepareOperations(tezosProtocolSpec.wallet.publicKey, incompleteTransaction)
      const forged = await protocol.forgeAndWrapOperations(transaction)

      const result = await prepareTxHelper(forged, protocol)

      // check that storage is properly set
      // expect(result.spendTransaction.storage_limit).to.equal('0')

      expect(result.airGapTxs.length).to.equal(2)

      const airGapTx = result.airGapTxs[0]
      const airGapTx2 = result.airGapTxs[1]

      expect(airGapTx.transactionDetails.amount).to.equal('0')
      expect(airGapTx.transactionDetails.fee).to.equal('35308')
      expect(airGapTx.transactionDetails.gas_limit).to.equal('350000')
      expect(airGapTx.transactionDetails.storage_limit).to.equal('0')
      expect(airGapTx.transactionDetails.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.transactionDetails.destination).to.equal('KT1LH2o12xVRwTpJMZ6QJG74Fox8gE9QieFd')
      expect(airGapTx.transactionDetails.parameters).to.not.be.undefined
      expect(airGapTx.transactionDetails.parameters.entrypoint).to.equal('transfer')
      expect(airGapTx.transactionDetails.parameters.value.args[0].string).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(airGapTx.transactionDetails.parameters.value.args[1].args[0].string).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(airGapTx.transactionDetails.parameters.value.args[1].args[1].int).to.equal('10')

      expect(airGapTx2.transactionDetails.gas_limit).to.equal('350000')

      expect(airGapTx.from.length).to.equal(1)
      expect(airGapTx.from[0]).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(airGapTx.to.length).to.equal(1)
      expect(airGapTx.to[0]).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(airGapTx.amount).to.equal('10')
      expect(airGapTx.fee).to.equal('35308')
    })

    it('will prepare an FA2 transaction from public key', async () => {
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/`).returns(
        Promise.resolve({
          data: {
            protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
            chain_id: 'NetXdQprcVkpaWU',
            hash: 'BKuTvcx5LJQgtiNXbd4py3RFRE4x7EYjTFwJjVjj4XP7h2vSxs6',
            header: {
              level: 940455,
              proto: 6,
              predecessor: 'BLurthGbZXstELdA3hXtGAA5kXxgtxmfUpzCq7bzpPVB92u9g1z',
              timestamp: '2020-05-06T10:41:32Z',
              validation_pass: 4,
              operations_hash: 'LLoajfGAHirmjbJWjX81gNiZPqyv8pqEyUx7FAygiYBXLQ18H2kX8',
              fitness: ['01', '00000000000459a7'],
              context: 'CoVNfjwSR78ChDuvVpRW6Lvjq6nwC6UsyrZzhDgrU2ZMiPYXNjYy',
              priority: 0,
              proof_of_work_nonce: '0639894462090000',
              signature: 'sigjnLFcgqv8QC1QwNhPgg4WomUGtL4nQ68u3GavKXLLWyFcf8g2ceaT6FeuRRVGcdDY7qj7MBo2iUo83L1rtroQKMhqZbw2'
            },
            metadata: {
              protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              test_chain_status: { status: 'not_running' },
              max_operations_ttl: 60,
              max_operation_data_length: 16384,
              max_block_header_length: 238,
              max_operation_list_length: [
                {
                  max_size: 32768,
                  max_op: 32
                },
                { max_size: 32768 },
                {
                  max_size: 135168,
                  max_op: 132
                },
                { max_size: 524288 }
              ],
              baker: 'tz1Kt4P8BCaP93AEV4eA7gmpRryWt5hznjCP',
              level: {
                level: 940455,
                level_position: 940454,
                cycle: 229,
                cycle_position: 2470,
                voting_period: 28,
                voting_period_position: 22950,
                expected_commitment: false
              },
              voting_period_kind: 'proposal',
              nonce_hash: null,
              consumed_gas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      const protocol = tezosProtocolSpec.fa2
      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/script`).returns(
        Promise.resolve({
          data: {
            code: []
          }
        })
      )

      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/entrypoints`).returns(
        Promise.resolve({
          data: {
            entrypoints: {
              transfer: {
                prim: 'list',
                args: [
                  {
                    prim: 'pair',
                    args: [
                      {
                        prim: 'address',
                        annots: ['%from_']
                      },
                      {
                        prim: 'list',
                        args: [
                          {
                            prim: 'pair',
                            args: [
                              {
                                prim: 'address',
                                annots: ['%to_']
                              },
                              {
                                prim: 'pair',
                                args: [
                                  {
                                    prim: 'nat',
                                    annots: ['%token_id']
                                  },
                                  {
                                    prim: 'nat',
                                    annots: ['%amount']
                                  }
                                ]
                              }
                            ]
                          }
                        ],
                        annots: ['%txs']
                      }
                    ]
                  }
                ]
              }
            }
          }
        })
      )

      const metadata: RunOperationMetadata = {
        balance_updates: [],
        operation_result: {
          status: 'applied',
          balance_updates: [],
          consumed_gas: '350000'
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: protocol.contractAddress,
                metadata
              }
            ]
          }
        })
      )

      const transaction = await protocol.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM', 'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH'],
        ['100', '200'],
        '500000'
      )

      const result = await prepareTxHelper(transaction, protocol)
      const airGapTx = result.airGapTxs[0]

      expect(airGapTx.transactionDetails.amount).to.equal('0')
      expect(airGapTx.transactionDetails.fee).to.equal('500000')
      expect(airGapTx.transactionDetails.gas_limit).to.equal('350000')
      expect(airGapTx.transactionDetails.storage_limit).to.equal('0')
      expect(airGapTx.transactionDetails.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.transactionDetails.destination).to.equal(protocol.contractAddress)
      expect(airGapTx.transactionDetails.parameters).to.not.be.undefined
      expect(airGapTx.transactionDetails.parameters.entrypoint).to.equal('transfer')
      expect(airGapTx.transactionDetails.parameters.value[0].args[0].string).to.equal(tezosProtocolSpec.wallet.addresses[0])
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][0].args[0].string).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][0].args[1].args[0].int).to.equal('0')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][0].args[1].args[1].int).to.equal('100')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][1].args[0].string).to.equal('tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][1].args[1].args[0].int).to.equal('0')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][1].args[1].args[1].int).to.equal('200')
    })

    it('will prepare an FA2 transfer transaction', async () => {
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/`).returns(
        Promise.resolve({
          data: {
            protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
            chain_id: 'NetXdQprcVkpaWU',
            hash: 'BKuTvcx5LJQgtiNXbd4py3RFRE4x7EYjTFwJjVjj4XP7h2vSxs6',
            header: {
              level: 940455,
              proto: 6,
              predecessor: 'BLurthGbZXstELdA3hXtGAA5kXxgtxmfUpzCq7bzpPVB92u9g1z',
              timestamp: '2020-05-06T10:41:32Z',
              validation_pass: 4,
              operations_hash: 'LLoajfGAHirmjbJWjX81gNiZPqyv8pqEyUx7FAygiYBXLQ18H2kX8',
              fitness: ['01', '00000000000459a7'],
              context: 'CoVNfjwSR78ChDuvVpRW6Lvjq6nwC6UsyrZzhDgrU2ZMiPYXNjYy',
              priority: 0,
              proof_of_work_nonce: '0639894462090000',
              signature: 'sigjnLFcgqv8QC1QwNhPgg4WomUGtL4nQ68u3GavKXLLWyFcf8g2ceaT6FeuRRVGcdDY7qj7MBo2iUo83L1rtroQKMhqZbw2'
            },
            metadata: {
              protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              test_chain_status: { status: 'not_running' },
              max_operations_ttl: 60,
              max_operation_data_length: 16384,
              max_block_header_length: 238,
              max_operation_list_length: [
                {
                  max_size: 32768,
                  max_op: 32
                },
                { max_size: 32768 },
                {
                  max_size: 135168,
                  max_op: 132
                },
                { max_size: 524288 }
              ],
              baker: 'tz1Kt4P8BCaP93AEV4eA7gmpRryWt5hznjCP',
              level: {
                level: 940455,
                level_position: 940454,
                cycle: 229,
                cycle_position: 2470,
                voting_period: 28,
                voting_period_position: 22950,
                expected_commitment: false
              },
              voting_period_kind: 'proposal',
              nonce_hash: null,
              consumed_gas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      const protocol = tezosProtocolSpec.fa2
      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/script`).returns(
        Promise.resolve({
          data: {
            code: []
          }
        })
      )

      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/entrypoints`).returns(
        Promise.resolve({
          data: {
            entrypoints: {
              transfer: {
                prim: 'list',
                args: [
                  {
                    prim: 'pair',
                    args: [
                      {
                        prim: 'address',
                        annots: ['%from_']
                      },
                      {
                        prim: 'list',
                        args: [
                          {
                            prim: 'pair',
                            args: [
                              {
                                prim: 'address',
                                annots: ['%to_']
                              },
                              {
                                prim: 'pair',
                                args: [
                                  {
                                    prim: 'nat',
                                    annots: ['%token_id']
                                  },
                                  {
                                    prim: 'nat',
                                    annots: ['%amount']
                                  }
                                ]
                              }
                            ]
                          }
                        ],
                        annots: ['%txs']
                      }
                    ]
                  }
                ]
              }
            }
          }
        })
      )

      const metadata: RunOperationMetadata = {
        balance_updates: [],
        operation_result: {
          status: 'applied',
          balance_updates: [],
          consumed_gas: '350000'
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: protocol.contractAddress,
                metadata
              }
            ]
          }
        })
      )

      const transaction = await protocol.transfer(
        [
          {
            from: 'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM',
            txs: [
              {
                to: 'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH',
                amount: '100',
                tokenID: 10
              },
              {
                to: 'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt',
                amount: '110',
                tokenID: 11
              }
            ]
          },
          {
            from: 'tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM',
            txs: [
              {
                to: 'tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB',
                amount: '200',
                tokenID: 20
              }
            ]
          }
        ],
        '500000',
        tezosProtocolSpec.wallet.publicKey
      )

      const result = await prepareTxHelper(transaction, protocol)
      const airGapTx = result.airGapTxs[0]

      expect(airGapTx.transactionDetails.amount).to.equal('0')
      expect(airGapTx.transactionDetails.fee).to.equal('500000')
      expect(airGapTx.transactionDetails.gas_limit).to.equal('350000')
      expect(airGapTx.transactionDetails.storage_limit).to.equal('0')
      expect(airGapTx.transactionDetails.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.transactionDetails.destination).to.equal(protocol.contractAddress)
      expect(airGapTx.transactionDetails.parameters).to.not.be.undefined
      expect(airGapTx.transactionDetails.parameters.entrypoint).to.equal('transfer')
      expect(airGapTx.transactionDetails.parameters.value[0].args[0].string).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][0].args[0].string).to.equal('tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][0].args[1].args[0].int).to.equal('10')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][0].args[1].args[1].int).to.equal('100')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][1].args[0].string).to.equal('tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][1].args[1].args[0].int).to.equal('11')
      expect(airGapTx.transactionDetails.parameters.value[0].args[1][1].args[1].args[1].int).to.equal('110')
      expect(airGapTx.transactionDetails.parameters.value[1].args[0].string).to.equal('tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM')
      expect(airGapTx.transactionDetails.parameters.value[1].args[1][0].args[0].string).to.equal('tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB')
      expect(airGapTx.transactionDetails.parameters.value[1].args[1][0].args[1].args[0].int).to.equal('20')
      expect(airGapTx.transactionDetails.parameters.value[1].args[1][0].args[1].args[1].int).to.equal('200')
    })

    it('will prepare an FA2 update operators transaction', async () => {
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/`).returns(
        Promise.resolve({
          data: {
            protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
            chain_id: 'NetXdQprcVkpaWU',
            hash: 'BKuTvcx5LJQgtiNXbd4py3RFRE4x7EYjTFwJjVjj4XP7h2vSxs6',
            header: {
              level: 940455,
              proto: 6,
              predecessor: 'BLurthGbZXstELdA3hXtGAA5kXxgtxmfUpzCq7bzpPVB92u9g1z',
              timestamp: '2020-05-06T10:41:32Z',
              validation_pass: 4,
              operations_hash: 'LLoajfGAHirmjbJWjX81gNiZPqyv8pqEyUx7FAygiYBXLQ18H2kX8',
              fitness: ['01', '00000000000459a7'],
              context: 'CoVNfjwSR78ChDuvVpRW6Lvjq6nwC6UsyrZzhDgrU2ZMiPYXNjYy',
              priority: 0,
              proof_of_work_nonce: '0639894462090000',
              signature: 'sigjnLFcgqv8QC1QwNhPgg4WomUGtL4nQ68u3GavKXLLWyFcf8g2ceaT6FeuRRVGcdDY7qj7MBo2iUo83L1rtroQKMhqZbw2'
            },
            metadata: {
              protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              test_chain_status: { status: 'not_running' },
              max_operations_ttl: 60,
              max_operation_data_length: 16384,
              max_block_header_length: 238,
              max_operation_list_length: [
                {
                  max_size: 32768,
                  max_op: 32
                },
                { max_size: 32768 },
                {
                  max_size: 135168,
                  max_op: 132
                },
                { max_size: 524288 }
              ],
              baker: 'tz1Kt4P8BCaP93AEV4eA7gmpRryWt5hznjCP',
              level: {
                level: 940455,
                level_position: 940454,
                cycle: 229,
                cycle_position: 2470,
                voting_period: 28,
                voting_period_position: 22950,
                expected_commitment: false
              },
              voting_period_kind: 'proposal',
              nonce_hash: null,
              consumed_gas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      const protocol = tezosProtocolSpec.fa2
      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/script`).returns(
        Promise.resolve({
          data: {
            code: []
          }
        })
      )

      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/entrypoints`).returns(
        Promise.resolve({
          data: {
            entrypoints: {
              update_operators: {
                prim: 'list',
                args: [
                  {
                    prim: 'or',
                    args: [
                      {
                        prim: 'pair',
                        args: [
                          {
                            prim: 'address',
                            annots: ['%owner']
                          },
                          {
                            prim: 'pair',
                            args: [
                              {
                                prim: 'address',
                                annots: ['%operator']
                              },
                              {
                                prim: 'nat',
                                annots: ['%token_id']
                              }
                            ]
                          }
                        ],
                        annots: ['%add_operator']
                      },
                      {
                        prim: 'pair',
                        args: [
                          {
                            prim: 'address',
                            annots: ['%owner']
                          },
                          {
                            prim: 'pair',
                            args: [
                              {
                                prim: 'address',
                                annots: ['%operator']
                              },
                              {
                                prim: 'nat',
                                annots: ['%token_id']
                              }
                            ]
                          }
                        ],
                        annots: ['%remove_operator']
                      }
                    ]
                  }
                ]
              }
            }
          }
        })
      )

      const metadata: RunOperationMetadata = {
        balance_updates: [],
        operation_result: {
          status: 'applied',
          balance_updates: [],
          consumed_gas: '350000'
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: protocol.contractAddress,
                metadata
              }
            ]
          }
        })
      )

      const transaction = await protocol.updateOperators(
        [
          {
            operation: 'add',
            owner: 'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM',
            operator: 'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH',
            tokenId: 0
          },
          {
            operation: 'remove',
            owner: 'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt',
            operator: 'tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM',
            tokenId: 1
          }
        ],
        '500000',
        tezosProtocolSpec.wallet.publicKey
      )

      const result = await prepareTxHelper(transaction, protocol)
      const airGapTx = result.airGapTxs[0]

      expect(airGapTx.transactionDetails.amount).to.equal('0')
      expect(airGapTx.transactionDetails.fee).to.equal('500000')
      expect(airGapTx.transactionDetails.gas_limit).to.equal('350000')
      expect(airGapTx.transactionDetails.storage_limit).to.equal('0')
      expect(airGapTx.transactionDetails.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.transactionDetails.destination).to.equal(protocol.contractAddress)
      expect(airGapTx.transactionDetails.parameters).to.not.be.undefined
      expect(airGapTx.transactionDetails.parameters.entrypoint).to.equal('update_operators')
      expect(airGapTx.transactionDetails.parameters.value[0].args[0].args[0].string).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
      expect(airGapTx.transactionDetails.parameters.value[0].args[0].args[1].args[0].string).to.equal(
        'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH'
      )
      expect(airGapTx.transactionDetails.parameters.value[0].args[0].args[1].args[1].int).to.equal('0')
      expect(airGapTx.transactionDetails.parameters.value[1].args[0].args[0].string).to.equal('tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt')
      expect(airGapTx.transactionDetails.parameters.value[1].args[0].args[1].args[0].string).to.equal(
        'tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM'
      )
      expect(airGapTx.transactionDetails.parameters.value[1].args[0].args[1].args[1].int).to.equal('1')
    })

    it('will prepare an FA2 token metadata transaction', async () => {
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/`).returns(
        Promise.resolve({
          data: {
            protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
            chain_id: 'NetXdQprcVkpaWU',
            hash: 'BKuTvcx5LJQgtiNXbd4py3RFRE4x7EYjTFwJjVjj4XP7h2vSxs6',
            header: {
              level: 940455,
              proto: 6,
              predecessor: 'BLurthGbZXstELdA3hXtGAA5kXxgtxmfUpzCq7bzpPVB92u9g1z',
              timestamp: '2020-05-06T10:41:32Z',
              validation_pass: 4,
              operations_hash: 'LLoajfGAHirmjbJWjX81gNiZPqyv8pqEyUx7FAygiYBXLQ18H2kX8',
              fitness: ['01', '00000000000459a7'],
              context: 'CoVNfjwSR78ChDuvVpRW6Lvjq6nwC6UsyrZzhDgrU2ZMiPYXNjYy',
              priority: 0,
              proof_of_work_nonce: '0639894462090000',
              signature: 'sigjnLFcgqv8QC1QwNhPgg4WomUGtL4nQ68u3GavKXLLWyFcf8g2ceaT6FeuRRVGcdDY7qj7MBo2iUo83L1rtroQKMhqZbw2'
            },
            metadata: {
              protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              test_chain_status: { status: 'not_running' },
              max_operations_ttl: 60,
              max_operation_data_length: 16384,
              max_block_header_length: 238,
              max_operation_list_length: [
                {
                  max_size: 32768,
                  max_op: 32
                },
                { max_size: 32768 },
                {
                  max_size: 135168,
                  max_op: 132
                },
                { max_size: 524288 }
              ],
              baker: 'tz1Kt4P8BCaP93AEV4eA7gmpRryWt5hznjCP',
              level: {
                level: 940455,
                level_position: 940454,
                cycle: 229,
                cycle_position: 2470,
                voting_period: 28,
                voting_period_position: 22950,
                expected_commitment: false
              },
              voting_period_kind: 'proposal',
              nonce_hash: null,
              consumed_gas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      const protocol = tezosProtocolSpec.fa2
      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/script`).returns(
        Promise.resolve({
          data: {
            code: []
          }
        })
      )

      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/entrypoints`).returns(
        Promise.resolve({
          data: {
            entrypoints: {
              token_metadata: {
                prim: 'pair',
                args: [
                  {
                    prim: 'list',
                    args: [
                      {
                        prim: 'nat'
                      }
                    ],
                    annots: ['%token_ids']
                  },
                  {
                    prim: 'lambda',
                    args: [
                      {
                        prim: 'list',
                        args: [
                          {
                            prim: 'pair',
                            args: [
                              {
                                prim: 'nat',
                                annots: ['%token_id']
                              },
                              {
                                prim: 'pair',
                                args: [
                                  {
                                    prim: 'string',
                                    annots: ['%symbol']
                                  },
                                  {
                                    prim: 'pair',
                                    args: [
                                      {
                                        prim: 'string',
                                        annots: ['%name']
                                      },
                                      {
                                        prim: 'pair',
                                        args: [
                                          {
                                            prim: 'nat',
                                            annots: ['%decimals']
                                          },
                                          {
                                            prim: 'map',
                                            args: [
                                              {
                                                prim: 'string'
                                              },
                                              {
                                                prim: 'string'
                                              }
                                            ],
                                            annots: ['%extras']
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        prim: 'unit'
                      }
                    ],
                    annots: ['%handler']
                  }
                ]
              }
            }
          }
        })
      )

      const metadata: RunOperationMetadata = {
        balance_updates: [],
        operation_result: {
          status: 'applied',
          balance_updates: [],
          consumed_gas: '350000'
        }
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: protocol.contractAddress,
                metadata
              }
            ]
          }
        })
      )

      const transaction = await protocol.tokenMetadata([0, 1, 2], 'handler', '500000', tezosProtocolSpec.wallet.publicKey)

      const result = await prepareTxHelper(transaction, protocol)
      const airGapTx = result.airGapTxs[0]

      expect(airGapTx.transactionDetails.amount).to.equal('0')
      expect(airGapTx.transactionDetails.fee).to.equal('500000')
      expect(airGapTx.transactionDetails.gas_limit).to.equal('350000')
      expect(airGapTx.transactionDetails.storage_limit).to.equal('0')
      expect(airGapTx.transactionDetails.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.transactionDetails.destination).to.equal(protocol.contractAddress)
      expect(airGapTx.transactionDetails.parameters).to.not.be.undefined
      expect(airGapTx.transactionDetails.parameters.entrypoint).to.equal('token_metadata')
      expect(airGapTx.transactionDetails.parameters.value.args[0][0].int).to.equal('0')
      expect(airGapTx.transactionDetails.parameters.value.args[0][1].int).to.equal('1')
      expect(airGapTx.transactionDetails.parameters.value.args[0][2].int).to.equal('2')
      expect(airGapTx.transactionDetails.parameters.value.args[1].string).to.equal('handler')
    })

    it('will check FA2 balance', async () => {
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/`).returns(
        Promise.resolve({
          data: {
            protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
            chain_id: 'NetXdQprcVkpaWU',
            hash: 'BKuTvcx5LJQgtiNXbd4py3RFRE4x7EYjTFwJjVjj4XP7h2vSxs6',
            header: {
              level: 940455,
              proto: 6,
              predecessor: 'BLurthGbZXstELdA3hXtGAA5kXxgtxmfUpzCq7bzpPVB92u9g1z',
              timestamp: '2020-05-06T10:41:32Z',
              validation_pass: 4,
              operations_hash: 'LLoajfGAHirmjbJWjX81gNiZPqyv8pqEyUx7FAygiYBXLQ18H2kX8',
              fitness: ['01', '00000000000459a7'],
              context: 'CoVNfjwSR78ChDuvVpRW6Lvjq6nwC6UsyrZzhDgrU2ZMiPYXNjYy',
              priority: 0,
              proof_of_work_nonce: '0639894462090000',
              signature: 'sigjnLFcgqv8QC1QwNhPgg4WomUGtL4nQ68u3GavKXLLWyFcf8g2ceaT6FeuRRVGcdDY7qj7MBo2iUo83L1rtroQKMhqZbw2'
            },
            metadata: {
              protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              test_chain_status: { status: 'not_running' },
              max_operations_ttl: 60,
              max_operation_data_length: 16384,
              max_block_header_length: 238,
              max_operation_list_length: [
                {
                  max_size: 32768,
                  max_op: 32
                },
                { max_size: 32768 },
                {
                  max_size: 135168,
                  max_op: 132
                },
                { max_size: 524288 }
              ],
              baker: 'tz1Kt4P8BCaP93AEV4eA7gmpRryWt5hznjCP',
              level: {
                level: 940455,
                level_position: 940454,
                cycle: 229,
                cycle_position: 2470,
                voting_period: 28,
                voting_period_position: 22950,
                expected_commitment: false
              },
              voting_period_kind: 'proposal',
              nonce_hash: null,
              consumed_gas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      const protocol = tezosProtocolSpec.fa2
      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/script`).returns(
        Promise.resolve({
          data: {
            code: []
          }
        })
      )

      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/entrypoints`).returns(
        Promise.resolve({
          data: {
            entrypoints: {
              balance_of: {
                prim: 'pair',
                args: [
                  {
                    prim: 'list',
                    args: [
                      {
                        prim: 'pair',
                        args: [
                          {
                            prim: 'address',
                            annots: ['%owner']
                          },
                          {
                            prim: 'nat',
                            annots: ['%token_id']
                          }
                        ]
                      }
                    ],
                    annots: ['%requests']
                  },
                  {
                    prim: 'contract',
                    args: [
                      {
                        prim: 'list',
                        args: [
                          {
                            prim: 'pair',
                            args: [
                              {
                                prim: 'pair',
                                args: [
                                  {
                                    prim: 'address',
                                    annots: ['%owner']
                                  },
                                  {
                                    prim: 'nat',
                                    annots: ['%token_id']
                                  }
                                ],
                                annots: ['%request']
                              },
                              {
                                prim: 'nat',
                                annots: ['%balance']
                              }
                            ]
                          }
                        ]
                      }
                    ],
                    annots: ['%callback']
                  }
                ]
              }
            }
          }
        })
      )

      const metadata: RunOperationMetadata = {
        balance_updates: [],
        operation_result: {
          status: 'applied',
          balance_updates: [],
          consumed_gas: '350000'
        },
        internal_operation_results: [
          {
            parameters: {
              entrypoint: 'default',
              value: [
                {
                  prim: 'Pair',
                  args: [
                    {
                      prim: 'Pair',
                      args: [
                        {
                          string: 'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM'
                        },
                        {
                          int: '0'
                        }
                      ]
                    },
                    {
                      int: 100
                    }
                  ]
                },
                {
                  prim: 'Pair',
                  args: [
                    {
                      prim: 'Pair',
                      args: [
                        {
                          string: 'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH'
                        },
                        {
                          int: '1'
                        }
                      ]
                    },
                    {
                      int: 110
                    }
                  ]
                }
              ]
            }
          }
        ]
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: protocol.contractAddress,
                metadata
              }
            ]
          }
        })
      )

      const source = 'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt'
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${source}/counter`).returns(
        Promise.resolve({
          data: 0
        })
      )

      const balanceResults = await protocol.balanceOf(
        [
          {
            address: 'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM',
            tokenID: 0
          },
          {
            address: 'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH',
            tokenID: 1
          }
        ],
        source,
        'KT1B3vuScLjXeesTAYo19LdnnLgGqyYZtgae'
      )

      expect(balanceResults.length).to.equal(2)
      expect(balanceResults[0].address).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
      expect(balanceResults[0].tokenID).to.equal(0)
      expect(balanceResults[0].amount).to.equal('100')
      expect(balanceResults[1].address).to.equal('tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH')
      expect(balanceResults[1].tokenID).to.equal(1)
      expect(balanceResults[1].amount).to.equal('110')
    })

    it('will gets FA2 token metadata address', async () => {
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/`).returns(
        Promise.resolve({
          data: {
            protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
            chain_id: 'NetXdQprcVkpaWU',
            hash: 'BKuTvcx5LJQgtiNXbd4py3RFRE4x7EYjTFwJjVjj4XP7h2vSxs6',
            header: {
              level: 940455,
              proto: 6,
              predecessor: 'BLurthGbZXstELdA3hXtGAA5kXxgtxmfUpzCq7bzpPVB92u9g1z',
              timestamp: '2020-05-06T10:41:32Z',
              validation_pass: 4,
              operations_hash: 'LLoajfGAHirmjbJWjX81gNiZPqyv8pqEyUx7FAygiYBXLQ18H2kX8',
              fitness: ['01', '00000000000459a7'],
              context: 'CoVNfjwSR78ChDuvVpRW6Lvjq6nwC6UsyrZzhDgrU2ZMiPYXNjYy',
              priority: 0,
              proof_of_work_nonce: '0639894462090000',
              signature: 'sigjnLFcgqv8QC1QwNhPgg4WomUGtL4nQ68u3GavKXLLWyFcf8g2ceaT6FeuRRVGcdDY7qj7MBo2iUo83L1rtroQKMhqZbw2'
            },
            metadata: {
              protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
              test_chain_status: { status: 'not_running' },
              max_operations_ttl: 60,
              max_operation_data_length: 16384,
              max_block_header_length: 238,
              max_operation_list_length: [
                {
                  max_size: 32768,
                  max_op: 32
                },
                { max_size: 32768 },
                {
                  max_size: 135168,
                  max_op: 132
                },
                { max_size: 524288 }
              ],
              baker: 'tz1Kt4P8BCaP93AEV4eA7gmpRryWt5hznjCP',
              level: {
                level: 940455,
                level_position: 940454,
                cycle: 229,
                cycle_position: 2470,
                voting_period: 28,
                voting_period_position: 22950,
                expected_commitment: false
              },
              voting_period_kind: 'proposal',
              nonce_hash: null,
              consumed_gas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      const protocol = tezosProtocolSpec.fa2
      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/script`).returns(
        Promise.resolve({
          data: {
            code: []
          }
        })
      )

      getStub.withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${protocol.contractAddress}/entrypoints`).returns(
        Promise.resolve({
          data: {
            entrypoints: {
              token_metadata_registry: {
                prim: 'contract',
                args: [
                  {
                    prim: 'address'
                  }
                ]
              }
            }
          }
        })
      )

      const metadata: RunOperationMetadata = {
        balance_updates: [],
        operation_result: {
          status: 'applied',
          balance_updates: [],
          consumed_gas: '350000'
        },
        internal_operation_results: [
          {
            parameters: {
              entrypoint: 'default',
              value: {
                string: 'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM'
              }
            }
          }
        ]
      }

      postStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: protocol.contractAddress,
                metadata
              }
            ]
          }
        })
      )

      const source = 'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt'
      getStub.withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${source}/counter`).returns(
        Promise.resolve({
          data: 0
        })
      )

      const tokenMetadataRegistry = await protocol.tokenMetadataRegistry(source, 'KT1B3vuScLjXeesTAYo19LdnnLgGqyYZtgae')
      expect(tokenMetadataRegistry).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
    })

    it('will throw an error if the number of recipients and amounts do not match', async () => {
      getStub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))

      return prepareSpend(['KT1X6SSqro2zUo1Wa7X5BnDWBvfBxZ6feUnc', 'KT1QLtQ54dKzcfwxMHmEM6PC8tooUg6MxDZ3'], ['12345'], '111').catch(
        (error: Error) =>
          expect(error)
            .to.be.an('error')
            .with.property('message', new ConditionViolationError(Domain.TEZOS, 'length of recipients and values does not match!').message)
      )
    })
  })

  describe('TransactionDetails', () => {
    it('correctly get transaction details from a forged, unsigned transaction', async () => {
      const forgedUnsignedTransaction: string =
        'e879f5c6312b85da97cbb3bcb14dd515f29b407a0cc08b70fbcdece5bb49d8b06e00bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc8c0bbe8139bc5000ff0012548f71994cb2ce18072d0dcb568fe35fb74930'

      const protocol: TezosProtocol = new TezosProtocol()
      const details: IAirGapTransaction[] = await protocol.getTransactionDetails({
        publicKey: '',
        transaction: { binaryTransaction: forgedUnsignedTransaction }
      })

      expect(details[0].amount).to.equal('0')
      expect(details[0].fee).to.equal('1420')
      expect(details[0].from[0]).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(details[0].to[0]).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(details[0].transactionDetails).to.deep.equal({
        kind: 'delegation',
        source: 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7',
        fee: '1420',
        counter: '934078',
        gas_limit: '10300',
        storage_limit: '0',
        delegate: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'
      })
    })
  })
})
