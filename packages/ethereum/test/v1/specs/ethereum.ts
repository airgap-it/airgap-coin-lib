// tslint:disable: no-object-literal-type-assertion
import { AirGapTransactionStatus, Amount, ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import {
  createEthereumProtocol,
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumUnits,
  EthereumUnsignedTransaction
} from '../../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { EthereumProtocolStub } from '../stubs/ethereum.stub'

export class EthereumTestProtocolSpec extends TestProtocolSpec {
  public name = 'Ethereum'
  public lib = createEthereumProtocol()
  public stub = new EthereumProtocolStub()
  public validAddresses = [
    '0x5e4e92788a7aE425100D869657aE91891af019BC',
    '0xEC7eF91eFB3737fc2749c0107fd428F6a878884c',
    '0xE8911B6Ad03Fc76A3248F1eA9babe85E5Cde086c',
    '0x14D8fB603edCb2d4038Aab0d0fa224E0c4D9c6f9',
    '0xF3f22E4740ade5DEB34bAff34c60d5FE33a8dA74',
    '0xcE25b34847A7Ac1d302cAf0633f74192A984118C',
    '0xD1279A75b8C106F4c478E8f63ffCa18d4b3D0A13',
    '0x967A77444DAE9e1Fa24FAb9D358ec32a69eb0684',
    '0x9f5B6fbFf7512c449cCF206Ac1cb3C2Aa5D71957',
    '0xEFC23d847a3297eFF70832429BDEc4986C3d8175'
  ]
  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value: '439fd4b07a55c50497d3a7cb9de505744476a44d1ab4da98beef3597351d1d7d'
    } as SecretKey,
    extendedSecretKey: {
      type: 'xpriv',
      format: 'encoded',
      value: 'xprv9y4dapcmTWDkwWHNXuYVGL11XTKac4tFZr3ybCCSyipvQxYimtY1qm27tFqMEHGUbEg929WqXfCbbimqMq7ASzNHTS9KFnoBZZiw44FMLkY'
    } as ExtendedSecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: '02cb897303c2bcbae35a4ccd7f70f7ed7f1b856a852be945cfd17393681e55333f'
    } as PublicKey,
    extendedPublicKey: {
      type: 'xpub',
      format: 'encoded',
      value: 'xpub6C3yzL9fHsn49zMqdw5VdTwk5VA51Xc6w4yaPac4Y4MuHkssKRrGPZLbjXtyNmNtN9YLum1GJ6hQmnePAe6HZ7b1aAm3mKNLLtfW4GSnsPk'
    } as ExtendedPublicKey,
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e']
  }
  public txs = [
    {
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      amount: {
        value: '1000000000000000000',
        unit: 'blockchain'
      } as Amount<EthereumUnits>,
      fee: {
        value: '420000000000000',
        unit: 'blockchain'
      } as Amount<EthereumUnits>,
      unsignedTx: {
        type: 'unsigned',
        nonce: '0x0',
        gasPrice: '0x4a817c800',
        gasLimit: '0x5208',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0xde0b6b3a7640000',
        chainId: 1,
        data: '0x'
      } as EthereumUnsignedTransaction,
      signedTx: {
        type: 'signed',
        serialized:
          'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
      } as EthereumSignedTransaction
    }
  ]
  public transactionStatusTests: Record<string, AirGapTransactionStatus>[] = [
    {
      '0x20904cf629692c925a235e98ccf5b317c56bbc069c0941b9e45af2f35a5b612b': { type: 'applied' }
    },
    {
      '0x4a50a2d30b2ab022819ff6407ccfcfb3905406729fed82208e2d07ed92cedbe1': { type: 'failed' }
    },
    {
      '0x20904cf629692c925a235e98ccf5b317c56bbc069c0941b9e45af2f35a5b612b': { type: 'applied' },
      '0x4a50a2d30b2ab022819ff6407ccfcfb3905406729fed82208e2d07ed92cedbe1': { type: 'failed' }
    }
  ]
  public validRawTransactions: EthereumRawUnsignedTransaction[] = [
    {
      type: 'unsigned',
      nonce: '0x0',
      gasPrice: '0x4a817c800',
      gasLimit: '0x5208',
      to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
      value: '0xde0b6b3a7640000',
      chainId: 1,
      data: '0x'
    }
  ]
  public invalidUnsignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'nonce',
      testName: 'Nonce',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'gasPrice',
      testName: 'Gas price',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'gasLimit',
      testName: 'Gas limit',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'to',
      testName: 'To',
      values: [
        { value: '0x', expectedError: [' is not a valid ethereum address'] }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string', ' is not a valid ethereum address'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string', ' is not a valid ethereum address'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string', ' is not a valid ethereum address'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string', ' is not a valid ethereum address'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'value',
      testName: 'Value',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    },
    {
      property: 'chainId',
      testName: 'Chain id',
      values: [
        { value: '0x', expectedError: [' is not a number'] }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not a number'] },
        { value: 0x0, expectedError: undefined },
        { value: 1, expectedError: undefined },
        { value: -1, expectedError: [' must be greater than or equal to 0'] },
        { value: undefined, expectedError: [" can't be blank"] },
        { value: null, expectedError: [" can't be blank"] }
      ]
    },
    {
      property: 'data',
      testName: 'Data',
      values: [
        { value: '0x', expectedError: undefined }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' is not hex string'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: 1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: -1, expectedError: [' is not of type "String"', ' is not hex string'] },
        { value: undefined, expectedError: [" can't be blank", ' is not hex string'] },
        { value: null, expectedError: [" can't be blank", ' is not hex string'] }
      ]
    }
  ]

  public invalidSignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'transaction',
      testName: 'Transaction',
      values: [
        { value: '0x', expectedError: [' not a valid Ethereum transaction'] }, // TODO: Valid?
        { value: '', expectedError: [" can't be blank", ' not a valid Ethereum transaction'] },
        { value: 0x0, expectedError: [' is not of type "String"', ' not a valid Ethereum transaction'] },
        { value: 1, expectedError: [' is not of type "String"', ' not a valid Ethereum transaction'] },
        { value: -1, expectedError: [' is not of type "String"', ' not a valid Ethereum transaction'] },
        { value: undefined, expectedError: [" can't be blank", ' not a valid Ethereum transaction'] },
        { value: null, expectedError: [" can't be blank", ' not a valid Ethereum transaction'] }
      ]
    }
  ]

  public validSignedTransactions: EthereumSignedTransaction[] = [
    {
      type: 'signed',
      serialized:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]

  public messages = [
    {
      message: 'example message',
      signature: {
        value:
          '0xa1f6730159726cd8def8058a5651e680328d898e26b81c2378079185b30ccb2e7e1e369cd82a9d55f2c8abdb0cbb1bfe07f0585327c475a1c35c83c6d32a8d2901',
        format: 'hex'
      } as Signature
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '047042daec1e399e3a5310cb045a789e212bb197098352ee7f8f2a273453ce837048f27ddd390655b0169f0769c8cb1e62c5bbef5bce95272829695abb9e6803974b6ae6cb550a638e079793c30b8e7fb1cb91c8f43097740d867034fb1a1c3c074451aba2c1d884c02875d0df266b03'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '8b209a372e8b3fd1ee6054769a4b5ce3!9da458363d5f4c8a9b9093569d0590!fa8fb2bb3addee77c43d1b9e82dcb050'
    }
  ]
}
