import { expect } from 'chai'
import { it } from 'mocha'
import * as sinon from 'sinon'

import { RawTezosTransaction } from '../../src/v0'
import { TezosContractCall } from '../../src/v0/protocol/contract/TezosContractCall'
import { TezosTransactionOperation, TezosTransactionParameters } from '../../src/v0/protocol/types/operations/Transaction'
import { TezosSaplingAddressResult } from '../../src/v0/protocol/types/sapling/TezosSaplingAddressResult'
import { TezosSaplingTransactionResult } from '../../src/v0/protocol/types/sapling/TezosSaplingTransactionResult'
import { TezosOperationType } from '../../src/v0/protocol/types/TezosOperationType'

import { TezosShieldedTezTestProtocolSpec } from './specs/tezos-shielded-tez'

const protocol: TezosShieldedTezTestProtocolSpec = new TezosShieldedTezTestProtocolSpec()

describe('ICoinProtocol TezosShieldedTez - Custom Tests (v0)', () => {
  beforeEach(() => {
    protocol.stub.registerStub(protocol, protocol.lib)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('Account', () => {
    it('should create a public key from the mnemonic', async () => {
      const publicKey: string = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), 'm/')

      expect(publicKey).to.equal(protocol.wallet.publicKey)
    })

    it('should create a private key from the mnemonic', async () => {
      const privateKey: string = await protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), 'm/')

      expect(privateKey).to.equal(protocol.wallet.privateKey)
    })

    it('should create a public key from the hex secret', async () => {
      const publicKey: string = await protocol.lib.getPublicKeyFromHexSecret(protocol.seed(), 'm/')

      expect(publicKey).to.equal(protocol.wallet.publicKey)
    })

    it('should create a private key from the hex secret', async () => {
      const privateKey: string = await protocol.lib.getPrivateKeyFromHexSecret(protocol.seed(), 'm/')

      expect(privateKey).to.equal(protocol.wallet.privateKey)
    })

    it('should get an address from the public key', async () => {
      const address: TezosSaplingAddressResult = await protocol.lib.getAddressFromPublicKey(protocol.wallet.publicKey)
      const addresses: TezosSaplingAddressResult[] = await protocol.lib.getAddressesFromPublicKey(protocol.wallet.publicKey)

      expect(address.address).to.equal('zet12mVvzJ4QJhnNQetGHzdwTMcLgNrdC4SFact6BB5jpeqGAefWip3iGgEjvDA9z7b9Y')
      expect(addresses.length).to.equal(1)
      expect(addresses[0].address).to.equal('zet12mVvzJ4QJhnNQetGHzdwTMcLgNrdC4SFact6BB5jpeqGAefWip3iGgEjvDA9z7b9Y')
    })

    it('should get an address from the viewing key and index', async () => {
      const address: TezosSaplingAddressResult = await protocol.lib.getAddressFromViewingKey(protocol.wallet.publicKey, '03')

      expect(address.address).to.equal('zet12apvDmVPFfhuhNqzPrnLprQCZ4QADfid3AVgqwXLacyqHoirLYN81kd3Jn2e75Bcv')
    })

    it('should get the next valid address from the public key', async () => {
      const defaultAddress: TezosSaplingAddressResult = await protocol.lib.getAddressFromPublicKey(protocol.wallet.publicKey)
      const nextAddress: TezosSaplingAddressResult = await protocol.lib.getAddressFromPublicKey(
        protocol.wallet.publicKey,
        defaultAddress.cursor
      )

      expect(nextAddress.address).to.equal('zet12apvDmVPFfhuhNqzPrnLprQCZ4QADfid3AVgqwXLacyqHoirLYN81kd3Jn2e75Bcv')
    })

    it('should get transactions from the public key', async () => {
      const transactions: TezosSaplingTransactionResult = await protocol.lib.getTransactionsFromPublicKey(protocol.wallet.publicKey, 10)

      expect(transactions.transactions).to.deep.equal([
        {
          from: ['Shielded Pool'],
          to: [protocol.wallet.addresses[0]],
          isInbound: true,
          amount: '1000000',
          fee: '0',
          protocolIdentifier: await protocol.lib.getIdentifier(),
          network: (await protocol.lib.getOptions()).network
        },
        {
          from: [protocol.wallet.addresses[0]],
          to: ['zet13hr5yGeiB1QiHb7nhAw6rfUDpNZJV4hQTKXYethppFs5EcXeEC2ZqNSEHkYEYo52x'],
          isInbound: false,
          amount: '200000',
          fee: '0',
          protocolIdentifier: await protocol.lib.getIdentifier(),
          network: (await protocol.lib.getOptions()).network
        }
      ])
    })

    it('should get the balance of the account', async () => {
      const balance: string = await protocol.lib.getBalanceOfPublicKey(protocol.wallet.publicKey)

      expect(balance).to.equal('800000')
    })

    it('should estimate the max transaciton value', async () => {
      const maxValue: string = await protocol.lib.estimateMaxTransactionValueFromPublicKey(protocol.wallet.publicKey, [
        'zet12apvDmVPFfhuhNqzPrnLprQCZ4QADfid3AVgqwXLacyqHoirLYN81kd3Jn2e75Bcv'
      ])

      expect(maxValue).to.equal('800000')
    })

    it('should wrap the sapling transaction in a Tezos operation', async () => {
      const publicKey: string = protocol.tezos.wallet.publicKey

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
        const wrappedTransaction: RawTezosTransaction = await protocol.lib.wrapSaplingTransactions(publicKey, transactions, '1000')
        const expected = await protocol.tezos.lib.forgeTezosOperation({
          branch: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT',
          contents: [
            // tslint:disable-next-line: no-object-literal-type-assertion
            {
              kind: TezosOperationType.TRANSACTION,
              fee: '1000',
              amount: '0',
              destination: protocol.lib.contract?.address,
              source: protocol.tezos.wallet.addresses[0],
              counter: '917316',
              gas_limit: '10300',
              storage_limit: '0',
              parameters
            } as TezosTransactionOperation
          ]
        })

        expect(wrappedTransaction).to.deep.equal({ binaryTransaction: expected })
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
