// tslint:disable: no-object-literal-type-assertion
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Amount, ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey } from '@airgap/module-kit'

import { createERC20Token, ERC20Token, EthereumSignedTransaction, EthereumUnits, EthereumUnsignedTransaction } from '../../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { ERC20TokenProtocolStub } from '../stubs/erc20-token.stub'

const MockERC20Token: ERC20Token = createERC20Token(
  {
    name: 'Mock ERC20',
    identifier: 'eth-erc20-mock',
    symbol: 'ETH',
    marketSymbol: 'eth',
    contractAddress: '0x2dd847af80418D280B7078888B6A6133083001C9',
    decimals: 18
  },
  {
    network: {
      chainId: 3
    }
  }
)

export class ERC20TokenTestProtocolSpec extends TestProtocolSpec<string, ERC20Token> {
  public name = 'Generic ERC20 Token'
  public lib = MockERC20Token
  public stub = new ERC20TokenProtocolStub()
  public validAddresses = ['0xb752b6dfe409ca926c78b1595bcf7442160c07c7']
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
        value: new BigNumber('5').shiftedBy(12).toString(10),
        unit: 'blockchain'
      } as Amount<EthereumUnits>,
      fee: {
        value: '31705000000000',
        unit: 'blockchain'
      } as Amount<EthereumUnits>,
      unsignedTx: {
        type: 'unsigned',
        ethereumType: 'raw',
        nonce: '0x50',
        gasLimit: '0x7bd9', // 31705
        gasPrice: '0x3b9aca00', // 1 gwei
        to: '0x2dd847af80418D280B7078888B6A6133083001C9', // contract address
        value: '0x0',
        chainId: 3,
        data: '0xa9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000000000048c27395000'
      } as EthereumUnsignedTransaction,
      signedTx: {
        type: 'signed',
        serialized:
          'f8a850843b9aca00827bd9942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000000000048c2739500029a055e262544c878642967939e9dc83fff796125a1c1ddff385d0f4371031a9ce74a02e2535e1b889fb2bb68f0b5a87f6273ff6736c8b5659f904751c976297165054'
      } as EthereumSignedTransaction
    }
  ]

  constructor(validAddresses: string[] = ['0xb752b6dfe409ca926c78b1595bcf7442160c07c7'], lib: ERC20Token = MockERC20Token) {
    super()
    this.lib = lib
    this.validAddresses = validAddresses
  }
}
