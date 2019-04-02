import 'mocha'

import { expect } from 'chai'
import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'
import axios from 'axios'
import { isCoinlibReady } from '../../lib'
import { TezosTestProtocolSpec } from '../protocols/specs/tezos'
import { TezosOperationType, TezosRevealOperation, TezosSpendOperation } from '../../lib/protocols/tezos/TezosProtocol'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const tezosLib = tezosProtocolSpec.lib

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

    it('will randomly convert zarith to bignum back and forth', async () => {
      const numberToConvert = new BigNumber(Math.round(Math.random() * 1000000))
      const zarithString = tezosLib.bigNumberToZarith(numberToConvert)
      const resultConversion = tezosLib.zarithToBigNumber(zarithString)
      expect(numberToConvert.toFixed()).to.equal(resultConversion.toFixed())
    })

    it('will iteratively convert multiple zariths to bignum', async () => {
      let hexString = 'f44e0af44e00b960' // contains: fee, counter, gas_limit, storage_limit and amount

      let results: BigNumber[] = []
      while (hexString.length > 0) {
        const zarithString = hexString.substr(0, tezosLib.findZarithEndIndex(hexString))
        hexString = hexString.substr(tezosLib.findZarithEndIndex(hexString), hexString.length - tezosLib.findZarithEndIndex(hexString))
        results.push(tezosLib.zarithToBigNumber(zarithString))
      }

      expect(results.length).to.equal(5)
      expect(results[0].toFixed()).to.equal('10100')
      expect(results[1].toFixed()).to.equal('10')
      expect(results[2].toFixed()).to.equal('10100')
      expect(results[3].toFixed()).to.equal('0')
      expect(results[4].toFixed()).to.equal('12345')
    })

    it('will parse various operations', async () => {
      let hexString =
        'a732d3520eeaa3de98d78e5e5cb6c85f72204fd46feb9f76853841d4a701add308000008ba0cb2fad622697145cf1665124096d25bc31ef44e0af44e00b960000008ba0cb2fad622697145cf1665124096d25bc31e0008000008ba0cb2fad622697145cf1665124096d25bc31ed3e7bd1008d3bb0300b1a803000008ba0cb2fad622697145cf1665124096d25bc31e00' // contains: fee, counter, gas_limit, storage_limit and amount

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
      let tezosWrappedOperation = tezosLib.unforgeUnsignedTezosWrappedOperation(hexString)

      expect(tezosWrappedOperation.branch).to.equal('BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk')
      expect(tezosWrappedOperation.contents.length).to.equal(2)

      expect(tezosWrappedOperation.contents[0].fee).to.equal('10100')
      expect(tezosWrappedOperation.contents[0].gas_limit).to.equal('10100')
      expect(tezosWrappedOperation.contents[0].storage_limit).to.equal('0')
      expect((tezosWrappedOperation.contents[0] as TezosSpendOperation).amount).to.equal('12345')
      expect(tezosWrappedOperation.contents[0].counter).to.equal('10')
      expect(tezosWrappedOperation.contents[0].source).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')
      expect((tezosWrappedOperation.contents[0] as TezosSpendOperation).destination).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')

      expect(tezosWrappedOperation.contents[1].fee).to.equal('34567123')
      expect(tezosWrappedOperation.contents[1].gas_limit).to.equal('56787')
      expect(tezosWrappedOperation.contents[1].storage_limit).to.equal('0')
      expect((tezosWrappedOperation.contents[1] as TezosSpendOperation).amount).to.equal('54321')
      expect(tezosWrappedOperation.contents[1].counter).to.equal('8')
      expect(tezosWrappedOperation.contents[1].source).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')
      expect((tezosWrappedOperation.contents[1] as TezosSpendOperation).destination).to.equal('tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA')
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
        'a732d3520eeaa3de98d78e5e5cb6c85f72204fd46feb9f76853841d4a701add3070000f6645951a38c13586cda1edb9bdbebcf34a50773ba3d0d901f0900cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a23408000002b1b8e2338ea7bf67ef23ff1277cbc7d4b6842493bb03b4af05934dd4fb8e0186920401ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000080000c06daac32b63628ff2ed4b75ade88132cbef78d5bb918c0ff0d6950bddef9d03009b9204016834ed66e95b00e7aeeab2778d7c6b5a571171550000'
      tezosWrappedOperation = tezosLib.unforgeUnsignedTezosWrappedOperation(hexBigOperationTransaction)
      expect(tezosWrappedOperation.branch).to.equal('BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk')
      expect(tezosWrappedOperation.contents.length).to.equal(3)

      expect(tezosWrappedOperation.contents[0].fee).to.equal('7866')
      expect(tezosWrappedOperation.contents[0].gas_limit).to.equal('3984')
      expect(tezosWrappedOperation.contents[0].storage_limit).to.equal('9')
      expect(tezosWrappedOperation.contents[0].counter).to.equal('13')
      expect(tezosWrappedOperation.contents[0].source).to.equal('tz1i6q8g1dcUha9PkKYpt3NtaXiQDLdLPSVn')
      expect((tezosWrappedOperation.contents[0] as TezosRevealOperation).public_key).to.equal(
        'edpkvCq9fHmAukBpFurMwR7YVukezNW7GCdQop3PJsGCo62t5MDeNw'
      )

      expect(tezosWrappedOperation.contents[1].fee).to.equal('56723')
      expect(tezosWrappedOperation.contents[1].gas_limit).to.equal('9875')
      expect(tezosWrappedOperation.contents[1].storage_limit).to.equal('2342356')
      expect((tezosWrappedOperation.contents[1] as TezosSpendOperation).amount).to.equal('67846')
      expect(tezosWrappedOperation.contents[1].counter).to.equal('87988')
      expect(tezosWrappedOperation.contents[1].source).to.equal('tz1KtGwriE7VuLwT3LwuvU9Nv4wAxP7XZ57d')
      expect((tezosWrappedOperation.contents[1] as TezosSpendOperation).destination).to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

      expect(tezosWrappedOperation.contents[2].fee).to.equal('31656123')
      expect(tezosWrappedOperation.contents[2].gas_limit).to.equal('6780893')
      expect(tezosWrappedOperation.contents[2].storage_limit).to.equal('0')
      expect((tezosWrappedOperation.contents[2] as TezosSpendOperation).amount).to.equal('67867')
      expect(tezosWrappedOperation.contents[2].counter).to.equal('23423856')
      expect(tezosWrappedOperation.contents[2].source).to.equal('tz1dBVokTuhh5UXtKxaVqmiUyhqoQhu71BmS')
      expect((tezosWrappedOperation.contents[2] as TezosSpendOperation).destination).to.equal('KT1J5mFAxxzAYDLjYeVXkLcyEzNGRZ3kuFGq')
    })

    it('can unforge a delegation TX', async () => {})

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
      const airGapTx = await tezosLib.getTransactionDetails({
        transaction: rawTezosTx,
        publicKey: tezosProtocolSpec.wallet.publicKey
      })

      const unforgedTransaction = tezosLib.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

      const spendOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
      if (!spendOperation) {
        throw new Error('No spend transaction found')
      }
      const spendTransaction: TezosSpendOperation = spendOperation as TezosSpendOperation

      expect(spendTransaction.storage_limit).to.equal('0') // kt addresses do not need to get funed, they are originated :)
      expect(airGapTx.amount.toFixed()).to.equal('100000')
      expect(airGapTx.fee.toFixed()).to.equal('1420')
      expect(rawTezosTx.binaryTransaction).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44e00a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
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
      const airGapTx = await tezosLib.getTransactionDetails({
        transaction: rawTezosTx,
        publicKey: tezosProtocolSpec.wallet.publicKey
      })

      const unforgedTransaction = tezosLib.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

      const spendOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
      if (!spendOperation) {
        throw new Error('No spend transaction found')
      }
      const spendTransaction: TezosSpendOperation = spendOperation as TezosSpendOperation

      // check that storage is properly set
      expect(spendTransaction.storage_limit).to.equal('300')

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
      const airGapTx = await tezosLib.getTransactionDetails({
        transaction: rawTezosTx,
        publicKey: tezosProtocolSpec.wallet.publicKey
      })

      const unforgedTransaction = tezosLib.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

      const spendOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
      if (!spendOperation) {
        throw new Error('No spend transaction found')
      }
      const spendTransaction: TezosSpendOperation = spendOperation as TezosSpendOperation

      // check that storage is properly set
      expect(spendTransaction.storage_limit).to.equal('300')

      expect(airGapTx.amount.toFixed()).to.equal('100000') // amount should be correct
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })

    it('will not mess with anything, given the receiving account has balance already', async () => {
      const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'],
        [new BigNumber(899999)], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
        new BigNumber(100000)
      )
      const airGapTx = await tezosLib.getTransactionDetails({
        transaction: rawTezosTx,
        publicKey: tezosProtocolSpec.wallet.publicKey
      })

      const unforgedTransaction = tezosLib.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

      const spendOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
      if (!spendOperation) {
        throw new Error('No spend transaction found')
      }
      const spendTransaction: TezosSpendOperation = spendOperation as TezosSpendOperation

      // check that storage is properly set
      expect(spendTransaction.storage_limit).to.equal('0')

      expect(airGapTx.amount.toFixed()).to.equal('899999') // amount should be correct
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })

    it('will leave 1 mutez behind if we try to send the full balance', async () => {
      const rawTezosTx = await tezosLib.prepareTransactionFromPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        ['tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'],
        [new BigNumber(900000)], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
        new BigNumber(100000)
      )
      const airGapTx = await tezosLib.getTransactionDetails({
        transaction: rawTezosTx,
        publicKey: tezosProtocolSpec.wallet.publicKey
      })

      const unforgedTransaction = tezosLib.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

      const spendOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
      if (!spendOperation) {
        throw new Error('No spend transaction found')
      }
      const spendTransaction: TezosSpendOperation = spendOperation as TezosSpendOperation

      // check that storage is properly set
      expect(spendTransaction.storage_limit).to.equal('0')

      expect(airGapTx.amount.toFixed()).to.equal('899999') // amount should be correct
      expect(airGapTx.fee.toFixed()).to.equal('100000')
    })
  })
})
