import { SignedTezosTransaction, TezosFAProtocolConfig, TezosFAProtocolOptions, TezosProtocol, TezosProtocolNetwork } from '../../../src/'
import { AirGapTransactionStatus } from '../../../src/interfaces/IAirGapTransaction'
import { TezosFA1p2Protocol } from '../../../src/protocols/tezos/fa/TezosFA1p2Protocol'
import { TezosFA1Protocol } from '../../../src/protocols/tezos/fa/TezosFA1Protocol'
import { TezosFA2Protocol } from '../../../src/protocols/tezos/fa/TezosFA2Protocol'
import { TezosFA2ProtocolConfig, TezosFA2ProtocolOptions } from '../../../src/protocols/tezos/fa/TezosFAProtocolOptions'
import { RawTezosTransaction } from '../../../src/serializer/types'
import { ProtocolSymbols } from '../../../src/utils/ProtocolSymbols'
import { AirGapWalletStatus } from '../../../src/wallet/AirGapWallet'
import { TestProtocolSpec } from '../implementations'
import { TezosProtocolStub } from '../stubs/tezos.stub'

import { TezosTransactionValidator } from './../../../src/serializer/unsigned-transactions/tezos-transactions.validator'

// Test Mnemonic from using Ledger, 44'/1729'/0'/0'
// leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
// Address: tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L

export class TezosTestProtocolSpec extends TestProtocolSpec {
  public name = 'Tezos'
  public lib = new TezosProtocol()

  public get fa1() {
    return new TezosFA1Protocol(
      new TezosFAProtocolOptions(
        new TezosProtocolNetwork(),
        new TezosFAProtocolConfig('', '' as ProtocolSymbols, '', '', '', { low: '', medium: '', high: '' }, 0)
      )
    )
  }

  public get fa12() {
    return new TezosFA1p2Protocol(
      new TezosFAProtocolOptions(
        new TezosProtocolNetwork(),
        new TezosFAProtocolConfig('', '' as ProtocolSymbols, '', '', '', { low: '', medium: '', high: '' }, 0)
      )
    )
  }

