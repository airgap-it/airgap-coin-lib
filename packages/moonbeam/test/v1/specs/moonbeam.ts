// tslint:disable: no-object-literal-type-assertion
const keccak = require('@airgap/coinlib-core/dependencies/src/keccak-1.0.2/js')
import * as secp256k1 from '@airgap/coinlib-core/dependencies/src/secp256k1-4.0.2/elliptic'
import { Amount, PublicKey, SecretKey } from '@airgap/module-kit'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'

import { MoonbeamUnits } from '../../../src/v1'
import { MoonbeamProtocolImpl } from '../../../src/v1/protocol/MoonbeamProtocol'
import { TestProtocolSpec } from '../implementations'
import { MoonbeamProtocolStub } from '../stubs/moonbeam'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/44'/60'/0'/0/0
// Private Key: 548cef3b36e24a05870d80354900cab73082491907f162b1453f8b14bbf6f61f
// Public Key: 031bbd0cdadbef925d173e592c80c86d7917076d5b07ce79537867755f5d1dcc57
// Hex Seed: 55decc156b78772b5ae97cc4a7a4780c4b299d866abed355a8a6649905eadef4d28f76ff7491526addff6c03f3b200ebaa81dacd9f24def6ec88339a19562b91
// Address: 0xB6bC7946dFd3B9128777414c02296273ee6bBd0e
export class MoonbeamTestProtocolSpec extends TestProtocolSpec<MoonbeamUnits> {
  public name = 'Moonbeam'
  public lib = new MoonbeamProtocolImpl()
  public stub = new MoonbeamProtocolStub()

  public validAddresses = [
    '0x8925639D43eB0298E95FfEfC792E8d23b7d06cbD',
    '0x944e005444aafFE1bC57C9869b51033b7a7630C1',
    '0x16dE158cfCF64aa409500F2C82E5305211e0D4e1',
    '0xaABa95105e402eD13AB4B44738e7279fEDaDd686',
    '0x8C44c6169d10E5E422C28364c4deeEaD83d72B52',
    '0xB97224C27b232Dcf150C1f683d3bd01b1817f821',
    '0xE0f749Bde03E3a2185e51A5A489948Eb371aD53C',
    '0xdc065b9dcC4E20289A2869ce02Ea039f4c0f252E',
    '0x82b54235abb1bb90D197437D504Adf07fb93F7D5',
    '0xe6DFC410C539FEB97D2A1070fedf00dA575c5786',
    '0xFE73fb832eCD3ad4284D3CafA9265FE836521aB6'
  ]

  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value: '548cef3b36e24a05870d80354900cab73082491907f162b1453f8b14bbf6f61f'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: '031bbd0cdadbef925d173e592c80c86d7917076d5b07ce79537867755f5d1dcc57'
    } as PublicKey,
    addresses: ['0xB6bC7946dFd3B9128777414c02296273ee6bBd0e']
  }

  public txs = [
    {
      from: this.wallet.addresses,
      to: this.wallet.addresses,
      amount: {
        value: '1000000000000',
        unit: 'blockchain'
      } as Amount<MoonbeamUnits>,
      fee: {
        value: '1000000000',
        unit: 'blockchain'
      } as Amount<MoonbeamUnits>,
      unsignedTx: {
        type: 'unsigned',
        encoded:
          // tslint:disable-next-line: prefer-template
          '04' + // number of txs
          '5105' + // tx length
          '01' + // optional type (specVersion)
          '1e000000' + // specVersion
          '00' + // type
          '02286bee' + // fee
          // transaction
          'd901' + // length
          '84' + // signed flag (not signed)
          'B6bC7946dFd3B9128777414c02296273ee6bBd0e'.toLowerCase() + // AccountId signer
          '00000000000000000000000000000000000000000000000000000000000000000' + // signature
          '00000000000000000000000000000000000000000000000000000000000000000' + // signature
          '8503' + // era
          '04' + // nonce
          '00' + // tip
          '0300' + // moduleId + callId
          'B6bC7946dFd3B9128777414c02296273ee6bBd0e'.toLowerCase() + // AccountId destination
          '070010a5d4e8' + // value
          // payload
          '4103' + // payload length
          Buffer.from(
            '0300' + // moduleId + callId
              'B6bC7946dFd3B9128777414c02296273ee6bBd0e' + // AccountId destination
              '070010a5d4e8' + // value
              '8503' + // era
              '04' + // nonce
              '00' + // tip
              '1e000000' + // specVersion
              '01000000' + // transactionVersion
              'd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170' + // genesis hash
              '33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9' // block hash
          ).toString('hex') // payload
      } as SubstrateUnsignedTransaction,
      signedTx: {
        type: 'signed',
        encoded:
          // tslint:disable-next-line: prefer-template
          '04' + // number of txs
          '5105' + // tx length
          '01' + // optional type (specVersion)
          '1e000000' + // specVersion
          '00' + // type
          '02286bee' + // fee
          // transaction
          'd901' + // length
          '84' + // signed flag (signed)
          'B6bC7946dFd3B9128777414c02296273ee6bBd0e'.toLowerCase() + // AccountId signer
          '6e015cfa75bbeb40b9555fb3e63fc8065f8888adae35d6776029435da40e5926a' + // signature
          'f2f4b7ffb23b359aa9431c3a6d479d3afc03360fd919c9f88c57847c79278d700' + // signature
          '8503' + // era
          '04' + // nonce
          '00' + // tip
          '0300' + // moduleId + callId
          'B6bC7946dFd3B9128777414c02296273ee6bBd0e'.toLowerCase() + // AccountId destination
          '070010a5d4e8' + // value
          // payload
          '4103' + // payload length
          Buffer.from(
            '0300' + // moduleId + callId
              'B6bC7946dFd3B9128777414c02296273ee6bBd0e' + // AccountId destination
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
    const decoded = this.lib.transactionController.decodeDetails(tx.encoded)[0]

    const signature = decoded.transaction.signature.signature.value
    const message = keccak('keccak256').update(Buffer.from(decoded.payload, 'hex')).digest()
    const publicKeyBuffer = Buffer.from(publicKey.value, 'hex')

    return secp256k1.ecdsaVerify(signature.slice(0, 64), message, publicKeyBuffer)
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
