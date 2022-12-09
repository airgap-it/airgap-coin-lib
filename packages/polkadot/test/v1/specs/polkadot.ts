// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey, Signature } from '@airgap/module-kit'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'
import { sr25519Verify, waitReady } from '@polkadot/wasm-crypto'

import { PolkadotUnits } from '../../../src/v1'
import { PolkadotProtocolImpl } from '../../../src/v1/protocol/PolkadotProtocol'
import { TestProtocolSpec } from '../implementations'
import { PolkadotProtocolStub } from '../stubs/polkadot.stub'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/
// Private Key: d08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141
// Public Key: 52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Polkadot SS58): 12sg1sXe71bazrBzAyEaF71puZbNJVaMZ92uBfMCfFNfSA9P
export class PolkadotTestProtocolSpec extends TestProtocolSpec<PolkadotUnits> {
  public name = 'Polkadot'
  public lib = new PolkadotProtocolImpl()
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
    addresses: ['12sg1sXe71bazrBzAyEaF71puZbNJVaMZ92uBfMCfFNfSA9P']
  }

  public txs = [
    {
      from: this.wallet.addresses,
      to: this.wallet.addresses,
      amount: {
        value: '1000000000000',
        unit: 'blockchain'
      } as Amount<PolkadotUnits>,
      fee: {
        value: '1000000000',
        unit: 'blockchain'
      } as Amount<PolkadotUnits>,
      unsignedTx: {
        type: 'unsigned',
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
          '0x98160df00de787087cd9599ff5e59ac8c99af6c53a319a96b0a9e1f6e634ce5fed9db553b759a115c3d9d6fcdd0f11705656bad16ea3ee9f20390f253c7cd58a',
        format: 'hex'
      } as Signature
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: 'a3677b19a6ba036288ec2261b620a805!15a385b47009a2b55f587ed9f897e2!f649bbcb1c46c48b0078dc7d40a642a9'
    }
  ]
}
