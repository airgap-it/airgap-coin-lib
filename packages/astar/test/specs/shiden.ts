import { sr25519Verify, waitReady } from '@polkadot/wasm-crypto'
import { AirGapWalletStatus } from '@airgap/coinlib-core'
import { SubstrateNetwork } from '@airgap/substrate/v0/protocol/SubstrateNetwork'

import { ShidenProtocol } from '../../src'
import { TestProtocolSpec } from '../implementations'
import { ShidenProtocolStub } from '../stubs/shiden.stub'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/
// Private Key: d08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141
// Public Key: 52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Shiden SS58): XoyJqEf2TyDn9DJhddh8cLx8zJqaQixVqoZG5ZhyXM6qt1R
export class ShidenTestProtocolSpec extends TestProtocolSpec {
  public name = 'Shiden'
  public lib = new ShidenProtocol()
  public stub = new ShidenProtocolStub()

  public validAddresses = [
    'WfjQDWqxwYBQRdZ6VZYxctAL9Y5ZNEYFawz166kMfQFUT3Z',
    'a7HAyjvVptLyhSZHpPPpubY2niSBhcHjEFnSvYCE81ZESbP',
    'b9hYKtdVvT3NY5MoDCUNpGfs1hH3F66V7T6Ka27hNyUTuwy',
    'anHTwZaPCHN2qcZJ6WVSs2zpBnryfqP9hUKGTwqBBqKP56u',
    'XrYEhuQ38xaDVMkKBKmuEzTdvaC6ffmDxRquBRPD9H2SQ1o',
    'WDg5HZJADkTp9NmzhdgiNuWLLgNSh1vejM3oTAGg5ZEjLh4',
    'ZLu5SLP8SLjsBL1QBN8Go9ij1yZPEjVC9iZwoyspiWX4E6v',
    'af7qt3Nm5kXyjUN9J9j5e1kFjbKuxj4TE796qj2tQUR3inr',
    'bTVzqPr5x8XshvBucxRNFrNP6C562UqV57WcXSeGZXJxoH2',
    'Z1kXvxy6BEpMXitjsewDWNnjGSZYyuA6XM7K9S6e4dnw2P1'
  ]

  public wallet = {
    privateKey:
      'd08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141',
    publicKey: '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10',
    addresses: ['XoyJqEf2TyDn9DJhddh8cLx8zJqaQixVqoZG5ZhyXM6qt1R'],
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
          '1f00' + // moduleId + callId
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
          '070010a5d4e8' + // value
          // payload
          'a903' + // payload length
          Buffer.from(
            '1f00' + // moduleId + callId
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
        '01' + // signature type (sr25519)
        'ee2a58943fa268120d6eac3256d34f1b5ecf92b82034492d2d412a45bdd66931' + // signature
        'c96a8a51c2e6a0d104c65697e52be40b45decb45608216fd3ca2f3a14e74c98b' + // signature
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

  public messages = []

  public encryptAES = []

  public transactionResult = {
    transactions: [
      {
        protocolIdentifier: 'shiden',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://shiden.subscan.io/' },
          extras: { apiUrl: 'https://shiden.subscan.io/api/scan', network: SubstrateNetwork.ASTAR }
        },
        from: ['0x8925639D43eB0298E95FfEfC792E8d23b7d06cbD'],
        to: ['EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X'],
        isInbound: true,
        amount: '99977416667634',
        fee: '2583332366',
        timestamp: 1601036370,
        hash: '0x33482af443df63c3b0c9b5920b0723256a1e69602bba0bbe50cae3cb469084a5',
        blockHeight: 4200705,
        status: 'applied'
      },
      {
        protocolIdentifier: 'shiden',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://shiden.subscan.io/' },
          extras: { apiUrl: 'https://shiden.subscan.io/api/scan', network: SubstrateNetwork.ASTAR }
        },
        from: ['0x8925639D43eB0298E95FfEfC792E8d23b7d06cbD'],
        to: ['0x944e005444aafFE1bC57C9869b51033b7a7630C1'],
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
        protocolIdentifier: 'shiden',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://shiden.subscan.io/' },
          extras: { apiUrl: 'https://shiden.subscan.io/api/scan', network: SubstrateNetwork.ASTAR }
        },
        from: ['WfjQDWqxwYBQRdZ6VZYxctAL9Y5ZNEYFawz166kMfQFUT3Z'],
        to: ['a7HAyjvVptLyhSZHpPPpubY2niSBhcHjEFnSvYCE81ZESbP'],
        isInbound: false,
        amount: '15966000000000',
        fee: '2599999026',
        timestamp: 1601030652,
        hash: '0xd02429787c9f28692018a2147ad093222857e686563c1166a1338fa9b624b9d3',
        blockHeight: 4199759,
        status: 'applied'
      },
      {
        protocolIdentifier: 'shiden',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://shiden.subscan.io/' },
          extras: { apiUrl: 'https://shiden.subscan.io/api/scan', network: SubstrateNetwork.ASTAR }
        },
        from: ['WfjQDWqxwYBQRdZ6VZYxctAL9Y5ZNEYFawz166kMfQFUT3Z'],
        to: ['a7HAyjvVptLyhSZHpPPpubY2niSBhcHjEFnSvYCE81ZESbP'],
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
