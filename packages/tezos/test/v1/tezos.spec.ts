// tslint:disable: no-object-literal-type-assertion
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapTransaction, isAmount, newAmount, ProtocolNetwork } from '@airgap/module-kit'
import { expect } from 'chai'
import 'mocha'
import * as sinon from 'sinon'

import {
  TezosOperation,
  TezosOperationType,
  TezosOriginationOperation,
  TezosProtocol,
  TezosRevealOperation,
  TezosSignedTransaction,
  TezosTransactionOperation,
  TezosUnits,
  TezosUnsignedTransaction,
  TezosWrappedOperation
} from '../../src/v1'

import { TezosTestProtocolSpec } from './specs/tezos'
import { TezosProtocolStub } from './stubs/tezos.stub'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const tezosLib = tezosProtocolSpec.lib

const prepareTxHelper = async (unsignedTx: TezosUnsignedTransaction, protocol: TezosProtocol = tezosLib) => {
  const airGapTxs = await protocol.getDetailsFromTransaction(unsignedTx, tezosProtocolSpec.wallet.publicKey)

  const unforgedTransaction = await protocol.unforgeOperation(unsignedTx.binary, 'unsigned')

  const spendOperation = unforgedTransaction.contents.find((content) => content.kind === TezosOperationType.TRANSACTION)
  if (spendOperation) {
    const spendTransaction: TezosTransactionOperation = spendOperation as TezosTransactionOperation

    return {
      spendTransaction,
      originationTransaction: {} as any,
      unforgedTransaction,
      airGapTxs,
      unsignedTx
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
      unsignedTx
    }
  }

  throw new Error('no supported operation')
}

const prepareSpend = async (details: { to: string; amount: string }[], fee: string) => {
  const rawTezosTx = await tezosLib.prepareTransactionWithPublicKey(
    tezosProtocolSpec.wallet.publicKey,
    details.map(({ to, amount }) => ({ to, amount: newAmount(amount, 'blockchain') })),
    { fee: newAmount(fee, 'blockchain') }
  )

  return prepareTxHelper(rawTezosTx)
}

