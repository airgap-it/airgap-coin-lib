import axios from 'axios'
import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import 'mocha'
import * as sinon from 'sinon'

import { isCoinlibReady } from '../../src'
import {
  TezosOperationType,
  TezosOriginationOperation,
  TezosRevealOperation,
  TezosSpendOperation
} from '../../src/protocols/tezos/TezosProtocol'
import { RawTezosTransaction } from '../../src/serializer/unsigned-transactions/tezos-transactions.serializer'
import { TezosTestProtocolSpec } from '../protocols/specs/tezos'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const tezosLib = tezosProtocolSpec.lib

const prepareTxHelper = async (rawTezosTx: RawTezosTransaction) => {
  const airGapTx = await tezosLib.getTransactionDetails({
    transaction: rawTezosTx,
    publicKey: tezosProtocolSpec.wallet.publicKey
  })

  const unforgedTransaction = tezosLib.unforgeUnsignedTezosWrappedOperation(rawTezosTx.binaryTransaction)

  const spendOperation = unforgedTransaction.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
  if (spendOperation) {
    const spendTransaction: TezosSpendOperation = spendOperation as TezosSpendOperation
    return {
      spendTransaction,
      originationTransaction: {} as any,
      unforgedTransaction,
      airGapTx,
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
      airGapTx,
      rawTezosTx
    }
  }

  throw new Error('no supported operation')
}

const prepareOrigination = async (delegate?: string, amount?: BigNumber) => {
  const rawTezosTx = await tezosLib.originate(tezosProtocolSpec.wallet.publicKey, delegate, amount)
  return prepareTxHelper(rawTezosTx)
}

