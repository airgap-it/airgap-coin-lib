// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey, Signature } from '@airgap/module-kit'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'
import { sr25519Verify, waitReady } from '@polkadot/wasm-crypto'

import { KusamaUnits } from '../../../src/v1'
// tslint:disable-next-line: ordered-imports
import { KusamaProtocolImpl } from '../../../src/v1/protocol/KusamaProtocol'
import { TestProtocolSpec } from '../implementations'
import { KusamaProtocolStub } from '../stubs/kusama.stub'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/
// Private Key: d08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141
// Public Key: 52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Kusama SS58): ESzXrcSsbM3Jxzuz2zczuYgCXsxQrqPw29AR2doaxZdzemT
export class KusamaTestProtocolSpec extends TestProtocolSpec<KusamaUnits> {
  public name = 'Kusama'
  public lib = new KusamaProtocolImpl()
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
    addresses: ['ESzXrcSsbM3Jxzuz2zczuYgCXsxQrqPw29AR2doaxZdzemT']
  }

  public txs = [
    {
      from: this.wallet.addresses,
      to: this.wallet.addresses,
      amount: {
        value: '1000000000000',
        unit: 'blockchain'
      } as Amount<KusamaUnits>,
      fee: {
        value: '1000000000',
        unit: 'blockchain'
      } as Amount<KusamaUnits>,
      unsignedTx: {
        type: 'unsigned',
        encoded:
          // tslint:disable-next-line: prefer-template
          '04' + // number of txs
          '3506' + // tx length
          '01' + // optional type (specVersion)
          'ee070000' + // specVersion
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
          '0400' + // moduleId + callId
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
          '070010a5d4e8' + // value
          // payload
          'b903' + // payload length
          Buffer.from(
            '0400' + // moduleId + callId
              '00' + // MultiAddress type
              '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
              '070010a5d4e8' + // value
              '8503' + // era
              '04' + // nonce
              '00' + // tip
              '00' + //mode
              'ee070000' + // specVersion
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

  public messages = [
    {
      message: 'example message',
      signature: {
        value:
          '0x30094f45a892156fe1f79254674fdebe69da314b72371f3665aecdc486fd6233b7729571bf12765bb80cf07bd81846634a5a2e60045f492a492e2b40eee8ac8b',
        format: 'hex'
      } as Signature
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: 'b9a7091ad33077761052c00f44227a9a!ff56d06348ae96d9df03f811667a08!2b08382f04eb77bf66c5cab27d06f25a'
    }
  ]
}
