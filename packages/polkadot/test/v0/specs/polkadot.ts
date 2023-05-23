import { sr25519Verify, waitReady } from '@polkadot/wasm-crypto'
import { AirGapWalletStatus } from '@airgap/coinlib-core'
import { SubstrateNetwork } from '@airgap/substrate/v0/protocol/SubstrateNetwork'

import { PolkadotProtocol } from '../../../src/v0'
import { TestProtocolSpec } from '../implementations'
import { PolkadotProtocolStub } from '../stubs/polkadot.stub'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/
// Private Key: d08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141
// Public Key: 52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Polkadot SS58): 12sg1sXe71bazrBzAyEaF71puZbNJVaMZ92uBfMCfFNfSA9P
export class PolkadotTestProtocolSpec extends TestProtocolSpec {
  public name = 'Polkadot'
  public lib = new PolkadotProtocol()
  public stub = new PolkadotProtocolStub()

  public validAddresses = [
    '16CuDZEYc5oQkkNXvxq5Q3K44RVwW7DWbw8ZW83H2QG7kc4x',
    '15ajKAj3bAtjsKyVe55LvGok3fB2WGAC4K1g3zYsahzPumJr',
    '15VtKrtqtAiptfZwcpagQUNVSKgPTyF8JJJi32JXf4vSkSYC',
    '143RsnrR7y89kwDWvVWp6iNyGg8TiFUZXWVjSpCYaDMLqE1j',
    '1rqrUJQBhx6deZYLFd21LtNusPPf6kN8k7AAEanXqPrM58f',
    '13BjXUHsqAvLJrGDKcEbVzgdGMSobNPBjvLvd8NyiH9iaHCU',
    '1ZZpAwuPzyWxGTnkUNrA7Pjo6nFYRmMXLk6cwzzUk8Ua9Sv',
    '1N3hXfu4Ut4bPMq6ciWYAieCiZg5e4Kg5LjMPtMV4WaV7eF',
    '16Y64EP5JLiM29pCQzDHkdvsCuWA7tYvs7tqSaDs6w3BeJh4',
    '13wUHTgsup34hQ4e2Rye7sf6Ppn1V5coCZJxyU7jsVdp3uJw'
  ]

  public wallet = {
    privateKey:
      'd08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141',
    publicKey: '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10',
    addresses: ['12sg1sXe71bazrBzAyEaF71puZbNJVaMZ92uBfMCfFNfSA9P'],
    masterFingerprint: 'f4e222fd',
    status: AirGapWalletStatus.ACTIVE
  }

  public txs = [
    {
      from: this.wallet.addresses,
      to: this.wallet.addresses,
      amount: '1000000000000',
      fee: '1000000000',
      unsignedTx: {
        encoded:
          // tslint:disable-next-line: prefer-template
          '04' + // number of txs
          '2106' + // tx length
          '01' + // optional type (specVersion)
          '1e000000' + // specVersion
          '00' + // type
          '02286bee' + // fee
          // transaction
          '4102' + // length
          '84' + // signed flag (not signed)
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId signer
          '00' + // signature type (ed25519)
          '0000000000000000000000000000000000000000000000000000000000000000' + // signature
          '0000000000000000000000000000000000000000000000000000000000000000' + // signature
          '8503' + // era
          '04' + // nonce
          '00' + // tip
          '0400' + // moduleId + callId
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
          '070010a5d4e8' + // value
          // payload
          'a903' + // payload length
          Buffer.from(
            '0400' + // moduleId + callId
              '00' + // MultiAddress type
              '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
              '070010a5d4e8' + // value
              '8503' + // era
              '04' + // nonce
              '00' + // tip
              '1e000000' + // specVersion
              '01000000' + // transactionVersion
              'd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170' + // genesis hash
              '33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9' // block hash
          ).toString('hex') // payload
      },
      signedTx:
        // tslint:disable-next-line: prefer-template
        '04' + // number of txs
        '2106' + // tx length
        '01' + // optional type (specVersion)
        '1e000000' + // specVersion
        '00' + // type
        '02286bee' + // fee
        // transaction
        '4102' + // length
        '84' + // signed flag (signed)
        '00' + // MultiAddress type
        '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId signer
        '00' + // signature type (ed25519)
        'e209d71282bbff8af2f4362e4b478d156c9c1df81e2a7d733912525308909a16' + // signature
        'adf7eb5602136d4b0a9a57acdd07a443f3bc4865c2455bf36f01ff9fa9b4478d' + // signature
        '8503' + // era
        '04' + // nonce
        '00' + // tip
        '0400' + // moduleId + callId
        '00' + // MultiAddress type
        '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
        '070010a5d4e8' + // value
        // payload
        'a903' + // payload length
        Buffer.from(
          '0400' + // moduleId + callId
            '00' + // MultiAddress type
            '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
            '070010a5d4e8' + // value
            '8503' + // era
            '04' + // nonce
            '00' + // tip
            '1e000000' + // specVersion
            '01000000' + // transactionVersion
            'd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170' + // genesis hash
            '33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9' // block hash
        ).toString('hex') // payload
    }
  ]

