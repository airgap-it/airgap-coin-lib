import { GenericERC20 } from '@airgap/ethereum'
import { ERC20Token } from '@airgap/ethereum/protocol/erc20/ERC20'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapWalletStatus } from '@airgap/coinlib-core'

import { TestProtocolSpec } from '../implementations'
import { GenericERC20ProtocolStub } from '../stubs/generic-erc20.stub'

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
          '0xa9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f40000'
      },
      signedTx:
        'f8a850843b9aca00827bd9942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f4000029a08d49aaad012ffd039a405db5087683df85330ec4a8aad984a9e576fa21584198a0757c8decf24b5a95f33a25b6a968c392d832896e8c956a2bd24078519cca1b58'
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
}
