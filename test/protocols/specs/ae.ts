import BigNumber from 'bignumber.js'
import { AEProtocol } from '../../../lib'
import { AEProtocolStub } from '../stubs/ae.stub'
import { TestProtocolSpec } from '../implementations'

// Test Mnemonic:
// mango club state husband keen fiber float jelly major include horse infant square spike equip caught version must pen swim setup right poem economy
// Entropy: 8725875337f79aab564bbe866e4db739ad37a3930923f2d24289edfc4973a9c2
// Private Key: 65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196
// Public Key: d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9
// HEX Seed: a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c

export class AETestProtocolSpec extends TestProtocolSpec {
  name = 'Aeternity'
  lib = new AEProtocol()
  stub = new AEProtocolStub()
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
      /*
        HEX of Unsigned TX includes:
        sender_id: 'ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7',
        recipient_id: 'ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7',
        amount: 10,
        fee: 1,
        ttl: ? (maybe 1000),
        payload: ''
      */
      to: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7'],
      from: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7'],
      unsignedTx: {
        transaction:
          'tx_7WcPFuQ1mXzeHhN6jzxNUzz82bRN64RAocAamXGYuhV4NgQCF8tve1nGx8wm8XFy2UhkKzJ93LGXFtVZtYhVwgJBYRDNqztPA77dpdFx6fCs1gLJxBevJytJyJLns6AMNpbHR',
        networkId: 'ae_mainnet'
      },
      signedTx:
        'tx_9GpbAwTPYqiT1oQrhPgF6j8UudBbN6dAgdYGRPoVfqjfM2PwX3r34E67MCm9UMvaCjt4Hf5iHENPWgSEjMLAKdHDPVgeCdEJ9dWWhttXobXqWjXpf7xNcUg5ojVGCUYLyM5Lc7yU7fQpCZNwu76jnpDGRbaFnYV9SLPWpN82u1DkUsEmggMtPAku6kq5RYNJBvmKn315yCzgxwzQZtKkxdxnekZzvsCktfmaTMPupM'
    }
  ]

  seed() {
    return 'a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c'
  }
}
