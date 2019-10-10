import BigNumber from 'bignumber.js'

import { EthereumProtocol } from '../../../src'
import { RawEthereumTransaction } from '../../../src/serializer/unsigned-transactions/ethereum-transactions.serializer'
import { TestProtocolSpec } from '../implementations'
import { EthereumProtocolStub } from '../stubs/ethereum.stub'

import { SignedEthereumTransaction } from './../../../src/serializer/signed-transactions/ethereum-transactions.serializer'
import { EthereumTransactionValidator } from './../../../src/serializer/unsigned-transactions/ethereum-transactions.validator'

export class EthereumTestProtocolSpec extends TestProtocolSpec {
  public name = 'Ethereum'
  public lib = new EthereumProtocol()
  public stub = new EthereumProtocolStub()
  public validAddresses = [
    '0x8743Dc4A423E33Cb2f5808c0039E56D764b03257',
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
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e']
  }
  public txs = [
    {
      amount: new BigNumber('1000000000000000000'),
      fee: new BigNumber('420000000000000'),
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      unsignedTx: {
        nonce: '0x0',
        gasPrice: '0x4a817c800',
        gasLimit: '0x5208',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0xde0b6b3a7640000',
        chainId: 1,
        data: '0x'
      },
      signedTx:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]
  public validRawTransactions: RawEthereumTransaction[] = [
    {
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

  public validSignedTransactions: SignedEthereumTransaction[] = [
    {
      accountIdentifier: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      transaction:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]

  public validator = new EthereumTransactionValidator()
}
