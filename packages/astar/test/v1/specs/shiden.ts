// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey } from '@airgap/module-kit'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'
import { sr25519Verify, waitReady } from '@polkadot/wasm-crypto'

import { ShidenUnits } from '../../../src/v1'
import { ShidenProtocolImpl } from '../../../src/v1/protocol/ShidenProtocol'
import { TestProtocolSpec } from '../implementations'
import { ShidenProtocolStub } from '../stubs/shiden.stub'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/
// Private Key: d08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141
// Public Key: 52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Shiden SS58): XoyJqEf2TyDn9DJhddh8cLx8zJqaQixVqoZG5ZhyXM6qt1R
export class ShidenTestProtocolSpec extends TestProtocolSpec<ShidenUnits> {
  public name = 'Shiden'
  public lib = new ShidenProtocolImpl()
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
    secretKey: {
      type: 'priv',
      format: 'hex',
      value:
        'd08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10'
    } as PublicKey,
    derivationPath: 'm/',
    addresses: ['XoyJqEf2TyDn9DJhddh8cLx8zJqaQixVqoZG5ZhyXM6qt1R']
  }

  public txs = [
    {
      from: this.wallet.addresses,
      to: this.wallet.addresses,
      amount: {
        value: '1000000000000',
        unit: 'blockchain'
      } as Amount<ShidenUnits>,
      fee: {
        value: '1000000000',
        unit: 'blockchain'
      } as Amount<ShidenUnits>,
      unsignedTx: {
        type: 'unsigned',
        encoded:
          // tslint:disable-next-line: prefer-template
          '04' + // number of txs
          '3506' + // tx length
          '01' + // optional type (specVersion)
          '1e000000' + // specVersion
          '00' + // type
          '02286bee' + // fee
          // transaction
          '4502' + // length
          '84' + // signed flag (not signed)
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId signer
          '00' + // signature type (ed25519)
          '0000000000000000000000000000000000000000000000000000000000000000' + // signature
          '0000000000000000000000000000000000000000000000000000000000000000' + // signature
          '8503' + // era
          '04' + // nonce
          '00' + // tip
          '00' + //mode
          '1f00' + // moduleId + callId
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
          '070010a5d4e8' + // value
          // payload
          'b903' + // payload length
          Buffer.from(
            '1f00' + // moduleId + callId
              '00' + // MultiAddress type
              '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
              '070010a5d4e8' + // value
              '8503' + // era
              '04' + // nonce
              '00' + // tip
              '00' + //mode
              '1e000000' + // specVersion
              '01000000' + // transactionVersion
              'd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170' + // genesis hash
              '33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9' + // block hash
              '00' //metadatahash
          ).toString('hex') // payload
      } as SubstrateUnsignedTransaction,
      signedTx: {
        type: 'signed',
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
          '84' + // signed flag (signed)
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId signer
          '01' + // signature type (sr25519)
          'ee2a58943fa268120d6eac3256d34f1b5ecf92b82034492d2d412a45bdd66931' + // signature
          'c96a8a51c2e6a0d104c65697e52be40b45decb45608216fd3ca2f3a14e74c98b' + // signature
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
      } as SubstrateSignedTransaction
    }
  ]

  public verifySignature = async (publicKey: PublicKey, tx: SubstrateSignedTransaction): Promise<boolean> => {
    await waitReady()

    const decoded = this.lib.transactionController.decodeDetails(tx.encoded)[0]

    const signature = decoded.transaction.signature.signature.value
    const payload = Buffer.from(decoded.payload, 'hex')
    const publicKeyBuffer = Buffer.from(publicKey.value, 'hex')

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
}
