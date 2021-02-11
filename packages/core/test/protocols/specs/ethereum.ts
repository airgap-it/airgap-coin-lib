import { AirGapTransactionStatus } from '../../../src/interfaces/IAirGapTransaction'
import { EthereumProtocol } from '../../../src/protocols/ethereum/EthereumProtocol'
import { SignedEthereumTransaction } from '../../../src/serializer/schemas/definitions/signed-transaction-ethereum'
import { RawEthereumTransaction } from '../../../src/serializer/types'
import { TestProtocolSpec } from '../implementations'
import { EthereumProtocolStub } from '../stubs/ethereum.stub'

import { EthereumTransactionValidator } from './../../../src/serializer/unsigned-transactions/ethereum-transactions.validator'

export class EthereumTestProtocolSpec extends TestProtocolSpec {
  public name = 'Ethereum'
  public lib = new EthereumProtocol()
  public stub = new EthereumProtocolStub()
  public validAddresses = [
    '0x5e4e92788a7aE425100D869657aE91891af019BC',
    '0xEC7eF91eFB3737fc2749c0107fd428F6a878884c',
    '0xE8911B6Ad03Fc76A3248F1eA9babe85E5Cde086c',
    '0x14D8fB603edCb2d4038Aab0d0fa224E0c4D9c6f9',
    '0xF3f22E4740ade5DEB34bAff34c60d5FE33a8dA74',
    '0xcE25b34847A7Ac1d302cAf0633f74192A984118C',
    '0xD1279A75b8C106F4c478E8f63ffCa18d4b3D0A13',
    '0x967A77444DAE9e1Fa24FAb9D358ec32a69eb0684',
    '0x9f5B6fbFf7512c449cCF206Ac1cb3C2Aa5D71957',
    '0xEFC23d847a3297eFF70832429BDEc4986C3d8175'
  ]
  public wallet = {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e']
  }
  public txs = [
    {
      amount: '1000000000000000000',
      fee: '420000000000000',
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      unsignedTx: {
        nonce: '0x0',
        gasPrice: '0x4a817c800',
        gasLimit: '0x5208',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0xde0b6b3a7640000',
        chainId: 1,
        data: '0x'
      },
      signedTx:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]
  public transactionStatusTests: { hashes: string[]; expectedResults: AirGapTransactionStatus[] }[] = [
    {
      hashes: ['0x20904cf629692c925a235e98ccf5b317c56bbc069c0941b9e45af2f35a5b612b'],
      expectedResults: [AirGapTransactionStatus.APPLIED]
    },
    {
      hashes: ['0x4a50a2d30b2ab022819ff6407ccfcfb3905406729fed82208e2d07ed92cedbe1'],
      expectedResults: [AirGapTransactionStatus.FAILED]
    },
    {
      hashes: [
        '0x20904cf629692c925a235e98ccf5b317c56bbc069c0941b9e45af2f35a5b612b',
        '0x4a50a2d30b2ab022819ff6407ccfcfb3905406729fed82208e2d07ed92cedbe1'
      ],
      expectedResults: [AirGapTransactionStatus.APPLIED, AirGapTransactionStatus.FAILED]
    }
  ]
  public validRawTransactions: RawEthereumTransaction[] = [
    {
      nonce: '0x0',
      gasPrice: '0x4a817c800',
      gasLimit: '0x5208',
      to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
      value: '0xde0b6b3a7640000',
      chainId: 1,
      data: '0x'
    }
  ]
  public invalidUnsignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'nonce',
      testName: 'Nonce',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'gasPrice',
      testName: 'Gas price',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'gasLimit',
      testName: 'Gas limit',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'to',
      testName: 'To',
      values: [
        { value: '0x', expectedError: [' is not a valid ethereum address'] }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string', ' is not a valid ethereum address'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string', ' is not a valid ethereum address'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string', ' is not a valid ethereum address'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string', ' is not a valid ethereum address'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'value',
      testName: 'Value',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'chainId',
      testName: 'Chain id',
      values: [
        { value: '0x', expectedError: [' is not a number'] }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not a number'] },
        { value: 0x0, expectedError: undefined },
        { value: 1, expectedError: undefined },
        { value: -1, expectedError: [' must be greater than or equal to 0'] },
        { value: undefined, expectedError: [" can't be blank"] },
        { value: null, expectedError: [" can't be blank"] }
      ]
    },
    {
      property: 'data',
      testName: 'Data',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    }
  ]

