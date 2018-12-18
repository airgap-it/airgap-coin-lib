import BigNumber from 'bignumber.js'
import { AEProtocolStub } from '../stubs/ae.stub'
import { TestProtocolSpec } from '../implementations'
import { TezosProtocol } from '../../../lib/protocols/TezosProtocol'
import { TezosProtocolStub } from '../stubs/tezos.stub'

// Test Mnemonic:
// mango club state husband keen fiber float jelly major include horse infant square spike equip caught version must pen swim setup right poem economy
// Entropy: 8725875337f79aab564bbe866e4db739ad37a3930923f2d24289edfc4973a9c2
// Private Key: 65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196
// Public Key: d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9
// HEX Seed: a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c

export class TezosTestProtocolSpec extends TestProtocolSpec {
  name = 'Tezos'
  lib = new TezosProtocol()
  stub = new TezosProtocolStub()
  wallet = {
    privateKey:
      '65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    publicKey: 'd64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    addresses: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7'],
    tx: {
      amount: new BigNumber('10000000000000000000'),
      fee: new BigNumber('1000000000000000000')
    }
  }
  txs = [
    {
      unsignedTx: {
        branch: 'BMHBtAaUv59LipV1czwZ5iQkxEktPJDE7A9sYXPkPeRzbBasNY8',
        contents: [
          {
            kind: 'transaction',
            source: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
            fee: '50000',
            counter: '3',
            gas_limit: '200',
            storage_limit: '0',
            amount: '100000000',
            destination: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN'
          }
        ]
      },
      signedTx: {
        protocol: 'PsYLVpVvgbLhAhoqAkMFUo6gudkJ9weNXhUYCiLDzcUpFpkk8Wt',
        branch: 'BLyypN89WuTQyLtExGP6PEuZiu5WFDxys3GTUf7Vz4KvgKcvo2E',
        contents: [
          {
            kind: 'transaction',
            source: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
            fee: '50000',
            counter: '3',
            gas_limit: '200',
            storage_limit: '0',
            amount: '100000000',
            destination: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN'
          }
        ],
        signature: 'edsigu5Cb8WEmUZzoeGSL3sbSuswNFZoqRPq5nXA18Pg4RHbhnFqshL2Rw5QJBM94UxdWntQjmY7W5MqBDMhugLgqrRAWHyH5hD'
      }
    }
  ]

  seed() {
    return 'a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c'
  }
}
