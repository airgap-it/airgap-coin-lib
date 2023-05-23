import { AirGapWalletStatus } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { GenericERC20 } from '../../../src/v0'
import { ERC20Token } from '../../../src/v0/protocol/erc20/ERC20'
import { TestProtocolSpec } from '../implementations'
import { GenericERC20ProtocolStub } from '../stubs/generic-erc20.stub'
import { IACMessageType } from '@airgap/serializer'
import { SchemaInfo as SchemaInfoV2, SchemaRoot } from '@airgap/serializer/v2/schemas/schema'

const unsignedTransactionV2: SchemaRoot = require('../../../src/v0/serializer/schemas/v2/transaction-sign-request-ethereum.json')
const signedTransactionV2: SchemaRoot = require('../../../src/v0/serializer/schemas/v2/transaction-sign-response-ethereum.json')

const protocol = ERC20Token

export class GenericERC20TokenTestProtocolSpec extends TestProtocolSpec {
  public name = 'Generic ERC20 Token'
  public lib = protocol
  public stub = new GenericERC20ProtocolStub()
  public validAddresses = ['0xb752b6dfe409ca926c78b1595bcf7442160c07c7']
  public wallet = {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
    masterFingerprint: '',
    status: AirGapWalletStatus.ACTIVE
  }
  public txs = [
    {
      amount: new BigNumber('5').shiftedBy(12).toString(10),
      fee: '31705000000000',
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      mandatoryProperties: ['data', 'nonce', 'gasPrice', 'gasLimit', 'to', 'value', 'chainId'],
      unsignedTx: {
        nonce: '0x50',
        gasLimit: '0x7bd9', // 31705
        gasPrice: '0x3b9aca00', // 1 gwei
        to: '0x2dd847af80418D280B7078888B6A6133083001C9', // contract address
        value: '0x0',
        chainId: 3,
        data:
          '0xa9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000000000048c27395000'
      },
      signedTx:
        'f8a850843b9aca00827bd9942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000000000048c2739500029a055e262544c878642967939e9dc83fff796125a1c1ddff385d0f4371031a9ce74a02e2535e1b889fb2bb68f0b5a87f6273ff6736c8b5659f904751c976297165054'
    }
  ]

  public transactionResult = {
    transactions: [
      {
        hash: '0x8cd4c5bc3ab89cebc8c6fa4e96353c2808ccab2c489fae53d4c7beb006be469d',
        from: ['0xfd9eecb127677b1f931d6d49dfe6626ffe60370f'],
        to: ['0xfd9eecb127677b1f931d6d49dfe6626ffe60370f'],
        isInbound: true,
        amount: '10000000000000',
        fee: '1470000000000000',
        blockHeight: '10755916',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1598707831
      },
      {
        hash: '0x5440a643326e86e823f6394a43a4227283af7384ef8a87f65d50a75364444a10',
        from: ['0xfd9eecb127677b1f931d6d49dfe6626ffe60370f'],
        to: ['0xb4272071ecadd69d933adcd19ca99fe80664fc08'],
        isInbound: false,
        amount: '0',
        fee: '2837693250000000',
        blockHeight: '10492200',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1595191919
      }
    ],
    cursor: { page: 2 }
  }

  public nextTransactionResult = {
    transactions: [
      {
        hash: '0x9140eed9857ef5d044e6f0fca3b78ab7d3521e73a0aa20a08ccffddfd769e230',
        from: ['0xfd9eecb127677b1f931d6d49dfe6626ffe60370f'],
        to: ['0x428b038a03a266da61961a617038188a79f945da'],
        isInbound: false,
        amount: '5000000000000000',
        fee: '504000000000000',
        blockHeight: '10388875',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1593811434
      },
      {
        hash: '0xa870b02578647ccd36bcfa705b77cd886569fb0e455635f75fbda8e7cc3f40ce',
        from: ['0xfd9eecb127677b1f931d6d49dfe6626ffe60370f'],
        to: ['0x8860a60f7538a2bc06c433823b64a8bf5e987fa0'],
        isInbound: false,
        amount: '10000000000000000',
        fee: '861000000000000',
        blockHeight: '10381041',
        protocolIdentifier: 'eth',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://etherscan.io' },
          extras: { chainID: 1, blockExplorerApi: 'https://api.etherscan.io' }
        },
        timestamp: 1593706914
      }
    ],
    cursor: { page: 3 }
  }

  constructor(validAddresses: string[] = ['0xb752b6dfe409ca926c78b1595bcf7442160c07c7'], lib: GenericERC20 = ERC20Token) {
    super()
    this.lib = lib
    this.validAddresses = validAddresses
  }

  public schemasV2: { type: IACMessageType; info: SchemaInfoV2 }[] = [
    { type: IACMessageType.TransactionSignRequest, info: { schema: unsignedTransactionV2 } },
    { type: IACMessageType.TransactionSignResponse, info: { schema: signedTransactionV2 } }
  ]
}