const prepareSpend = async (receivers: string[], amounts: BigNumber[], fee: BigNumber) => {
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

    it('will randomly convert zarith to bignum back and forth', async () => {
      const numberToConvert = new BigNumber(Math.round(Math.random() * 1000000))
      const zarithString = tezosLib.bigNumberToZarith(numberToConvert)
      const resultConversion = tezosLib.zarithToBigNumber(zarithString)
      expect(numberToConvert.toFixed()).to.equal(resultConversion.toFixed())
    })

    it('will iteratively convert multiple zariths to bignum', async () => {
      let hexString = 'f44e0af44e00b960' // contains: fee, counter, gas_limit, storage_limit and amount

      const results: BigNumber[] = []
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
      const hexString =
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
      const result = await prepareSpend(
        ['KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'],
        [new BigNumber(100000)], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
        new BigNumber(1420)
      )

      expect(result.spendTransaction.storage_limit).to.equal('0') // kt addresses do not need to get funed, they are originated :)
      expect(result.airGapTx.amount.toFixed()).to.equal('100000')
      expect(result.airGapTx.fee.toFixed()).to.equal('1420')
      expect(result.rawTezosTx.binaryTransaction).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37bc5000a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
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
    const sendFee = new BigNumber('1400')
    const revealFee = new BigNumber('1300')
    const initializationFee = new BigNumber('257000')
    const originationBurn = new BigNumber('257000')
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
        const amount = new BigNumber(900000)
        const fee = new BigNumber(100000)
        const result = await prepareSpend(
          [address],
          [amount], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          fee
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('300')

        expect(result.airGapTx.amount.toFixed()).to.equal('643000') // 900000 - 257000 amount - initializationFee
        expect(result.airGapTx.amount.toFixed()).to.equal(amount.minus(initializationFee).toFixed())

        expect(result.airGapTx.fee.toFixed()).to.equal('100000')
        expect(result.airGapTx.fee.toFixed()).to.equal(fee.toFixed())
      })

      it('will not deduct fee if enough funds are available on the account', async () => {
        const result = await prepareSpend(
          ['tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'],
          [new BigNumber(100000)], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          new BigNumber(100000)
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('300')

        expect(result.airGapTx.amount.toFixed()).to.equal('100000') // amount should be correct
        expect(result.airGapTx.fee.toFixed()).to.equal('100000')
      })

      it('will not mess with anything, given the receiving account has balance already', async () => {
        const result = await prepareSpend(
          ['tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'],
          [new BigNumber(899999)], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          new BigNumber(100000)
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('0')

        expect(result.airGapTx.amount.toFixed()).to.equal('899999') // amount should be correct
        expect(result.airGapTx.fee.toFixed()).to.equal('100000')
      })

      it('will leave 1 mutez behind if we try to send the full balance', async () => {
        const result = await prepareSpend(
          ['tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'],
          [new BigNumber(900000)], // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          new BigNumber(100000)
        )
        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('0')

        expect(result.airGapTx.amount.toFixed()).to.equal('899999') // amount should be 1 less
        expect(result.airGapTx.fee.toFixed()).to.equal('100000')
      })
    })

    ///////////////////////////
    // ORIGINATION
    ///////////////////////////

    describe('Origination', () => {
      it('should be able to forge and unforge an origination TX', async () => {
        const tz = await tezosLib.originate(tezosProtocolSpec.wallet.publicKey)
        expect(tz.binaryTransaction).to.equal(
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95509000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d3317600ffff0000'
        )

        const tezosWrappedOperation = tezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
        const tezosOriginationOperation = tezosWrappedOperation.contents[0] as TezosOriginationOperation

        expect(tezosOriginationOperation.kind, 'kind').to.equal(TezosOperationType.ORIGINATION)
        expect(tezosOriginationOperation.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
        expect(tezosOriginationOperation.fee, 'fee').to.equal('1400')
        expect(tezosOriginationOperation.counter, 'counter').to.equal('917316')
        expect(tezosOriginationOperation.gas_limit, 'gas_limit').to.equal('10000')
        expect(tezosOriginationOperation.storage_limit, 'storage_limit').to.equal('257')
        expect(tezosOriginationOperation.balance, 'balance').to.equal('0')
        expect(tezosOriginationOperation.delegate, 'delegate').to.be.undefined
      })

      it('should send all funds in origination operation if delegate is set', async () => {
        const delegate = 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'
        const balance = new BigNumber(1000000)
        const tz = await tezosLib.originate(tezosProtocolSpec.wallet.publicKey, delegate)

        expect(tz.binaryTransaction).to.equal(
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95509000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d33176dfa12dffffff0012548f71994cb2ce18072d0dcb568fe35fb7493000'
        )

        const tezosWrappedOperation = tezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
        const tezosOriginationOperation = tezosWrappedOperation.contents[0] as TezosOriginationOperation

        expect(tezosOriginationOperation.kind, 'kind').to.equal(TezosOperationType.ORIGINATION)
        expect(tezosOriginationOperation.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
        expect(tezosOriginationOperation.fee, 'fee').to.equal('1400')
        expect(tezosOriginationOperation.counter, 'counter').to.equal('917316')
        expect(tezosOriginationOperation.gas_limit, 'gas_limit').to.equal('10000')
        expect(tezosOriginationOperation.storage_limit, 'storage_limit').to.equal('257')
        expect(tezosOriginationOperation.balance, 'balance').to.equal(
          balance
            .minus(1400)
            .minus(257000)
            .minus(1)
            .toFixed()
        )
        expect(tezosOriginationOperation.balance, 'balance').to.equal(new BigNumber('741599').toFixed())
        expect(tezosOriginationOperation.delegate, 'delegate').to.equal(delegate)
      })

      it('should send defined amount in origination operation if delegate and amount are set', async () => {
        const delegate = 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'
        const amount = new BigNumber(200000)
        const tz = await tezosLib.originate(tezosProtocolSpec.wallet.publicKey, delegate, amount)
        expect(tz.binaryTransaction).to.equal(
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95509000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d33176c09a0cffffff0012548f71994cb2ce18072d0dcb568fe35fb7493000'
        )

        const tezosWrappedOperation = tezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
        const tezosOriginationOperation = tezosWrappedOperation.contents[0] as TezosOriginationOperation

        expect(tezosOriginationOperation.kind, 'kind').to.equal(TezosOperationType.ORIGINATION)
        expect(tezosOriginationOperation.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
        expect(tezosOriginationOperation.fee, 'fee').to.equal('1400')
        expect(tezosOriginationOperation.counter, 'counter').to.equal('917316')
        expect(tezosOriginationOperation.gas_limit, 'gas_limit').to.equal('10000')
        expect(tezosOriginationOperation.storage_limit, 'storage_limit').to.equal('257')
        expect(tezosOriginationOperation.balance, 'balance').to.equal(amount.toFixed())
        expect(tezosOriginationOperation.delegate, 'delegate').to.equal(delegate)
      })

      it('should send specified amount in origination operation if delegate is not set and amount is set', async () => {
        const amount = new BigNumber(200000)
        const tz = await tezosLib.originate(tezosProtocolSpec.wallet.publicKey, undefined, amount)
        /*
        expect(tz.binaryTransaction).to.equal(
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95509000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d33176c09a0cffffff0012548f71994cb2ce18072d0dcb568fe35fb7493000'
        )
*/
        const tezosWrappedOperation = tezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
        const tezosOriginationOperation = tezosWrappedOperation.contents[0] as TezosOriginationOperation

        expect(tezosOriginationOperation.kind, 'kind').to.equal(TezosOperationType.ORIGINATION)
        expect(tezosOriginationOperation.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
        expect(tezosOriginationOperation.fee, 'fee').to.equal('1400')
        expect(tezosOriginationOperation.counter, 'counter').to.equal('917316')
        expect(tezosOriginationOperation.gas_limit, 'gas_limit').to.equal('10000')
        expect(tezosOriginationOperation.storage_limit, 'storage_limit').to.equal('257')
        expect(tezosOriginationOperation.balance, 'balance').to.equal(amount.toFixed())
        expect(tezosOriginationOperation.delegate, 'delegate').to.be.undefined
      })

      it('should send 0 amount in origination operation if delegate and amount are not set', async () => {
        const amount = new BigNumber(0)
        const tz = await tezosLib.originate(tezosProtocolSpec.wallet.publicKey)
        /*
        expect(tz.binaryTransaction).to.equal(
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95509000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d33176c09a0cffffff0012548f71994cb2ce18072d0dcb568fe35fb7493000'
        )
*/
        const tezosWrappedOperation = tezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
        const tezosOriginationOperation = tezosWrappedOperation.contents[0] as TezosOriginationOperation

        expect(tezosOriginationOperation.kind, 'kind').to.equal(TezosOperationType.ORIGINATION)
        expect(tezosOriginationOperation.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
        expect(tezosOriginationOperation.fee, 'fee').to.equal('1400')
        expect(tezosOriginationOperation.counter, 'counter').to.equal('917316')
        expect(tezosOriginationOperation.gas_limit, 'gas_limit').to.equal('10000')
        expect(tezosOriginationOperation.storage_limit, 'storage_limit').to.equal('257')
        expect(tezosOriginationOperation.balance, 'balance').to.equal(amount.toFixed())
        expect(tezosOriginationOperation.delegate, 'delegate').to.be.undefined
      })

      it('will send 0 AMOUNT from USED ADDRESS and automatically subtract SPEND FEE, ORIGINATION BURN and 1', async () => {
        const address = 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'
        const amount = new BigNumber('0')

        const result = await prepareOrigination(address, amount)

        expect(result.originationTransaction.storage_limit).to.equal('257')

        expect(result.airGapTx.amount.toFixed()).to.equal('0')
        expect(result.airGapTx.amount.toFixed()).to.equal(amount.toFixed())

        expect(result.airGapTx.fee.toFixed()).to.equal('1400')
        expect(result.airGapTx.fee.toFixed()).to.equal(sendFee.toFixed())
      })

      it('will send 0 AMOUNT from UNUSED ADDRESS and automatically subtract SPEND FEE, REVEAL FEE, ORIGINATION BURN and 1', async () => {
        stub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
          .returns(Promise.resolve({ data: {} }))

        const address = 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'
        const amount = new BigNumber('0')

        const result = await prepareOrigination(address, amount)

        expect(result.originationTransaction.storage_limit).to.equal('257')

        expect(result.airGapTx.amount.toFixed()).to.equal('0')
        expect(result.airGapTx.amount.toFixed()).to.equal(amount.toFixed())

        expect(result.airGapTx.fee.toFixed()).to.equal('1400')
        expect(result.airGapTx.fee.toFixed()).to.equal(sendFee.toFixed())
      })

      it('will send SPECIFIC AMOUNT from USED ADDRESS and automatically subtract SPEND FEE, ORIGINATION BURN and 1', async () => {
        const address = 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'
        const balance = new BigNumber('1000000')
        const amount = new BigNumber('900000')

        const result = await prepareOrigination(address, amount)

        // check that storage is properly set
        expect(result.originationTransaction.storage_limit).to.equal('257')

        expect(result.airGapTx.amount.toFixed()).to.equal('741599') // 1000000 (balance) - 257000 (origination burn) - 1400 (fee) - 1 (min amount)
        expect(result.airGapTx.amount.toFixed()).to.equal(
          balance
            .minus(originationBurn)
            .minus(sendFee)
            .minus(1)
            .toFixed()
        )

        expect(result.airGapTx.fee.toFixed()).to.equal('1400')
        expect(result.airGapTx.fee.toFixed()).to.equal(sendFee.toFixed())
      })

      it('will send SPECIFIC AMOUNT from UNUSED ADDRESS and automatically subtract SPEND FEE, REVEAL FEE, ORIGINATION BURN and 1', async () => {
        stub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
          .returns(Promise.resolve({ data: {} }))

        const address = 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'
        const balance = new BigNumber('1000000')
        const amount = new BigNumber('900000')

        const result = await prepareOrigination(address, amount)

        // check that storage is properly set
        expect(result.originationTransaction.storage_limit).to.equal('257')

        expect(result.airGapTx.amount.toFixed()).to.equal('740299') // 1000000 (balance) - 257000 (origination burn) - 1300 (reveal fee) - 1400 (fee) - 1 (min amount)
        expect(result.airGapTx.amount.toFixed()).to.equal(
          balance
            .minus(originationBurn)
            .minus(sendFee)
            .minus(revealFee)
            .minus(1)
            .toFixed()
        )

        expect(result.airGapTx.fee.toFixed()).to.equal('1400')
        expect(result.airGapTx.fee.toFixed()).to.equal(sendFee.toFixed())
      })

      it('will send MAX AMOUNT from USED ADDRESS and automatically subtract SPEND FEE, ORIGINATION BURN and 1', async () => {
        const address = 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'
        const balance = new BigNumber('1000000')

        const result = await prepareOrigination(address)

        // check that storage is properly set
        expect(result.originationTransaction.storage_limit).to.equal('257')

        expect(result.airGapTx.amount.toFixed()).to.equal('741599') // 1000000 (balance) - 257000 (origination burn) - 1400 (fee) - 1 (min amount)
        expect(result.airGapTx.amount.toFixed()).to.equal(
          balance
            .minus(originationBurn)
            .minus(sendFee)
            .minus(1)
            .toFixed()
        )

        expect(result.airGapTx.fee.toFixed()).to.equal('1400')
        expect(result.airGapTx.fee.toFixed()).to.equal(sendFee.toFixed())
      })

      it('will send MAX AMOUNT from UNUSED ADDRESS and automatically subtract SPEND FEE, REVEAL FEE, ORIGINATION BURN and 1', async () => {
        stub
          .withArgs(`${tezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
          .returns(Promise.resolve({ data: {} }))

        const address = 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S'
        const balance = new BigNumber('1000000')

        const result = await prepareOrigination(address)

        // check that storage is properly set
        expect(result.originationTransaction.storage_limit).to.equal('257')

        expect(result.airGapTx.amount.toFixed()).to.equal('740299') // 1000000 (balance) - 257000 (origination burn) - 1300 (reveal fee) - 1400 (fee) - 1 (min amount)
        expect(result.airGapTx.amount.toFixed()).to.equal(
          balance
            .minus(originationBurn)
            .minus(sendFee)
            .minus(revealFee)
            .minus(1)
            .toFixed()
        )

        expect(result.airGapTx.fee.toFixed()).to.equal('1400')
        expect(result.airGapTx.fee.toFixed()).to.equal(sendFee.toFixed())
      })
    })
  })
})
