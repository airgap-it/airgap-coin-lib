import { sr25519Verify, waitReady } from '@polkadot/wasm-crypto'

import { KusamaProtocol } from '../../../src/protocols/substrate/kusama/KusamaProtocol'
import { SubstrateNetwork } from '../../../src/protocols/substrate/SubstrateNetwork'
import { AirGapWalletStatus } from '../../../src/wallet/AirGapWallet'
import { TestProtocolSpec } from '../implementations'
import { KusamaProtocolStub } from '../stubs/kusama.stub'

/*
 * Test Mnemonic: leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
 *
 */
// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/
// Private Key: d08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141
// Public Key: 52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Kusama SS58): ESzXrcSsbM3Jxzuz2zczuYgCXsxQrqPw29AR2doaxZdzemT
export class KusamaTestProtocolSpec extends TestProtocolSpec {
  public name = 'Kusama'
  public lib = new KusamaProtocol()
  public stub = new KusamaProtocolStub()

  public validAddresses = [
    'EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X',
    'HTy49kysog4fCwjsCeZXzEFQ1YyuwfUpJS6UhS9jRKtaWKM',
    'CjEiyp4VU7o5pvSXCvLbKjd8xohwmTtgRysiuKssu4Ye7K5',
    'GHszz6ePQwec9voFXNe7h2DmkcgwGvPKzY2LbdksHimHmAp',
    'F2TTnBLPaccoLimZvVGts4LAoWzQR1EY9NrjPc61gU2Nkje',
    'CupYGbY1cY8ErcAwQoxp97KKAf1RUPH4m3ZArr7rekfkUoc',
    'HeCLXHxxN7dKistZLvoaTNGZcY2GXjH9SaGKvVwRyDbvFwW',
    'GvK1ubf7dbMogDbJH4YibMyyWBbxACtn9SSPEqxMWunBv2E',
    'G71LDs8bA4xYmhkZK24ndPYRhZfWVXqKtNjq1rb84J8FLfu',
    'GsUbgMs2f8BvcD5RPRGNZJtByKfqj3PrqSBwp8m1DrVR5s8'
  ]

  public wallet = {
    privateKey:
      'd08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141',
    publicKey: '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10',
    addresses: ['ESzXrcSsbM3Jxzuz2zczuYgCXsxQrqPw29AR2doaxZdzemT'],
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
          'ee070000' + // specVersion
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
              'ee070000' + // specVersion
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
        'ee070000' + // specVersion
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
            'ee070000' + // specVersion
            '01000000' + // transactionVersion
            'd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170' + // genesis hash
            '33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9' // block hash
        ).toString('hex') // payload
    }
  ]

  public verifySignature = async (publicKey: string, tx: any): Promise<boolean> => {
    await waitReady()

    const decoded = this.lib.options.transactionController.decodeDetails(tx)[0]

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
        '0x30094f45a892156fe1f79254674fdebe69da314b72371f3665aecdc486fd6233b7729571bf12765bb80cf07bd81846634a5a2e60045f492a492e2b40eee8ac8b'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: 'b9a7091ad33077761052c00f44227a9a!ff56d06348ae96d9df03f811667a08!2b08382f04eb77bf66c5cab27d06f25a'
    }
  ]

  public transactionResult = {
    transactions: [
      {
        protocolIdentifier: 'kusama',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-kusama-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/kusama' },
          extras: { apiUrl: 'https://kusama.subscan.io/api/scan', network: SubstrateNetwork.KUSAMA }
        },
        from: ['GzgRTyefkykqf72gC8hGgDVa7p1MYTDyCwFjTsVc53FxZi7'],
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
        protocolIdentifier: 'kusama',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-kusama-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/kusama' },
          extras: { apiUrl: 'https://kusama.subscan.io/api/scan', network: SubstrateNetwork.KUSAMA }
        },
        from: ['EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X'],
        to: ['Dz5JAFYyLigyGnhDyrT5bJ6u8TxagA2muR1UFz7xQVVcfWA'],
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
        protocolIdentifier: 'kusama',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-kusama-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/kusama' },
          extras: { apiUrl: 'https://kusama.subscan.io/api/scan', network: SubstrateNetwork.KUSAMA }
        },
        from: ['EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X'],
        to: ['DxAN9aGS117GJQNGSnaoPw5YVRCZD67DXC8aBzhJk9joK7X'],
        isInbound: false,
        amount: '15966000000000',
        fee: '2599999026',
        timestamp: 1601030652,
        hash: '0xd02429787c9f28692018a2147ad093222857e686563c1166a1338fa9b624b9d3',
        blockHeight: 4199759,
        status: 'applied'
      },
      {
        protocolIdentifier: 'kusama',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://polkadot-kusama-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://polkascan.io/kusama' },
          extras: { apiUrl: 'https://kusama.subscan.io/api/scan', network: SubstrateNetwork.KUSAMA }
        },
        from: ['EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X'],
        to: ['DxAN9aGS117GJQNGSnaoPw5YVRCZD67DXC8aBzhJk9joK7X'],
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
