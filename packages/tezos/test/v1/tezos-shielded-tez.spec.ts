import { AddressWithCursor, AirGapTransactionsWithCursor, Amount, Balance, KeyPair, newAmount, PublicKey } from '@airgap/module-kit'
import { expect } from 'chai'
import { it } from 'mocha'
import * as sinon from 'sinon'

import { TezosOperationType, TezosUnits } from '../../src/v1'
import { TezosContractCall } from '../../src/v1/contract/TezosContractCall'
import { TezosSaplingAddressCursor } from '../../src/v1/types/address'
import { TezosTransactionOperation, TezosTransactionParameters } from '../../src/v1/types/operations/kinds/Transaction'
import { TezosSaplingTransactionCursor, TezosUnsignedTransaction } from '../../src/v1/types/transaction'

import { TezosShieldedTezTestProtocolSpec } from './specs/tezos-shielded-tez'

const protocol: TezosShieldedTezTestProtocolSpec = new TezosShieldedTezTestProtocolSpec()

describe('TezosShieldedTezProtocol - Custom Tests', () => {
  beforeEach(() => {
    protocol.stub.registerStub(protocol)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('Account', () => {
    it('should create a key pair from the mnemonic', async () => {
      const { secretKey, publicKey }: KeyPair = await protocol.lib.getKeyPairFromSecret(
        { type: 'mnemonic', value: protocol.mnemonic() },
        'm/'
      )

      expect(secretKey).to.deep.equal(protocol.wallet.secretKey)
      expect(publicKey).to.deep.equal(protocol.wallet.publicKey)
    })

    it('should create a key pair from the hex secret', async () => {
      const { secretKey, publicKey }: KeyPair = await protocol.lib.getKeyPairFromSecret({ type: 'hex', value: protocol.seed() }, 'm/')

      expect(secretKey).to.deep.equal(protocol.wallet.secretKey)
      expect(publicKey).to.deep.equal(protocol.wallet.publicKey)
    })

    it('should get an address from the public key', async () => {
      const address: AddressWithCursor<TezosSaplingAddressCursor> = await protocol.lib.getAddressFromPublicKey(protocol.wallet.publicKey)

      expect(address.address).to.equal('zet12mVvzJ4QJhnNQetGHzdwTMcLgNrdC4SFact6BB5jpeqGAefWip3iGgEjvDA9z7b9Y')
    })

    it('should get an address from the viewing key and index', async () => {
      const address: AddressWithCursor<TezosSaplingAddressCursor> = await protocol.lib.getAddressFromViewingKey(
        protocol.wallet.publicKey,
        '03'
      )

      expect(address.address).to.equal('zet12apvDmVPFfhuhNqzPrnLprQCZ4QADfid3AVgqwXLacyqHoirLYN81kd3Jn2e75Bcv')
    })

    it('should get the next valid address from the public key', async () => {
      const defaultAddress: AddressWithCursor<TezosSaplingAddressCursor> = await protocol.lib.getAddressFromPublicKey(
        protocol.wallet.publicKey
      )
      const nextAddress: AddressWithCursor<TezosSaplingAddressCursor> | undefined = await protocol.lib.getNextAddressFromPublicKey(
        protocol.wallet.publicKey,
        defaultAddress.cursor
      )

      expect(nextAddress?.address).to.equal('zet12apvDmVPFfhuhNqzPrnLprQCZ4QADfid3AVgqwXLacyqHoirLYN81kd3Jn2e75Bcv')
    })

    it('should get transactions from the public key', async () => {
      const protocolNetwork = await protocol.lib.getNetwork()

      const transactions: AirGapTransactionsWithCursor<TezosSaplingTransactionCursor> = JSON.parse(
        JSON.stringify(await protocol.lib.getTransactionsForPublicKey(protocol.wallet.publicKey, 10))
      )

      expect(transactions.transactions).to.deep.equal([
        {
          from: ['Shielded Pool'],
          to: [protocol.wallet.addresses[0]],
          isInbound: true,
          amount: {
            value: '1000000',
            unit: 'blockchain'
          },
          fee: {
            value: '0',
            unit: 'blockchain'
          },
          network: protocolNetwork
        },
        {
          from: [protocol.wallet.addresses[0]],
          to: ['zet13hr5yGeiB1QiHb7nhAw6rfUDpNZJV4hQTKXYethppFs5EcXeEC2ZqNSEHkYEYo52x'],
          isInbound: false,
          amount: {
            value: '200000',
            unit: 'blockchain'
          },
          fee: {
            value: '0',
            unit: 'blockchain'
          },
          network: protocolNetwork
        }
      ])
    })

    it('should get the balance of the account', async () => {
      const balance: Balance<TezosUnits> = await protocol.lib.getBalanceOfPublicKey(protocol.wallet.publicKey)

      expect(balance.total.value).to.equal('800000')
      expect(balance.total.unit).to.equal('blockchain')
    })

    it('should estimate the max transaciton value', async () => {
      const maxValue: Amount<TezosUnits> = await protocol.lib.getTransactionMaxAmountWithPublicKey(protocol.wallet.publicKey, [
        'zet12apvDmVPFfhuhNqzPrnLprQCZ4QADfid3AVgqwXLacyqHoirLYN81kd3Jn2e75Bcv'
      ])

      expect(maxValue.value).to.equal('800000')
      expect(maxValue.unit).to.equal('blockchain')
    })

    it('should wrap the sapling transaction in a Tezos operation', async () => {
      const publicKey: PublicKey = protocol.tezos.wallet.publicKey

      const saplingTransactions: [string[] | string, TezosTransactionParameters][] = [
        [
          [
            '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ],
          {
            entrypoint: 'default',
            value: [
              {
                bytes:
                  '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
              }
            ]
          }
        ]
      ]

      saplingTransactions.forEach(async ([transactions, parameters]) => {
        const protocolNetwork = await protocol.lib.getNetwork()
        const wrappedTransaction: TezosUnsignedTransaction = await protocol.lib.wrapSaplingTransactions(publicKey, transactions, {
          fee: newAmount(1000, 'blockchain')
        })
        const expected = await protocol.tezos.lib.forgeOperation({
          branch: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT',
          contents: [
            // tslint:disable-next-line: no-object-literal-type-assertion
            {
              kind: TezosOperationType.TRANSACTION,
              fee: '1000',
              amount: '0',
              destination: protocolNetwork.contractAddress,
              source: protocol.tezos.wallet.addresses[0],
              counter: '917316',
              gas_limit: '10300',
              storage_limit: '0',
              parameters
            } as TezosTransactionOperation
          ]
        })

        expect(wrappedTransaction).to.deep.equal({ type: 'unsigned', binary: expected })
      })
    })

    it('should prepare contract calls', async () => {
      const contractCalls: [string[], TezosTransactionParameters[]][] = [
        [
          [
            '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ],
          [
            {
              entrypoint: 'default',
              value: [
                {
                  bytes:
                    '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
                }
              ]
            }
          ]
        ],
        [
          [
            '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            '0000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ],
          [
            {
              entrypoint: 'default',
              value: [
                {
                  bytes:
                    '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
                },
                {
                  bytes:
                    '0000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
                }
              ]
            }
          ]
        ]
      ]

      contractCalls.forEach(async ([transactions, expected]) => {
        const contractCalls: TezosContractCall[] = await protocol.lib.prepareContractCalls(transactions)
        const contractCallParameters: TezosTransactionParameters[] = contractCalls.map((call) => call.toJSON())

        expect(contractCallParameters).to.deep.equal(expected)
      })
    })

    it('should parse contract parameters', async () => {
      const parameters: [TezosTransactionParameters, string[]][] = [
        [
          {
            entrypoint: 'default',
            value: [
              {
                bytes:
                  '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
              }
            ]
          },
          [
            '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ]
        ],
        [
          {
            entrypoint: 'default',
            value: [
              {
                bytes:
                  '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
              },
              {
                bytes:
                  '0000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
              }
            ]
          },
          [
            '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            '0000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ]
        ],
        [
          {
            entrypoint: 'other',
            value: []
          },
          []
        ]
      ]

      parameters.forEach(async ([parameters, expected]) => {
        const parsed: string[] = await protocol.lib.parseParameters(parameters)

        expect(parsed).to.deep.equal(expected)
      })
    })
  })
})