  public invalidSignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'transaction',
      testName: 'Transaction',
      values: [
        { value: '0x', expectedError: [' not a valid Ethereum transaction'] }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' not a valid Ethereum transaction'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' not a valid Ethereum transaction'] },
        { value: 1, expectedError: [' is not of type "String"', ' not a valid Ethereum transaction'] },
        { value: -1, expectedError: [' is not of type "String"', ' not a valid Ethereum transaction'] },
        { value: undefined, expectedError: [" can't be blank", ' not a valid Ethereum transaction'] },
        { value: null, expectedError: [" can't be blank", ' not a valid Ethereum transaction'] }
      ]
    }
  ]

  public validSignedTransactions: SignedEthereumTransaction[] = [
    {
      accountIdentifier: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      transaction:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]

  public validator = new EthereumTransactionValidator()

  public messages = [
    {
      message: 'example message',
      signature:
        '0xa1f6730159726cd8def8058a5651e680328d898e26b81c2378079185b30ccb2e7e1e369cd82a9d55f2c8abdb0cbb1bfe07f0585327c475a1c35c83c6d32a8d2901'
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '047042daec1e399e3a5310cb045a789e212bb197098352ee7f8f2a273453ce837048f27ddd390655b0169f0769c8cb1e62c5bbef5bce95272829695abb9e6803974b6ae6cb550a638e079793c30b8e7fb1cb91c8f43097740d867034fb1a1c3c074451aba2c1d884c02875d0df266b03'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '8b209a372e8b3fd1ee6054769a4b5ce3!9da458363d5f4c8a9b9093569d0590!fa8fb2bb3addee77c43d1b9e82dcb050'
    }
  ]

  public transactionResult = {
    transactions: [
      {
        hash: '0x4fb2f67e23e8f69d4733555c0606bfb2cadf5ba3d0672340a170663fc46c9a91',
        from: ['0x5e4e92788a7ae425100d869657ae91891af019bc'],
        to: ['0xe6fa0df04f68f5ae04688406f73735b3727473c6'],
        isInbound: false,
        amount: '100536909000000000',
        fee: '2987932000000000',
        blockHeight: '10599922',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1596633063
      },
      {
        hash: '0xb7818798bc510e9416288a72ddf32ef84586d7a1bb28605fbdae0a601c333864',
        from: ['0x3d31577baa04ad402b5ee6b12bd116e67eeda435'],
        to: ['0x5e4e92788a7ae425100d869657ae91891af019bc'],
        isInbound: true,
        amount: '103000000000000000',
        fee: '1386000000000000',
        blockHeight: '10599853',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1596632134
      }
    ],
    cursor: { page: 2 }
  }

  public nextTransactionResult = {
    transactions: [
      {
        hash: '0x70f36faa9b6a95af9badeaf72770e098fcbba9ca82f2c126d0d6a6af0f121654',
        from: ['0x5e4e92788a7ae425100d869657ae91891af019bc'],
        to: ['0xe6fa0df04f68f5ae04688406f73735b3727473c6'],
        isInbound: false,
        amount: '354435688000000000',
        fee: '2274396000000000',
        blockHeight: '10483321',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1595073399
      },
      {
        hash: '0xf4f5f089d1f7a521a5b3bf7ae7848a444ca7cf9238e37bade83aa2879c08c9e0',
        from: ['0x5e4e92788a7ae425100d869657ae91891af019bc'],
        to: ['0x5acc84a3e955bdd76467d3348077d003f00ffb97'],
        isInbound: false,
        amount: '100000000000000000',
        fee: '5831476000000000',
        blockHeight: '10467688',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1594864275
      }
    ],
    cursor: { page: 3 }
  }
}
