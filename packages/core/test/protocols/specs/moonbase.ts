import { AirGapWalletStatus, MoonbaseProtocol } from '../../../src'
import keccak = require('../../../src/dependencies/src/keccak-1.0.2/js')
import * as secp256k1 from '../../../src/dependencies/src/secp256k1-4.0.2/elliptic'
import { SubstrateNetwork } from '../../../src/protocols/substrate/SubstrateNetwork'
import { TestProtocolSpec } from '../implementations'
import { MoonbaseProtocolStub } from '../stubs/moonbase.stub'

/*
 * Test Mnemonic: leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
 *
 */
// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/44'/60'/0'/0/0
// Private Key: 548cef3b36e24a05870d80354900cab73082491907f162b1453f8b14bbf6f61f
// Public Key: 031bbd0cdadbef925d173e592c80c86d7917076d5b07ce79537867755f5d1dcc57
// Hex Seed: 55decc156b78772b5ae97cc4a7a4780c4b299d866abed355a8a6649905eadef4d28f76ff7491526addff6c03f3b200ebaa81dacd9f24def6ec88339a19562b91
// Address: 0xB6bC7946dFd3B9128777414c02296273ee6bBd0e
export class MoonbaseTestProtocolSpec extends TestProtocolSpec {
  public name = 'Moonbeam'
  public lib = new MoonbaseProtocol()
  public stub = new MoonbaseProtocolStub()

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
    privateKey: '548cef3b36e24a05870d80354900cab73082491907f162b1453f8b14bbf6f61f',
    publicKey: '031bbd0cdadbef925d173e592c80c86d7917076d5b07ce79537867755f5d1dcc57',
    addresses: ['0xB6bC7946dFd3B9128777414c02296273ee6bBd0e'],
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
      },
      signedTx:
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
    }
  ]

  public verifySignature = async (publicKey: string, tx: any): Promise<boolean> => {
    const decoded = this.lib.options.transactionController.decodeDetails(tx)[0]

    const signature = decoded.transaction.signature.signature.value
    const message = keccak('keccak256').update(Buffer.from(decoded.payload, 'hex')).digest()
    const publicKeyBuffer = Buffer.from(publicKey, 'hex')

    return secp256k1.ecdsaVerify(signature.slice(0, 64), message, publicKeyBuffer)
  }

  public seed(): string {
    return '55decc156b78772b5ae97cc4a7a4780c4b299d866abed355a8a6649905eadef4d28f76ff7491526addff6c03f3b200ebaa81dacd9f24def6ec88339a19562b91'
  }

  public mnemonic(): string {
    return 'food talent voyage degree siege clever account medal film remind good kind'
  }

  public messages = []

  public encryptAES = []

  public transactionResult = {
    transactions: [
      {
        protocolIdentifier: 'moonbeam',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://rpc.testnet.moonbeam.network',
          blockExplorer: { blockExplorer: 'https://moonbase.subscan.io/' },
          extras: { apiUrl: 'https://moonbase.subscan.io/api/scan', network: SubstrateNetwork.MOONBEAM }
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
        protocolIdentifier: 'moonbeam',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://rpc.testnet.moonbeam.network',
          blockExplorer: { blockExplorer: 'https://moonbase.subscan.io/' },
          extras: { apiUrl: 'https://moonbase.subscan.io/api/scan', network: SubstrateNetwork.MOONBEAM }
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
        protocolIdentifier: 'moonbeam',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://rpc.testnet.moonbeam.network',
          blockExplorer: { blockExplorer: 'https://moonbase.subscan.io/' },
          extras: { apiUrl: 'https://moonbase.subscan.io/api/scan', network: SubstrateNetwork.MOONBEAM }
        },
        from: ['0x8925639D43eB0298E95FfEfC792E8d23b7d06cbD'],
        to: ['0x944e005444aafFE1bC57C9869b51033b7a7630C1'],
        isInbound: false,
        amount: '15966000000000',
        fee: '2599999026',
        timestamp: 1601030652,
        hash: '0xd02429787c9f28692018a2147ad093222857e686563c1166a1338fa9b624b9d3',
        blockHeight: 4199759,
        status: 'applied'
      },
      {
        protocolIdentifier: 'moonbeam',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://rpc.testnet.moonbeam.network',
          blockExplorer: { blockExplorer: 'https://moonbase.subscan.io/' },
          extras: { apiUrl: 'https://moonbase.subscan.io/api/scan', network: SubstrateNetwork.MOONBEAM }
        },
        from: ['0x8925639D43eB0298E95FfEfC792E8d23b7d06cbD'],
        to: ['0x944e005444aafFE1bC57C9869b51033b7a7630C1'],
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

/*
-045105011e0000000002286beed90184b6bc7946dfd3b9128777414c02296273ee6bbd0e6e015cfa75bbeb40b9555fb3e63fc8065f8888adae35d6776029435da40e592650d0b48004dc4ca6556bce3c592b862b0aeea985b1b7039c370ce64508a3c86a1c850304000300b6bc7946dfd3b9128777414c02296273ee6bbd0e070010a5d4e8410330333030423662433739343664466433423931323837373734313463303232393632373365653662426430653037303031306135643465383835303330343030316530303030303030313030303030306435313532326339656637626134653039393066376134353237646537396166636163393932616239376162626263333637323266386132373138396231373033336137613734353834393334376365333030386330373236386265363364386365666433656636316465306337333138653838613537376662376432366139

+045105011e0000000002286beed90184b6bc7946dfd3b9128777414c02296273ee6bbd0e6e015cfa75bbeb40b9555fb3e63fc8065f8888adae35d6776029435da40e5926af2f4b7ffb23b359aa9431c3a6d479d3afc03360fd919c9f88c57847c79278d700850304000300b6bc7946dfd3b9128777414c02296273ee6bbd0e070010a5d4e8410330333030423662433739343664466433423931323837373734313463303232393632373365653662426430653037303031306135643465383835303330343030316530303030303030313030303030306435313532326339656637626134653039393066376134353237646537396166636163393932616239376162626263333637323266386132373138396231373033336137613734353834393334376365333030386330373236386265363364386365666433656636316465306337333138653838613537376662376432366139

*/
