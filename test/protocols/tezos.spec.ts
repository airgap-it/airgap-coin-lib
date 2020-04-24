import { expect } from 'chai'
import 'mocha'
import * as sinon from 'sinon'

import { IAirGapTransaction, isCoinlibReady, TezosProtocol } from '../../src'
import axios from '../../src/dependencies/src/axios-0.19.0/index'
import BigNumber from '../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { RawTezosTransaction } from '../../src/serializer/types'
import { TezosTestProtocolSpec } from '../protocols/specs/tezos'
import { TezosTransactionOperation } from '../../src/protocols/tezos/types/operations/Transaction'
import { TezosOperationType } from '../../src/protocols/tezos/types/TezosOperationType'
import { TezosOriginationOperation } from '../../src/protocols/tezos/types/operations/Origination'
import { TezosWrappedOperation } from '../../src/protocols/tezos/types/TezosWrappedOperation'
import { TezosRevealOperation } from '../../src/protocols/tezos/types/operations/Reveal'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const tezosLib = tezosProtocolSpec.lib

const prepareTxHelper = async (rawTezosTx: RawTezosTransaction) => {
  const airGapTxs = await tezosLib.getTransactionDetails({
    transaction: rawTezosTx,
    publicKey: tezosProtocolSpec.wallet.publicKey
  })

  const unforgedTransaction = await tezosLib.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

  const spendOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
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

  const originationOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.ORIGINATION)
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

    it('can unforge a delegation TX', async () => { })

    it('can give a list of transactions from Conseil API', async () => {
      const stub = sinon.stub(axios, 'post')
      stub.withArgs(`${tezosLib.baseApiUrl}/v2/data/tezos/mainnet/operations`).returns(
        Promise.resolve({
          data: [
            {
              source: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
              timestamp: 1561035943000,
              block_level: 261513,
              operation_group_hash: 'ooNNmftGhsUriHVWYgHGq6AE3F2sHZFYaCq41NQZSeUdm1UZEAP',
              amount: 1000000,
              destination: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
              fee: 1420
            }
          ]
        })
      )
      const transactions = await tezosLib.getTransactionsFromAddresses(tezosProtocolSpec.wallet.addresses, 20, 0)

      expect(transactions).to.deep.equal([
        {
          amount: new BigNumber(1000000),
          fee: new BigNumber(1420),
          from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          isInbound: true,
          timestamp: 1561035943,
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
      const result = await prepareSpend(
        ['KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'],
        ['100000'], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
        '1420'
      )

      expect(result.spendTransaction.storage_limit).to.equal('0') // kt addresses do not need to get funed, they are originated :)
      expect(result.airGapTxs.length).to.equal(1)
      expect(result.airGapTxs[0].amount).to.equal('100000')
      expect(result.airGapTxs[0].fee).to.equal('1920') // 500 mutez is added because in babylon this is sent to a contract
      expect(result.rawTezosTx.binaryTransaction).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a36c0091a9d2b003f19cf5a1f38f04f1000ab482d33176800fcffe37997800a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
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
    // const sendFee = new BigNumber('1400')
    // const revealFee = new BigNumber('1300')
    const initializationFee: BigNumber = new BigNumber('257000')
    // const originationBurn = new BigNumber('257000')
    let stub

    beforeEach(async () => {
      await isCoinlibReady()
      sinon.restore()
      stub = sinon.stub(axios, 'get')

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

    describe('Spend', () => {
      it('will deduct fee to initialize empty tz1 receiving address, if amount + fee === balance', async () => {
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
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))

      const result = await prepareSpend(
        ['KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'],
        ['12345', '54321'],
        '111'
      )

      // check that storage is properly set
      expect(result.spendTransaction.storage_limit).to.equal('0')

      expect(result.airGapTxs.length).to.equal(2)

      expect(result.airGapTxs[0].amount).to.equal('12345')
      expect(result.airGapTxs[0].fee).to.equal('611')

      expect(result.airGapTxs[1].amount).to.equal('54321')
      expect(result.airGapTxs[1].fee).to.equal('611')
    })

    it('will correctly prepare a single operation group if below the threshold', async () => {
      const numberOfOperations: number = 50
      const result = await prepareSpend(
        [...Array(numberOfOperations)].map(x => 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'),
        [...Array(numberOfOperations)].map((v, i) => i.toString()),
        '1'
      )
      expect(result.airGapTxs.length).to.equal(50)
    })

    it('will throw an error if number of operations is above the threshold for a single operation group', async () => {
      const numberOfOperations: number = 51

      return prepareSpend(
        [...Array(numberOfOperations)].map(x => 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'),
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

      const transactions = await protocol.prepareTransactionsFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        [...Array(numberOfOperations)].map(x => 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'),
        [...Array(numberOfOperations)].map((v, i) => i.toString()),
        '1'
      )

      expect(transactions.length).to.equal(1)

      const result1 = await prepareTxHelper(transactions[0])

      expect(result1.airGapTxs.length).to.equal(50)
    })

    it('will return 2 operation groups when calling prepareTransactionsFromPublicKey with a number of operations above the threshold', async () => {
      const numberOfOperations: number = 201
      const protocol = new TezosProtocol()

      const transactions = await protocol.prepareTransactionsFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        [...Array(numberOfOperations)].map(x => 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'),
        [...Array(numberOfOperations)].map((v, i) => i.toString()),
        '1'
      )

      expect(transactions.length).to.equal(2)

      const result1 = await prepareTxHelper(transactions[0])
      const result2 = await prepareTxHelper(transactions[1])

      expect(result1.airGapTxs.length).to.equal(200)
      expect(result2.airGapTxs.length).to.equal(1)

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

    it('will prepare an FA 1.2 transaction', async () => {
      // stub
      //   .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
      //   .returns(Promise.resolve({ data: 0 }))

      const protocol = new TezosProtocol()
      const incompleteTransaction: any[] = [
        {
          kind: 'transaction',
          amount: '0',
          fee: '500000',
          gas_limit: '400000',
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
      ]

      const transaction = await protocol.prepareOperations(tezosProtocolSpec.wallet.publicKey, incompleteTransaction)
      const forged = await protocol.forgeAndWrapOperations(transaction)

      const result = await prepareTxHelper(forged)

      // check that storage is properly set
      // expect(result.spendTransaction.storage_limit).to.equal('0')

      expect(result.airGapTxs.length).to.equal(1)

      const airGapTx = result.airGapTxs[0]

      expect(airGapTx.transactionDetails.amount).to.equal('0')
      expect(airGapTx.transactionDetails.fee).to.equal('500000')
      expect(airGapTx.transactionDetails.gas_limit).to.equal('400000')
      expect(airGapTx.transactionDetails.storage_limit).to.equal('60000')
      expect(airGapTx.transactionDetails.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.transactionDetails.destination).to.equal('KT1LH2o12xVRwTpJMZ6QJG74Fox8gE9QieFd')
      expect(airGapTx.transactionDetails.parameters).to.not.be.undefined
      expect(airGapTx.transactionDetails.parameters.entrypoint).to.equal('transfer')
      expect(airGapTx.transactionDetails.parameters.value.args[0].string).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(airGapTx.transactionDetails.parameters.value.args[1].args[0].string).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(airGapTx.transactionDetails.parameters.value.args[1].args[1].int).to.equal('10')

      expect(airGapTx.from.length).to.equal(1)
      expect(airGapTx.from[0]).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(airGapTx.to.length).to.equal(1)
      expect(airGapTx.to[0]).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(airGapTx.amount).to.equal('10')
      expect(airGapTx.fee).to.equal('500000')
    })

    it('will throw an error if the number of recipients and amounts do not match', async () => {
      stub
        .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))

      return prepareSpend(['KT1X6SSqro2zUo1Wa7X5BnDWBvfBxZ6feUnc', 'KT1QLtQ54dKzcfwxMHmEM6PC8tooUg6MxDZ3'], ['12345'], '111').catch(
        (error: Error) =>
          expect(error)
            .to.be.an('error')
            .with.property('message', 'length of recipients and values does not match!')
      )
    })
  })

  describe('TransactionDetails', () => {
    it('correctly get transaction details from a forged, unsigned transaction', async () => {
      const forgedUnsignedTransaction: string = 'e879f5c6312b85da97cbb3bcb14dd515f29b407a0cc08b70fbcdece5bb49d8b06e00bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc8c0bbe8139bc5000ff0012548f71994cb2ce18072d0dcb568fe35fb74930'

      const protocol: TezosProtocol = new TezosProtocol()
      const details: IAirGapTransaction[] = await protocol.getTransactionDetails({ publicKey: '', transaction: { binaryTransaction: forgedUnsignedTransaction } })

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