  public get fa2() {
    return new TezosFA2Protocol(
      new TezosFA2ProtocolOptions(
        new TezosProtocolNetwork(),
        new TezosFA2ProtocolConfig(
          'KT1Eso7AdpjrHd4rCz9rGxf92tSm3fEDAkdx',
          '' as ProtocolSymbols,
          '',
          '',
          '',
          { low: '', medium: '', high: '' },
          0
        )
      )
    )
  }

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
    privateKey:
      '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234',
    publicKey: 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234',
    addresses: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
    masterFingerprint: 'f4e222fd',
    status: AirGapWalletStatus.ACTIVE
  }
  public txs = [
    {
      amount: '1000000',
      fee: '1420',
      to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      unsignedTx: {
        binaryTransaction:
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9556c0091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600'
      },
      signedTx:
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9556c0091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600b6e3e3a70996ef1e9414324d291f3d50f63c4f32b32fc1abd4dbe2d2ce55ca47598aead75b94c9a691d7b3f1912220db0118c18e141cacc84e39147aabfad60e'
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
              consumed_gas: '10300',
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
              consumed_gas: '1000',
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
              consumed_gas: '10300',
              paid_storage_size_diff: '0'
            },
            internal_operation_results: []
          }
        }
      ],
      signature: ''
    }
  }

  public transactionStatusTests: { hashes: string[]; expectedResults: AirGapTransactionStatus[] }[] = [
    { hashes: ['op7mhXwjNMjfP2yDhDWRMxwu2oYyE44pdv9y6JeVFvaTcjpgAAD'], expectedResults: [AirGapTransactionStatus.APPLIED] },
    { hashes: ['onzAK6Hkyv5HWY3Ru2ohX1tS3VYz9YC8mtP2ozNvk4Dia9QLtku'], expectedResults: [AirGapTransactionStatus.FAILED] },
    {
      hashes: ['op7mhXwjNMjfP2yDhDWRMxwu2oYyE44pdv9y6JeVFvaTcjpgAAD', 'onzAK6Hkyv5HWY3Ru2ohX1tS3VYz9YC8mtP2ozNvk4Dia9QLtku'],
      expectedResults: [AirGapTransactionStatus.APPLIED, AirGapTransactionStatus.FAILED]
    }
  ]

  public seed(): string {
    return '5b72ef2589b7bd6e35c349ce682cb574f09726e171f2ea166982bf66a1a815fabb9dcbed182b50a3468f8af7ce1f6a3ca739dbde4241b8b674c25b9b2cc5489c'
  }

  public mnemonic(): string {
    return 'leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry'
  }

  public invalidUnsignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'binaryTransaction',
      testName: 'Binary transaction',
      values: [
        {
          value:
            'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95508000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600',

          expectedError: undefined
        }, // TODO: Valid?
        {
          value: '0x0',
          expectedError: undefined
        },
        {
          value: '',
          expectedError: [" can't be blank"]
        },
        {
          value: 0x0,
          expectedError: [' not a valid Tezos transaction', ' is not of type "String"']
        },
        {
          value: 1,
          expectedError: [' not a valid Tezos transaction', ' is not of type "String"']
        },
        {
          value: -1,
          expectedError: [' not a valid Tezos transaction', ' is not of type "String"']
        },
        {
          value: null,
          expectedError: [' not a valid Tezos transaction', " can't be blank"]
        },
        {
          value: undefined,
          expectedError: [' not a valid Tezos transaction', " can't be blank"]
        }
      ]
    }
  ]
  public validRawTransactions: RawTezosTransaction[] = [
    {
      binaryTransaction:
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95508000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600'
    }
  ]

  public invalidSignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'transaction',
      testName: 'Transaction',
      values: [
        { value: '0x0', expectedError: [' not a valid Tezos transaction'] },
        { value: '', expectedError: [' not a valid Tezos transaction', " can't be blank"] },
        { value: 0x0, expectedError: [' not a valid Tezos transaction', ' is not of type "String"'] },
        { value: 1, expectedError: [' not a valid Tezos transaction', ' is not of type "String"'] },
        { value: -1, expectedError: [' not a valid Tezos transaction', ' is not of type "String"'] },
        { value: undefined, expectedError: [' not a valid Tezos transaction', " can't be blank"] },
        { value: null, expectedError: [' not a valid Tezos transaction', " can't be blank"] }
      ]
    },
    {
      property: 'accountIdentifier',
      testName: 'Account identifier',
      values: [
        { value: '0x0', expectedError: [' is not a valid public key'] },
        { value: '', expectedError: [" can't be blank", ' is not a valid public key'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not a valid public key'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not a valid public key'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not a valid public key'] },
        { value: null, expectedError: [" can't be blank", ' is not a valid public key'] },
        { value: undefined, expectedError: [" can't be blank", ' is not a valid public key'] }
      ]
    }
  ]

  public validSignedTransactions: SignedTezosTransaction[] = [
    {
      accountIdentifier: 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234',
      transaction:
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95508000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600803add2e702795b8f5d72bde46567ebfedd47c2e793ecc4a91bafc16db968a4d0a78d18ad471ba56c3bb78839dccbfc7fe22b69a148246a44749bcbedae53c01'
    }
  ]

  public validator = new TezosTransactionValidator()

  public messages = [
    {
      message: 'example message',
      signature: 'edsigtexcZ9uMhqxRvPUaTdBukx2GAdwwi93VW1ULYEWXZPWViUMqR155kFeoCUqqUV97y11EM5J4AjbJriYWCXaDX6i9o9Gxde'
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

  public transactionResult = {
    transactions: [
      {
        amount: '6000000000',
        fee: '1286',
        from: ['tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM'],
        isInbound: false,
        protocolIdentifier: 'xtz',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://tezblock.io' },
          extras: {
            network: 'mainnet',
            conseilUrl: 'https://tezos-mainnet-conseil.prod.gke.papers.tech',
            conseilNetwork: 'mainnet',
            conseilApiKey: 'airgap00391'
          }
        },
        to: ['tz1hKEdkf39K1gwBKVj9XP1JZawCRvcAQ2cw'],
        hash: 'ood1nAAiTBvQGHE9HgTk34nzcuvH9gKUQkHx5MWZQfJuBzJieam',
        timestamp: 1597250505,
        blockHeight: 1081253
      },
      {
        amount: '10000000000',
        fee: '1793',
        from: ['tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM'],
        isInbound: false,
        protocolIdentifier: 'xtz',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://tezblock.io' },
          extras: {
            network: 'mainnet',
            conseilUrl: 'https://tezos-mainnet-conseil.prod.gke.papers.tech',
            conseilNetwork: 'mainnet',
            conseilApiKey: 'airgap00391'
          }
        },
        to: ['KT1Lf3ZFWvvAHtfq5BUzdbJkWuopxs45VHmE'],
        hash: 'ooSd3mKv6Cx2Pg7T8igMj8FCiC8EGFdy5Do2WsZxDmVmeUF8HMk',
        timestamp: 1593091604,
        blockHeight: 1012300
      }
    ],
    cursor: { lastBlockLevel: 1012300 }
  }

  public nextTransactionResult = {
    transactions: [
      {
        amount: '70000',
        fee: '1791',
        from: ['tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM'],
        isInbound: false,
        protocolIdentifier: 'xtz',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://tezblock.io' },
          extras: {
            network: 'mainnet',
            conseilUrl: 'https://tezos-mainnet-conseil.prod.gke.papers.tech',
            conseilNetwork: 'mainnet',
            conseilApiKey: 'airgap00391'
          }
        },
        to: ['KT1BPbWDn2TR4rrWGi9bN1bkWNPjffQFXzSK'],
        hash: 'ood2vkniyLTyuj6tgjmXLk5kLXrioozrwWJw1EJah6dxBfp9HuV',
        timestamp: 1592837842,
        blockHeight: 1008088
      },
      {
        amount: '270000',
        fee: '1791',
        from: ['tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM'],
        isInbound: false,
        protocolIdentifier: 'xtz',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://tezblock.io' },
          extras: {
            network: 'mainnet',
            conseilUrl: 'https://tezos-mainnet-conseil.prod.gke.papers.tech',
            conseilNetwork: 'mainnet',
            conseilApiKey: 'airgap00391'
          }
        },
        to: ['KT1SU43prfFHSx4oqaqV3QwGCRE8BcNToSwr'],
        hash: 'opQVM8FPTHKPiXW4DihjYiomyT7dMKFkUjuyMaczAryk7hy1SXz',
        timestamp: 1592837782,
        blockHeight: 1008087
      }
    ],
    cursor: { lastBlockLevel: 1008087 }
  }
}