  public verifySignature = async (publicKey: string, tx: any): Promise<boolean> => {
    await waitReady()

    const decoded = (await this.lib.getOptions()).transactionController.decodeDetails(tx)[0]

    const signature = decoded.transaction.signature.signature.value
    const payload = Buffer.from(decoded.payload, 'hex')
    const publicKeyBuffer = Buffer.from(publicKey, 'hex')

    return sr25519Verify(signature, payload, publicKeyBuffer)
  }

  public seed(): string {
    return '55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0'
  }

  public mnemonic(): string {
    return 'food talent voyage degree siege clever account medal film remind good kind'
  }

  public messages = [
    {
      message: 'example message',
      signature:
        '0x98160df00de787087cd9599ff5e59ac8c99af6c53a319a96b0a9e1f6e634ce5fed9db553b759a115c3d9d6fcdd0f11705656bad16ea3ee9f20390f253c7cd58a'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: 'a3677b19a6ba036288ec2261b620a805!15a385b47009a2b55f587ed9f897e2!f649bbcb1c46c48b0078dc7d40a642a9'
    }
  ]

  public transactionResult = {
    transactions: [
      {
        protocolIdentifier: 'polkadot',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/polkadot' },
          extras: { apiUrl: 'https://polkadot.subscan.io/api/scan', network: SubstrateNetwork.POLKADOT }
        },
        from: ['16CuDZEYc5oQkkNXvxq5Q3K44RVwW7DWbw8ZW83H2QG7kc4x'],
        to: ['15ajKAj3bAtjsKyVe55LvGok3fB2WGAC4K1g3zYsahzPumJr'],
        isInbound: true,
        amount: '99977416667634',
        fee: '2583332366',
        timestamp: 1601036370,
        hash: '0x33482af443df63c3b0c9b5920b0723256a1e69602bba0bbe50cae3cb469084a5',
        blockHeight: 4200705,
        status: 'applied'
      },
      {
        protocolIdentifier: 'polkadot',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/polkadot' },
          extras: { apiUrl: 'https://polkadot.subscan.io/api/scan', network: SubstrateNetwork.POLKADOT }
        },
        from: ['16CuDZEYc5oQkkNXvxq5Q3K44RVwW7DWbw8ZW83H2QG7kc4x'],
        to: ['15ajKAj3bAtjsKyVe55LvGok3fB2WGAC4K1g3zYsahzPumJr'],
        isInbound: false,
        amount: '1020000000000',
        fee: '2583332366',
        timestamp: 1601034570,
        hash: '0xffef69ea4dbceef33bd904a2aaf92129cca4435642d7f71e85dbccb91d53c3af',
        blockHeight: 4200409,
        status: 'applied'
      }
    ],
    cursor: { page: 1 }
  }
  public nextTransactionResult = {
    transactions: [
      {
        protocolIdentifier: 'polkadot',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/polkadot' },
          extras: { apiUrl: 'https://polkadot.subscan.io/api/scan', network: SubstrateNetwork.POLKADOT }
        },
        from: ['16CuDZEYc5oQkkNXvxq5Q3K44RVwW7DWbw8ZW83H2QG7kc4x'],
        to: ['15ajKAj3bAtjsKyVe55LvGok3fB2WGAC4K1g3zYsahzPumJr'],
        isInbound: false,
        amount: '15966000000000',
        fee: '2599999026',
        timestamp: 1601030652,
        hash: '0xd02429787c9f28692018a2147ad093222857e686563c1166a1338fa9b624b9d3',
        blockHeight: 4199759,
        status: 'applied'
      },
      {
        protocolIdentifier: 'polkadot',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/polkadot' },
          extras: { apiUrl: 'https://polkadot.subscan.io/api/scan', network: SubstrateNetwork.POLKADOT }
        },
        from: ['16CuDZEYc5oQkkNXvxq5Q3K44RVwW7DWbw8ZW83H2QG7kc4x'],
        to: ['15ajKAj3bAtjsKyVe55LvGok3fB2WGAC4K1g3zYsahzPumJr'],
        isInbound: false,
        amount: '3800000000000',
        fee: '2599999026',
        timestamp: 1601030412,
        hash: '0x898a890d48861039715bd8d0671593ddf62c539f4b566fcab02859ff2b172c64',
        blockHeight: 4199719,
        status: 'applied'
      }
    ],
    cursor: { page: 2 }
  }
}