describe(`TezosProtocol - Custom Tests`, () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('TX Lists', () => {
    let getStub

    beforeEach(async () => {
      const res = await new TezosProtocolStub().registerStub(new TezosTestProtocolSpec())
      getStub = res.getStub
    })

    it('will parse various operations', async () => {
      const hexString =
        'a732d3520eeaa3de98d78e5e5cb6c85f72204fd46feb9f76853841d4a701add36c0008ba0cb2fad622697145cf1665124096d25bc31ef44e0af44e00b960000008ba0cb2fad622697145cf1665124096d25bc31e006c0008ba0cb2fad622697145cf1665124096d25bc31ed3e7bd1008d3bb0300b1a803000008ba0cb2fad622697145cf1665124096d25bc31e00' // contains: fee, counter, gas_limit, storage_limit and amount

      /*
      { "branch":"BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk",
        "contents":[
          {
            "kind":"transaction",
            "fee":"10100",
            "gas_limit":"10100",
            "storage_limit": "0",
            "amount":"12345",
            "counter":"10",
            "destination":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA",
            "source":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA"
          },
          {
            "kind":"transaction",
            "fee":"34567123",
            "gas_limit":"56787",
            "storage_limit": "0",
            "amount":"54321",
            "counter":"8",
            "destination":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA",
            "source":"tz1LSAycAVcNdYnXCy18bwVksXci8gUC2YpA"
          }
        ]
      }
      */

      let tezosWrappedOperation: TezosWrappedOperation = await tezosLib.unforgeOperation(hexString)

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
      {
        "branch": "BLyvCRkxuTXkx1KeGvrcEXiPYj4p1tFxzvFDhoHE7SFKtmP1rbk",
        "contents": [
          {
            "kind": "reveal",
            "fee": "7866",
            "gas_limit": "3984",
            "storage_limit": "9",
            "counter": "13",
            "public_key": "edpkvCq9fHmAukBpFurMwR7YVukezNW7GCdQop3PJsGCo62t5MDeNw",
            "source": "tz1i6q8g1dcUha9PkKYpt3NtaXiQDLdLPSVn"
          },
          {
            "kind": "transaction",
            "fee": "56723",
            "gas_limit": "9875",
            "storage_limit": "2342356",
            "amount": "67846",
            "counter": "87988",
            "destination": "KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy",
            "source": "tz1KtGwriE7VuLwT3LwuvU9Nv4wAxP7XZ57d"
          },
          {
            "kind": "transaction",
            "fee": "31656123",
            "gas_limit": "6780893",
            "storage_limit": "0",
            "amount": "67867",
            "counter": "23423856",
            "destination": "KT1J5mFAxxzAYDLjYeVXkLcyEzNGRZ3kuFGq",
            "source": "tz1dBVokTuhh5UXtKxaVqmiUyhqoQhu71BmS"
          }
        ]
      }
      */
      const hexBigOperationTransaction =
        'a732d3520eeaa3de98d78e5e5cb6c85f72204fd46feb9f76853841d4a701add36b00f6645951a38c13586cda1edb9bdbebcf34a50773ba3d0d901f0900cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a2346c0002b1b8e2338ea7bf67ef23ff1277cbc7d4b6842493bb03b4af05934dd4fb8e0186920401ba4e7349ac25dc5eb2df5a43fceacc58963df4f500006c00c06daac32b63628ff2ed4b75ade88132cbef78d5bb918c0ff0d6950bddef9d03009b9204016834ed66e95b00e7aeeab2778d7c6b5a571171550000'

      tezosWrappedOperation = await tezosLib.unforgeOperation(hexBigOperationTransaction)
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

    it('can give a list of transactions from indexer API', async () => {
      const protocolNetwork = await tezosLib.getNetwork()

      getStub
        .withArgs(
          `${protocolNetwork.indexer.apiUrl}/v1/accounts/${tezosProtocolSpec.wallet.addresses[0]}/operations?type=transaction&limit=20`
        )
        .returns(
          Promise.resolve({
            data: [
              {
                type: 'transaction',
                id: 53053483,
                level: 1484998,
                timestamp: '2021-05-24T06:21:18Z',
                block: 'BMNYPofzKU7JGq5HCqGz5XfqobGc6d7uPUcdzAn83Mx93F1qvM6',
                hash: 'ooSLLkH5KoCbVdrS7HwDNRRSxr3e6ZM7FZi2JDuPca1PnU568sD',
                counter: 917359,
                sender: {
                  address: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
                },
                gasLimit: 1507,
                gasUsed: 1427,
                storageLimit: 0,
                storageUsed: 0,
                bakerFee: 413,
                storageFee: 0,
                allocationFee: 0,
                target: {
                  address: 'tz1M4axJezHXX5my1uQEXYXmeVPp5vXnK8bH'
                },
                amount: 5000,
                status: 'applied',
                hasInternals: false
              }
            ]
          })
        )
      const transactions = (await tezosLib.getTransactionsForAddress(tezosProtocolSpec.wallet.addresses[0], 20)).transactions

      expect(transactions.map((transaction) => ({ ...JSON.parse(JSON.stringify(transaction)), network: undefined }))).to.deep.eq([
        {
          amount: newAmount<TezosUnits>('5000', 'blockchain').toJSON(),
          fee: newAmount<TezosUnits>('413', 'blockchain').toJSON(),
          from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
          isInbound: false,
          network: (undefined as any) as ProtocolNetwork,
          timestamp: new Date('2021-05-24T06:21:18Z').getTime() / 1000,
          to: ['tz1M4axJezHXX5my1uQEXYXmeVPp5vXnK8bH'],
          status: {
            type: 'applied',
            hash: 'ooSLLkH5KoCbVdrS7HwDNRRSxr3e6ZM7FZi2JDuPca1PnU568sD',
            block: '1484998'
          }
        } as AirGapTransaction<TezosUnits>
      ])
    })
  })

  describe('KT1 Prepare/Sign', () => {
    let getStub
    let postStub

    beforeEach(async () => {
      const protocolNetwork = await tezosLib.getNetwork()

      const res = await new TezosProtocolStub().registerStub(new TezosTestProtocolSpec())
      getStub = res.getStub
      postStub = res.postStub

      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/counter`)
        .returns(Promise.resolve({ data: 917326 }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
        .returns(Promise.resolve({ data: 'BMT1dwxYkLbssY34irU2LbSHEAYBZ3KfqtYCixaZoMoaarhx3Ko' }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/balance`)
        .returns(Promise.resolve({ data: 100000000 }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
        .returns(Promise.resolve({ data: { key: 'test-key' } }))
    })

    it('will properly prepare a TX to a KT1 address', async () => {
      const protocolNetwork = await tezosLib.getNetwork()

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
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
                    consumed_milligas: '15385000',
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
        [
          // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
          { to: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', amount: '100000' }
        ],
        '1420'
      )

      expect(result.spendTransaction.storage_limit).to.equal('0') // kt addresses do not need to get funed, they are originated :)
      expect(result.airGapTxs.length).to.equal(1)
      expect(result.airGapTxs[0].amount.value).to.equal('100000')
      expect(result.airGapTxs[0].amount.unit).to.equal('blockchain')
      expect(result.airGapTxs[0].fee.value).to.equal('1420')
      expect(result.airGapTxs[0].fee.unit).to.equal('blockchain')
      expect(result.unsignedTx.binary).to.equal(
        'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a36c0091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37997800a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
      )
    })

    it('will properly sign a TX to a KT1 address', async () => {
      const signedTezosTx = await tezosLib.signTransactionWithSecretKey(
        {
          type: 'unsigned',
          binary:
            'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44eac02a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000'
        },
        tezosProtocolSpec.wallet.secretKey
      )

      expect(signedTezosTx).to.deep.equal({
        type: 'signed',
        binary:
          'e4b7e31c04d23e3a10ea20e11bd0ebb4bde16f632c1d94779fd5849a34ec42a308000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bcffe37f44eac02a08d0601ba4e7349ac25dc5eb2df5a43fceacc58963df4f50000a39862b8a5a80ae96f1040c999f9075ba7490d9206ec6443b06d2df3442d6cf09ea264daa09164622b7cb565d8ba37a02c9de7fd04ae50a78f531136cfd9b00e'
      } as TezosSignedTransaction)
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
      const protocolNetwork = await tezosLib.getNetwork()

      sinon.restore()

      const res = await new TezosProtocolStub().registerStub(new TezosTestProtocolSpec())
      getStub = res.getStub
      postStub = res.postStub

      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/counter`)
        .returns(Promise.resolve({ data: 917315 }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
        .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/balance`)
        .returns(Promise.resolve({ data: 1000000 }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S/balance`)
        .returns(Promise.resolve({ data: 0 }))
      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7/balance`)
        .returns(Promise.resolve({ data: 0.1 }))
      getStub
        .withArgs(
          `${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${tezosProtocolSpec.wallet.addresses[0]}/manager_key`
        )
        .returns(Promise.resolve({ data: { key: 'test-key' } }))
    })

    describe('Spend', () => {
      it('will deduct fee to initialize empty tz1 receiving address, if amount + fee === balance', async () => {
        const protocolNetwork = await tezosLib.getNetwork()

        postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
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
                      consumed_milligas: '10300000',
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
          [
            // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
            { to: address, amount }
          ],
          fee
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('300')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount.value).to.equal(new BigNumber(amount).minus(initializationFee).toFixed())
        expect(result.airGapTxs[0].amount.unit).to.equal('blockchain')

        expect(result.airGapTxs[0].fee.value).to.equal(fee)
        expect(result.airGapTxs[0].fee.unit).to.equal('blockchain')
      })

      it('will not deduct fee if enough funds are available on the account', async () => {
        const protocolNetwork = await tezosLib.getNetwork()

        postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
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
                      consumed_milligas: '10300000',
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
          [
            // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
            { to: 'tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S', amount: '100000' }
          ],
          '100000'
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('300')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount.value).to.equal('100000') // amount should be correct
        expect(result.airGapTxs[0].amount.unit).to.equal('blockchain') // amount should be correct
        expect(result.airGapTxs[0].fee.value).to.equal('100000')
        expect(result.airGapTxs[0].fee.unit).to.equal('blockchain')
      })

      it('will correctly calculate the max transaction value for both revealed and unrevealed accounts', async () => {
        const protocolNetwork = await tezosLib.getNetwork()

        const address = tezosProtocolSpec.wallet.addresses[0]
        const configs = [tezosProtocolSpec.revealedAddressConfig, tezosProtocolSpec.unrevealedAddressConfig]

        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/counter`)
          .returns(Promise.resolve({ data: '10147076' }))
        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
          .returns(Promise.resolve({ data: 'BLKAx9imSqD5t1qyu3K1cuZwVzddZRjuHpa8w94fh1aUmPgMohM' }))

        for (let config of configs) {
          getStub
            .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/balance`)
            .returns(Promise.resolve({ data: config.balance }))
          getStub
            .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
            .returns(Promise.resolve({ data: config.manager_key }))
          postStub
            .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`)
            .returns(Promise.resolve({ data: config.run_operation }))

          const estimatedFee = await tezosLib.getTransactionFeeWithPublicKey(tezosProtocolSpec.wallet.publicKey, [
            { to: config.toAddress, amount: newAmount(config.balance, 'blockchain') }
          ])

          // in case the account is unrevealed, maxFee includes the revealFee of 1300
          const maxFee = new BigNumber(isAmount(estimatedFee) ? estimatedFee.value : estimatedFee.medium.value).toNumber()
          const maxTransfer = await tezosLib.getTransactionMaxAmountWithPublicKey(tezosProtocolSpec.wallet.publicKey, [config.toAddress])

          expect(new BigNumber(maxTransfer.value).toNumber()).to.equal(new BigNumber(config.balance - maxFee - 1).toNumber())
        }
      })

      // TODO: create an issue
      it.skip('will correctly prepare operations for an unrevealed address', async () => {
        const protocolNetwork = await tezosLib.getNetwork()

        const address = tezosProtocolSpec.wallet.addresses[0]

        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/counter`)
          .returns(Promise.resolve({ data: '10147076' }))
        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
          .returns(Promise.resolve({ data: 'BLKAx9imSqD5t1qyu3K1cuZwVzddZRjuHpa8w94fh1aUmPgMohM' }))
        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/balance`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.unrevealedAddressConfig.balance }))
        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.unrevealedAddressConfig.manager_key }))
        postStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`)
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
        const protocolNetwork = await tezosLib.getNetwork()

        const address = tezosProtocolSpec.wallet.addresses[0]

        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/counter`)
          .returns(Promise.resolve({ data: '10147076' }))
        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
          .returns(Promise.resolve({ data: 'BLKAx9imSqD5t1qyu3K1cuZwVzddZRjuHpa8w94fh1aUmPgMohM' }))
        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/balance`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.revealedAddressConfig.balance }))
        getStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
          .returns(Promise.resolve({ data: tezosProtocolSpec.revealedAddressConfig.manager_key }))
        postStub
          .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`)
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
          [
            // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
            { to: 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7', amount: '899999' }
          ],
          '100000'
        )

        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('0')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount.value).to.equal('899999') // amount should be correct
        expect(result.airGapTxs[0].amount.unit).to.equal('blockchain') // amount should be correct
        expect(result.airGapTxs[0].fee.value).to.equal('100000')
        expect(result.airGapTxs[0].fee.unit).to.equal('blockchain')
      })

      it('will leave 1 mutez behind if we try to send the full balance', async () => {
        const result = await prepareSpend(
          [
            // send so much funds that it should deduct, given it is a 0-balance receiver (which it is not)
            { to: 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7', amount: '900000' }
          ],
          '100000'
        )
        // check that storage is properly set
        expect(result.spendTransaction.storage_limit).to.equal('0')

        expect(result.airGapTxs.length).to.equal(1)

        expect(result.airGapTxs[0].amount.value).to.equal('899999') // amount should be 1 less
        expect(result.airGapTxs[0].amount.unit).to.equal('blockchain') // amount should be 1 less
        expect(result.airGapTxs[0].fee.value).to.equal('100000')
        expect(result.airGapTxs[0].fee.unit).to.equal('blockchain')
      })
    })

    it('will prepare a transaction with multiple spend operations to KT addresses', async () => {
      const protocolNetwork = await tezosLib.getNetwork()

      getStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
        .returns(Promise.resolve({ data: 0 }))

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_milligas: '10300000',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [txRunOperation, txRunOperation],
            signature: ''
          }
        })
      )

      const result = await prepareSpend(
        [
          { to: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', amount: '12345' },
          { to: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', amount: '54321' }
        ],
        '111'
      )

      // check that storage is properly set
      expect(result.spendTransaction.gas_limit).to.equal('10300')
      expect(result.spendTransaction.storage_limit).to.equal('0')

      expect(result.airGapTxs.length).to.equal(2)

      expect(result.airGapTxs[0].amount.value).to.equal('12345')
      expect(result.airGapTxs[0].amount.unit).to.equal('blockchain')
      expect(result.airGapTxs[0].fee.value).to.equal('111')
      expect(result.airGapTxs[0].fee.unit).to.equal('blockchain')

      expect(result.airGapTxs[1].amount.value).to.equal('54321')
      expect(result.airGapTxs[1].amount.unit).to.equal('blockchain')
      expect(result.airGapTxs[1].fee.value).to.equal('111')
      expect(result.airGapTxs[1].fee.unit).to.equal('blockchain')
    })

    it('will correctly prepare a single operation group if below the threshold', async () => {
      const protocolNetwork = await tezosLib.getNetwork()

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_milligas: '10300000',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      const numberOfOperations: number = 50

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [...Array(numberOfOperations)].map((x) => txRunOperation),
            signature: ''
          }
        })
      )

      const result = await prepareSpend(
        [...Array(numberOfOperations)].map((v, i) => ({ to: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', amount: i.toString() })),
        '1'
      )
      expect(result.airGapTxs.length).to.equal(50)
    })

    it('will throw an error if number of operations is above the threshold for a single operation group', async () => {
      const protocolNetwork = await tezosLib.getNetwork()

      const numberOfOperations: number = 51

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_milligas: '10300000',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [...Array(numberOfOperations)].map((x) => txRunOperation),
            signature: ''
          }
        })
      )

      return prepareSpend(
        [...Array(numberOfOperations)].map((v, i) => ({ to: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', amount: i.toString() })),
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
      const protocolNetwork = await tezosLib.getNetwork()

      const numberOfOperations: number = 50

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_milligas: '10300000',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [...Array(numberOfOperations)].map((x) => txRunOperation),
            signature: ''
          }
        })
      )

      const transactions = await tezosLib.prepareTransactionsWithPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        [...Array(numberOfOperations)].map((x, i) => ({ to: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy', amount: newAmount(i, 'blockchain') })),
        { fee: newAmount(1, 'blockchain') }
      )

      expect(transactions.length).to.equal(1)

      const result1 = await prepareTxHelper(transactions[0])

      expect(result1.airGapTxs.length).to.equal(50)
    })

    it('will return 2 operation groups when calling prepareTransactionsFromPublicKey with a number of operations above the threshold', async () => {
      const protocolNetwork = await tezosLib.getNetwork()

      const numberOfOperations: number = 215

      const txRunOperation = {
        kind: 'transaction',
        metadata: {
          balance_updates: [],
          operation_result: {
            status: 'applied',
            balance_updates: [],
            consumed_milligas: '10300000',
            paid_storage_size_diff: '0'
          },
          internal_operation_results: []
        }
      }

      postStub
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`)
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
        .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`)
        .onCall(1)
        .returns(
          Promise.resolve({
            data: {
              contents: [...Array(15)].map((x) => txRunOperation),
              signature: ''
            }
          })
        )

      const transactions = await tezosLib.prepareTransactionsWithPublicKey(
        tezosProtocolSpec.wallet.publicKey,
        [...Array(numberOfOperations)].map((x, i) => ({ to: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ', amount: newAmount(i, 'blockchain') })),
        { fee: newAmount(1, 'blockchain') }
      )

      expect(transactions.length).to.equal(2)

      const result1 = await prepareTxHelper(transactions[0])
      const result2 = await prepareTxHelper(transactions[1])

      expect(result1.airGapTxs.length).to.equal(200)
      expect(result2.airGapTxs.length).to.equal(15)

      expect(result1.airGapTxs[0].amount.value, 'result1 first amount').to.equal('0')
      expect(result1.airGapTxs[0].amount.unit, 'result1 first amount').to.equal('blockchain')
      expect(result1.airGapTxs[0].fee.value, 'result1 first fee').to.equal('1')
      expect(result1.airGapTxs[0].fee.unit, 'result1 first fee').to.equal('blockchain')
      expect(result1.airGapTxs[0].json.counter, 'result1 first counter').to.equal('917316')

      expect(result1.airGapTxs[199].amount.value).to.equal('199')
      expect(result1.airGapTxs[199].amount.unit).to.equal('blockchain')
      expect(result1.airGapTxs[199].fee.value).to.equal('1')
      expect(result1.airGapTxs[199].fee.unit).to.equal('blockchain')
      expect(result1.airGapTxs[199].json.counter).to.equal('917515')

      expect(result2.airGapTxs[0].amount.value).to.equal('200')
      expect(result2.airGapTxs[0].amount.unit).to.equal('blockchain')
      expect(result2.airGapTxs[0].fee.value).to.equal('1')
      expect(result2.airGapTxs[0].fee.unit).to.equal('blockchain')
      expect(result2.airGapTxs[0].json.counter).to.equal('917516')
    })
  })

  describe('TransactionDetails', () => {
    it('correctly get transaction details from a forged, unsigned transaction', async () => {
      const forgedUnsignedTransaction: string =
        'e879f5c6312b85da97cbb3bcb14dd515f29b407a0cc08b70fbcdece5bb49d8b06e00bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc8c0bbe8139bc5000ff0012548f71994cb2ce18072d0dcb568fe35fb74930'

      const details: AirGapTransaction<TezosUnits>[] = await tezosLib.getDetailsFromTransaction(
        { type: 'unsigned', binary: forgedUnsignedTransaction },
        { type: 'pub', format: 'hex', value: '' }
      )

      expect(details[0].amount.value).to.equal('0')
      expect(details[0].amount.unit).to.equal('blockchain')
      expect(details[0].fee.value).to.equal('1420')
      expect(details[0].fee.unit).to.equal('blockchain')
      expect(details[0].from[0]).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(details[0].to[0]).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(details[0].json).to.deep.equal({
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
