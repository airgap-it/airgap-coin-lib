// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { createTezosProtocol, TezosProtocol, TezosSignedTransaction, TezosUnits, TezosUnsignedTransaction } from '../../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { TezosProtocolStub } from '../stubs/tezos.stub'

// Test Mnemonic from using Ledger, 44'/1729'/0'/0'
// leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
// Address: tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L

export class TezosTestProtocolSpec extends TestProtocolSpec<TezosProtocol> {
  public name = 'Tezos'
  public lib = createTezosProtocol()

  public stub = new TezosProtocolStub()
  public validAddresses = [
    'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM',
    'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH',
    'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt',
    'tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM',
    'tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB',
    'KT1B3vuScLjXeesTAYo19LdnnLgGqyYZtgae',
    'KT1U7Gj8F3B6A7oLyxY8xoXhrXPRv8KcLx7s',
    'KT1TRyLb6E1YT5GUnq5F4BtL3hBFeQcQL6wT',
    'KT1DwFCbxes79DxMeuBzAzW82z6eBVTnYjoN',
    'KT1Ux1JNNVhVVfdDXF1qiyGpS4ZZgDa9MbvH'
  ]
  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value:
        '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
    } as PublicKey,
    addresses: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L']
  }
  public txs = [
    {
      to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      amount: {
        value: '1000000',
        unit: 'blockchain'
      } as Amount<TezosUnits>,
      fee: {
        value: '1420',
        unit: 'blockchain'
      } as Amount<TezosUnits>,
      unsignedTx: {
        type: 'unsigned',
        binary:
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9556c0091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600'
      } as TezosUnsignedTransaction,
      signedTx: {
        type: 'signed',
        binary:
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9556c0091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600b6e3e3a70996ef1e9414324d291f3d50f63c4f32b32fc1abd4dbe2d2ce55ca47598aead75b94c9a691d7b3f1912220db0118c18e141cacc84e39147aabfad60e'
      } as TezosSignedTransaction
    }
  ]

  public revealedAddressConfig = {
    manager_key: 'edpkuAJhbFLfJ4zWbQQWTZNGDg7hrcG1m1CBSWVB3iDHChjuzeaZB6',
    balance: 209328,
    toAddress: 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7',
    run_operation: {
      contents: [
        {
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
      ],
      signature: ''
    }
  }

  public unrevealedAddressConfig = {
    manager_key: null,
    balance: 10000,
    toAddress: 'tz1NFLre8tvn7QGUv9kqc5rNUuAuYzi7REpU',
    run_operation: {
      contents: [
        {
          kind: 'reveal',
          metadata: {
            balance_updates: [],
            operation_result: {
              status: 'applied',
              consumed_milligas: '1000000'
            }
          }
        },
        {
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
      ],
      signature: ''
    }
  }

  public seed(): string {
    return '5b72ef2589b7bd6e35c349ce682cb574f09726e171f2ea166982bf66a1a815fabb9dcbed182b50a3468f8af7ce1f6a3ca739dbde4241b8b674c25b9b2cc5489c'
  }

  public mnemonic(): string {
    return 'leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry'
  }

  public validUnsignedTransactions: TezosUnsignedTransaction[] = [
    {
      type: 'unsigned',
      binary:
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95508000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600'
    }
  ]

  public validSignedTransactions: TezosSignedTransaction[] = [
    {
      type: 'signed',
      binary:
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95508000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600803add2e702795b8f5d72bde46567ebfedd47c2e793ecc4a91bafc16db968a4d0a78d18ad471ba56c3bb78839dccbfc7fe22b69a148246a44749bcbedae53c01'
    }
  ]

  public messages = [
    {
      message: 'example message',
      signature: {
        value: 'edsigtexcZ9uMhqxRvPUaTdBukx2GAdwwi93VW1ULYEWXZPWViUMqR155kFeoCUqqUV97y11EM5J4AjbJriYWCXaDX6i9o9Gxde',
        format: 'encoded'
      } as Signature
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '0a7323bd4a98437b2c586733b91bde72ac062d0437062ff0b1d0390c3689855705f021bfcc28388a9e4e2c7dd159ee4db3e7ec93f7bbe65685c07eecfc0b58'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '66d61968bb57ff709c571c52ec25f5d8!8f50c743642317a0ecff076fc5ea7c!0db54d642df745113a1dce524b0a7bc6'
    }
  ]

  public transactionList(address: string): { first: any[]; next: any[] } {
    const first = [
      {
        type: 'transaction',
        id: 404858884587520,
        level: 2966871,
        timestamp: '2022-12-13T19:58:14Z',
        block: 'BLyBNNDqoXKSxYd85wQJMwQ1M6mrq7PVYbkZuEmftgNGc1a42yC',
        hash: 'onoAvnaniNBBsHyt1pMVTntTE5B1nuHApgbc4yyv6Nzo6c9QZSt',
        counter: 957142,
        sender: { address },
        gasLimit: 1928,
        gasUsed: 1671,
        storageLimit: 0,
        storageUsed: 0,
        bakerFee: 990,
        storageFee: 0,
        allocationFee: 0,
        target: {
          address: 'KT1XnTn74bUtxHfDtBmm2bGZAQfhPbvKWR8o'
        },
        targetCodeHash: 765038545,
        amount: 0,
        parameter: {
          entrypoint: 'update_operators',
          value: [
            {
              remove_operator: {
                owner: address,
                operator: 'KT1PBHtvMNqm8TL4HFwnAaJNcemxa2cZbauj',
                token_id: '0'
              }
            }
          ]
        },
        status: 'applied',
        hasInternals: false
      },
      {
        type: 'transaction',
        id: 404858883538944,
        level: 2966871,
        timestamp: '2022-12-13T19:58:14Z',
        block: 'BLyBNNDqoXKSxYd85wQJMwQ1M6mrq7PVYbkZuEmftgNGc1a42yC',
        hash: 'onoAvnaniNBBsHyt1pMVTntTE5B1nuHApgbc4yyv6Nzo6c9QZSt',
        counter: 957141,
        initiator: { address },
        sender: {
          address: 'KT1PBHtvMNqm8TL4HFwnAaJNcemxa2cZbauj'
        },
        senderCodeHash: -68368201,
        nonce: 53,
        gasLimit: 0,
        gasUsed: 3041,
        storageLimit: 0,
        storageUsed: 0,
        bakerFee: 0,
        storageFee: 0,
        allocationFee: 0,
        target: {
          address: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW'
        },
        targetCodeHash: -1721726310,
        amount: 0,
        parameter: {
          entrypoint: 'transfer',
          value: [
            {
              txs: [
                {
                  to_: address,
                  amount: '999661632753',
                  token_id: '0'
                }
              ],
              from_: 'KT1PBHtvMNqm8TL4HFwnAaJNcemxa2cZbauj'
            }
          ]
        },
        status: 'applied',
        hasInternals: false,
        tokenTransfersCount: 1
      }
    ]

    const next = [
      {
        type: 'transaction',
        id: 404858882490368,
        level: 2966871,
        timestamp: '2022-12-13T19:58:14Z',
        block: 'BLyBNNDqoXKSxYd85wQJMwQ1M6mrq7PVYbkZuEmftgNGc1a42yC',
        hash: 'onoAvnaniNBBsHyt1pMVTntTE5B1nuHApgbc4yyv6Nzo6c9QZSt',
        counter: 957141,
        initiator: { address },
        sender: {
          address: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW'
        },
        senderCodeHash: -1721726310,
        nonce: 52,
        gasLimit: 0,
        gasUsed: 1857,
        storageLimit: 0,
        storageUsed: 0,
        bakerFee: 0,
        storageFee: 0,
        allocationFee: 0,
        target: {
          address: 'KT1PBHtvMNqm8TL4HFwnAaJNcemxa2cZbauj'
        },
        targetCodeHash: -68368201,
        amount: 0,
        parameter: {
          entrypoint: 'onFA2Balance',
          value: [
            {
              balance: '999661632753',
              request: {
                owner: 'KT1PBHtvMNqm8TL4HFwnAaJNcemxa2cZbauj',
                token_id: '0'
              }
            }
          ]
        },
        status: 'applied',
        hasInternals: false
      }
    ]

    return { first, next }
  }
}
