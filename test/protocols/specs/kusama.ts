import { TestProtocolSpec } from '../implementations'
import { KusamaProtocolStub } from '../stubs/kusama.stub'
import { KusamaProtocol } from '../../../src/protocols/substrate/implementations/KusamaProtocol'

/*
 * Test Mnemonic: leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
 *
 */
// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Private Key: c8b52238e081997d95912bf1c609899bc8710d66b517a1b491e75ce30db15616df3729c7fb254aa1656b7026a07012fd8aa869e0c364d1473f78d852dbfc0d85
// Public Key: c8d937dc1c18a455cd16175b8c67dd64288e73091afb5818d77f0369c768655b
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Kusama SS58): H7fd2hRFkbnrAapqAGBABwyypuN5LB9huF79tNJbRaAkb5F
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
    addresses: ['ESzXrcSsbM3Jxzuz2zczuYgCXsxQrqPw29AR2doaxZdzemT']
  }

  public txs = [
    {
      from: this.wallet.addresses,
      to: this.wallet.addresses,
      amount: '1000000000000',
      fee: '1000000000',
      unsignedTx: {
        encoded:
          '042504' + // number of txs + tx length
          '00' + // type
          '02286bee' + // fee
          // transaction
          '3902' + // length
          '84' + // signed flag (not signed)
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId signer
          '00' + // signature type (sr25519)
          '0000000000000000000000000000000000000000000000000000000000000000' + // signature
          '0000000000000000000000000000000000000000000000000000000000000000' + // signature
          '8503' + // era
          '04' + // nonce
          '00' + // tip
          '0400' + // moduleId + callId
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
          '070010a5d4e8' + // value
          // payload
          '040052e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10070010a5d4e8850304000400000001000000d51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b17033a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9'
      },
      signedTx:
        '042504' + // number of txs + tx length
        '00' + // type
        '02286bee' + // fee
        // transaction
        '3902' + // length
        '84' + // signed flag (signed)
        '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId signer
        '01' + // signature type (sr25519)
        '3ca263011746baf6301fafcd530330962e13c4b4d947eeb4b7daf1c8d7915552' + // signature
        'a36b9904cb734eb72222beaa301bdca12567f351bf9543ebaa1a3bdcabbc5d8a' + // signature
        '8503' + // era
        '04' + // nonce
        '00' + // tip
        '0400' + // moduleId + callId
        '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
        '070010a5d4e8' + // value
        // payload
        '040052e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10070010a5d4e8850304000400000001000000d51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b17033a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9'
    }
  ]

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
}
