// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey } from '@airgap/module-kit'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'
import { sr25519Verify, waitReady } from '@polkadot/wasm-crypto'

import { AcurastUnits } from '../../../src/v1'
import { AcurastProtocolImpl } from '../../../src/v1/protocol/AcurastProtocol'
import { TestProtocolSpec } from '../implementations'
import { AcurastProtocolStub } from '../stubs/acurast.stub'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/
// Private Key: d08bc6388fdeb30fc34a8e0286384bd5a84b838222bb9b012fc227d7473fc87aa2913d02297653ce859ccd6b2c057f7e57c9ef6cc359300a891c581fb6d03141
// Public Key: 52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10
// Hex Seed: 55a1417bbfacd64e069b4d07e47fb34ce9ff53b15556698038604f002524aec0
// Address (Acurast SS58): 5DwNsYGaFEL7ZKBUDLBa6xBg3wbicC2DUeJR2NMr7AM9FaJV
export class AcurastTestProtocolSpec extends TestProtocolSpec<AcurastUnits> {
  public name = 'Acurast'
  public lib = new AcurastProtocolImpl()
  public stub = new AcurastProtocolStub()

  public validAddresses = [
    '5DwNsYGaFEL7ZKBUDLBa6xBg3wbicC2DUeJR2NMr7AM9FaJV',
    '5DFMUQiYhjLRo3vLoZLto1uL8bHZBXnEkZG7yRSTA17u68Yk',
    '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
    '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
    '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
    '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'
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
    derivationPath: `m/`,
    addresses: ['5DwNsYGaFEL7ZKBUDLBa6xBg3wbicC2DUeJR2NMr7AM9FaJV']
  }

  public txs = [
    {
      from: this.wallet.addresses,
      to: this.wallet.addresses,
      amount: {
        value: '1000000000000',
        unit: 'blockchain'
      } as Amount<AcurastUnits>,
      fee: {
        value: '1000000000',
        unit: 'blockchain'
      } as Amount<AcurastUnits>,
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
          '1503' + // era
          '08' + // nonce
          '00' + // tip
          '0a03' + // moduleId + callId
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
          '070010a5' + // value
          // payload
          'd4e8' + // payload length
          'a903' +
          Buffer.from(
            '0a03' + // moduleId + callId
              '00' + // MultiAddress type
              '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
              '070010a5' + // value
              'd4e8' + // payload length
              '1503' + // era
              '08' + // nonce
              '00' + // tip
              '1e000000' + // specVersion
              '01000000' + // transactionVersion
              'dfea37d4892a3588124f357ad36eaf545905de18c510c02604bb23354fd2bded' + // genesis hash
              '544452e78ab8a42c5a0508de1a57dd36bae940a45201c4f461becc2ca504c33b' // block hash
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
          '86d66b8aa8a49d7b39d8f0da894d68214f276f4051ce5616a6713328e4f0a375' + // signature
          '4116106c19f6a514bebce3b5716c7a420a49ad68de9997d705a5be5ed7b5e283' + // signature
          '1503' + // era
          '08' + // nonce
          '00' + // tip
          '0a03' + // moduleId + callId
          '00' + // MultiAddress type
          '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
          '070010a5' + // value
          // payload
          'd4e8' + // payload length
          Buffer.from(
            '0a03' + // moduleId + callId
              '00' + // MultiAddress type
              '52e1d70619678f95a0806fa5eb818fc938cd5f885a19c3fb242d0b0d0620ee10' + // AccountId destination
              '070010a5' + // value
              '1503' + // era
              '08' + // nonce
              '00' + // tip
              '1e000000' + // specVersion
              '01000000' + // transactionVersion
              'dfea37d4892a3588124f357ad36eaf545905de18c510c02604bb23354fd2bded' + // genesis hash
              '544452e78ab8a42c5a0508de1a57dd36bae940a45201c4f461becc2ca504c33b' // block hash
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
