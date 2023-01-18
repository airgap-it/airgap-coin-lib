// tslint:disable: no-object-literal-type-assertion
import { newAmount, newUnsignedTransaction } from '@airgap/module-kit'
import { expect } from 'chai'
import 'mocha'
import * as sinon from 'sinon'

import { TezosFAProtocol, TezosUnsignedTransaction } from '../../src/v1'
import { RunOperationMetadata } from '../../src/v1/types/node'

import { TestProtocolSpec } from './implementations'
import { TezosTestProtocolSpec } from './specs/tezos'
import { TezosFA1p2TestProtocolSpec } from './specs/tezos-fa1p2'
import { TezosFA2TestProtocolSpec } from './specs/tezos-fa2'

const tezosProtocol = new TezosTestProtocolSpec()

const fa1p2Protocol = new TezosFA1p2TestProtocolSpec()
const fa2Protocol = new TezosFA2TestProtocolSpec()

const prepareStubs = async (protocol: TestProtocolSpec<TezosFAProtocol>): Promise<{ getStub: any; postStub: any }> => {
  const protocolNetwork = await protocol.lib.getNetwork()

  const res = await protocol.stub.registerStub(protocol)
  const getStub = res.getStub
  const postStub = res.postStub

  getStub
    .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${protocol.wallet.addresses[0]}/counter`)
    .returns(Promise.resolve({ data: 917315 }))
  getStub
    .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
    .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
  getStub
    .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${protocol.wallet.addresses[0]}/balance`)
    .returns(Promise.resolve({ data: 1000000 }))
  getStub
    .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/tz1bgWdfd9YS7pTkNgZTNs26c33nBHwSYW6S/balance`)
    .returns(Promise.resolve({ data: 0 }))
  getStub
    .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7/balance`)
    .returns(Promise.resolve({ data: 0.1 }))
  getStub
    .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${protocol.wallet.addresses[0]}/manager_key`)
    .returns(Promise.resolve({ data: { key: 'test-key' } }))

  return { getStub, postStub }
}

describe(`TezosFAProtocol - Custom Tests`, () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('Transaction', () => {
    beforeEach(async () => {
      sinon.restore()
    })

    it('will get details from an FA 1.2 transaction', async () => {
      const protocolNetwork = await fa1p2Protocol.lib.getNetwork()

      const { getStub, postStub } = await prepareStubs(fa1p2Protocol)

      getStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/`).returns(
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
              consumed_milligas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )
      postStub
        .withArgs(
          `${
            protocolNetwork.rpcUrl
          }/chains/main/blocks/head/context/contracts/${await fa1p2Protocol.lib.getContractAddress()}/script/normalized`
        )
        .returns(
          Promise.resolve({
            data: {
              code: []
            }
          })
        )

      getStub
        .withArgs(
          `${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${await fa1p2Protocol.lib.getContractAddress()}/entrypoints`
        )
        .returns(
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
          consumed_milligas: '350000000'
        }
      }

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
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

      const transaction = await tezosProtocol.lib.prepareOperations(fa1p2Protocol.wallet.publicKey, incompleteTransaction)
      const forged = await tezosProtocol.lib.forgeOperation(transaction)

      const details = await fa1p2Protocol.lib.getDetailsFromTransaction(
        newUnsignedTransaction<TezosUnsignedTransaction>({ binary: forged }),
        fa1p2Protocol.wallet.publicKey
      )

      // check that storage is properly set
      // expect(result.spendTransaction.storage_limit).to.equal('0')

      expect(details.length).to.equal(2)

      const airGapTx = details[0]
      const airGapTx2 = details[1]

      expect(airGapTx.json.amount).to.equal('0')
      expect(airGapTx.json.fee).to.equal('35308')
      expect(airGapTx.json.gas_limit).to.equal('350000')
      expect(airGapTx.json.storage_limit).to.equal('0')
      expect(airGapTx.json.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.json.destination).to.equal('KT1LH2o12xVRwTpJMZ6QJG74Fox8gE9QieFd')
      expect(airGapTx.json.parameters).to.not.be.undefined
      expect(airGapTx.json.parameters.entrypoint).to.equal('transfer')
      expect(airGapTx.json.parameters.value.args[0].string).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(airGapTx.json.parameters.value.args[1].args[0].string).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(airGapTx.json.parameters.value.args[1].args[1].int).to.equal('10')

      expect(airGapTx2.json.gas_limit).to.equal('350000')

      expect(airGapTx.from.length).to.equal(1)
      expect(airGapTx.from[0]).to.equal('tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7')
      expect(airGapTx.to.length).to.equal(1)
      expect(airGapTx.to[0]).to.equal('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ')
      expect(airGapTx.amount.value).to.equal('10')
      expect(airGapTx.amount.unit).to.equal('blockchain')
      expect(airGapTx.fee.value).to.equal('35308')
      expect(airGapTx.fee.unit).to.equal('blockchain')
    })

    it('will prepare an FA2 transaction from public key', async () => {
      const protocolNetwork = await fa2Protocol.lib.getNetwork()

      const { getStub, postStub } = await prepareStubs(fa2Protocol)

      getStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/`).returns(
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
              consumed_milligas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      postStub
        .withArgs(
          `${
            protocolNetwork.rpcUrl
          }/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/script/normalized`
        )
        .returns(
          Promise.resolve({
            data: {
              code: []
            }
          })
        )

      getStub
        .withArgs(
          `${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/entrypoints`
        )
        .returns(
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
          consumed_milligas: '350000000'
        }
      }

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: await fa2Protocol.lib.getContractAddress(),
                metadata
              }
            ]
          }
        })
      )

      const transaction = await fa2Protocol.lib.prepareTransactionWithPublicKey(
        fa2Protocol.wallet.publicKey,
        [
          { to: 'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM', amount: newAmount(100, 'blockchain') },
          { to: 'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH', amount: newAmount(200, 'blockchain') }
        ],
        {
          fee: newAmount(500000, 'blockchain')
        }
      )

      const details = await fa2Protocol.lib.getDetailsFromTransaction(transaction, fa2Protocol.wallet.publicKey)
      const airGapTx = details[0]

      expect(airGapTx.json.amount).to.equal('0')
      expect(airGapTx.json.fee).to.equal('500000')
      expect(airGapTx.json.gas_limit).to.equal('350000')
      expect(airGapTx.json.storage_limit).to.equal('0')
      expect(airGapTx.json.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.json.destination).to.equal(await fa2Protocol.lib.getContractAddress())
      expect(airGapTx.json.parameters).to.not.be.undefined
      expect(airGapTx.json.parameters.entrypoint).to.equal('transfer')
      expect(airGapTx.json.parameters.value[0].args[0].string).to.equal(fa2Protocol.wallet.addresses[0])
      expect(airGapTx.json.parameters.value[0].args[1][0].args[0].string).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
      expect(airGapTx.json.parameters.value[0].args[1][0].args[1].args[0].int).to.equal('0')
      expect(airGapTx.json.parameters.value[0].args[1][0].args[1].args[1].int).to.equal('100')
      expect(airGapTx.json.parameters.value[0].args[1][1].args[0].string).to.equal('tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH')
      expect(airGapTx.json.parameters.value[0].args[1][1].args[1].args[0].int).to.equal('0')
      expect(airGapTx.json.parameters.value[0].args[1][1].args[1].args[1].int).to.equal('200')
    })

    it('will prepare an FA2 transfer transaction', async () => {
      const protocolNetwork = await fa2Protocol.lib.getNetwork()

      const { getStub, postStub } = await prepareStubs(fa2Protocol)

      getStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/`).returns(
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
              consumed_milligas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      postStub
        .withArgs(
          `${
            protocolNetwork.rpcUrl
          }/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/script/normalized`
        )
        .returns(
          Promise.resolve({
            data: {
              code: []
            }
          })
        )

      getStub
        .withArgs(
          `${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/entrypoints`
        )
        .returns(
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
          consumed_milligas: '350000000'
        }
      }

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: await fa2Protocol.lib.getContractAddress(),
                metadata
              }
            ]
          }
        })
      )

      const transaction = await fa2Protocol.lib.transfer(
        [
          {
            from: 'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM',
            txs: [
              {
                to: 'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH',
                amount: '100',
                tokenId: 10
              },
              {
                to: 'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt',
                amount: '110',
                tokenId: 11
              }
            ]
          },
          {
            from: 'tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM',
            txs: [
              {
                to: 'tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB',
                amount: '200',
                tokenId: 20
              }
            ]
          }
        ],
        newAmount(500000, 'blockchain'),
        fa2Protocol.wallet.publicKey
      )

      const details = await fa2Protocol.lib.getDetailsFromTransaction(transaction, fa2Protocol.wallet.publicKey)
      const airGapTx = details[0]

      expect(airGapTx.json.amount).to.equal('0')
      expect(airGapTx.json.fee).to.equal('500000')
      expect(airGapTx.json.gas_limit).to.equal('350000')
      expect(airGapTx.json.storage_limit).to.equal('0')
      expect(airGapTx.json.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.json.destination).to.equal(await fa2Protocol.lib.getContractAddress())
      expect(airGapTx.json.parameters).to.not.be.undefined
      expect(airGapTx.json.parameters.entrypoint).to.equal('transfer')
      expect(airGapTx.json.parameters.value[0].args[0].string).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
      expect(airGapTx.json.parameters.value[0].args[1][0].args[0].string).to.equal('tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH')
      expect(airGapTx.json.parameters.value[0].args[1][0].args[1].args[0].int).to.equal('10')
      expect(airGapTx.json.parameters.value[0].args[1][0].args[1].args[1].int).to.equal('100')
      expect(airGapTx.json.parameters.value[0].args[1][1].args[0].string).to.equal('tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt')
      expect(airGapTx.json.parameters.value[0].args[1][1].args[1].args[0].int).to.equal('11')
      expect(airGapTx.json.parameters.value[0].args[1][1].args[1].args[1].int).to.equal('110')
      expect(airGapTx.json.parameters.value[1].args[0].string).to.equal('tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM')
      expect(airGapTx.json.parameters.value[1].args[1][0].args[0].string).to.equal('tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB')
      expect(airGapTx.json.parameters.value[1].args[1][0].args[1].args[0].int).to.equal('20')
      expect(airGapTx.json.parameters.value[1].args[1][0].args[1].args[1].int).to.equal('200')
    })

    it('will prepare an FA2 update operators transaction', async () => {
      const protocolNetwork = await fa2Protocol.lib.getNetwork()

      const { getStub, postStub } = await prepareStubs(fa2Protocol)

      getStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/`).returns(
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
              consumed_milligas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      postStub
        .withArgs(
          `${
            protocolNetwork.rpcUrl
          }/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/script/normalized`
        )
        .returns(
          Promise.resolve({
            data: {
              code: []
            }
          })
        )

      getStub
        .withArgs(
          `${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/entrypoints`
        )
        .returns(
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
          consumed_milligas: '350000000'
        }
      }

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: await fa2Protocol.lib.getContractAddress(),
                metadata
              }
            ]
          }
        })
      )

      const transaction = await fa2Protocol.lib.updateOperators(
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
        newAmount(500000, 'blockchain'),
        fa2Protocol.wallet.publicKey
      )

      const details = await fa2Protocol.lib.getDetailsFromTransaction(transaction, fa2Protocol.wallet.publicKey)
      const airGapTx = details[0]

      expect(airGapTx.json.amount).to.equal('0')
      expect(airGapTx.json.fee).to.equal('500000')
      expect(airGapTx.json.gas_limit).to.equal('350000')
      expect(airGapTx.json.storage_limit).to.equal('0')
      expect(airGapTx.json.source).to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(airGapTx.json.destination).to.equal(await fa2Protocol.lib.getContractAddress())
      expect(airGapTx.json.parameters).to.not.be.undefined
      expect(airGapTx.json.parameters.entrypoint).to.equal('update_operators')
      expect(airGapTx.json.parameters.value[0].args[0].args[0].string).to.equal('tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM')
      expect(airGapTx.json.parameters.value[0].args[0].args[1].args[0].string).to.equal('tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH')
      expect(airGapTx.json.parameters.value[0].args[0].args[1].args[1].int).to.equal('0')
      expect(airGapTx.json.parameters.value[1].args[0].args[0].string).to.equal('tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt')
      expect(airGapTx.json.parameters.value[1].args[0].args[1].args[0].string).to.equal('tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM')
      expect(airGapTx.json.parameters.value[1].args[0].args[1].args[1].int).to.equal('1')
    })
  })

  describe('Balance', () => {
    beforeEach(async () => {
      sinon.restore()
    })

    it('will check FA2 balance', async () => {
      const protocolNetwork = await fa2Protocol.lib.getNetwork()

      const { getStub, postStub } = await prepareStubs(fa2Protocol)

      getStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/`).returns(
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
              consumed_milligas: '0',
              deactivated: [],
              balance_updates: []
            },
            operations: [[], [], [], []]
          }
        })
      )

      postStub
        .withArgs(
          `${
            protocolNetwork.rpcUrl
          }/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/script/normalized`
        )
        .returns(
          Promise.resolve({
            data: {
              code: []
            }
          })
        )

      getStub
        .withArgs(
          `${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${await fa2Protocol.lib.getContractAddress()}/entrypoints`
        )
        .returns(
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
          consumed_milligas: '350000000'
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

      postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
        Promise.resolve({
          data: {
            contents: [
              {
                kind: 'transaction',
                amount: '0',
                fee: '35308',
                storage_limit: '60000',
                destination: await fa2Protocol.lib.getContractAddress(),
                metadata
              }
            ]
          }
        })
      )

      const source = 'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt'
      getStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${source}/counter`).returns(
        Promise.resolve({
          data: 0
        })
      )

      const balanceResults = await fa2Protocol.lib.balanceOf(
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
  })
})
