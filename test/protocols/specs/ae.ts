import BigNumber from 'bignumber.js'
import { AEProtocol } from '../../../src'
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
  validAddresses = [
    'ak_542o93BKHiANzqNaFj6UurrJuDuxU61zCGr9LJCwtTUg34kWt',
    'ak_hb4E2MwjH8vYctr3cimoSHfg8Hg8NdWYQfpGhprKdaurRbNfi',
    'ak_72TjHqojjETdkDTcERaTo2cgtXxCiNPL4dD3ZZjvFuS1VB7Xk',
    'ak_BPr8M9Uh4HLJgShZTR3Gmjk524MtH6duCXyTLy9E3D6PWs5q7',
    'ak_JRnrp9AvFUX5neTSHhU5tfnfd22uRc5HsmH3APXkZqC8QsNvw',
    'ak_BQJzP7iTnfCKe8vWhDtPNvXqC6TiKf59oPkLuHMqRMqqBWZ3a',
    'ak_DMNhUVW7xpNFFhs3pAwMzBeV8Q1o6tm57i1UdaxdRAQs39b8p',
    'ak_2P9fjzQeSbMwfRyCPUhXos8oG3mm8B5YJn2vpuR6hNwFf2BRdb',
    'ak_23Zr8vMCLxcMbFzvwv5pTePVeDHgXPzV2TCaLSS51NrTy5W91L',
    'ak_2cxpdq6npukgL2x5pm56Q6rqrE2BfQ1Kd62JxZioMJeKg3LP3T',
    'ak_27SFwPeBrgWaXnVgr51nKTN21DJq8B7jPeZ8oC59koEEnrmkSc'
  ]
  wallet = {
    privateKey:
      '65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    publicKey: 'd64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    addresses: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7']
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
      amount: new BigNumber('10000000000000000000'),
      fee: new BigNumber('1000000000000000000'),
      unsignedTx: {
        transaction:
          'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
        networkId: 'ae_mainnet'
      },
      signedTx:
        'tx_+KULAfhCuEBokDCnOXkU2G+pwrNXVQetMO1+2fQsnOeJKGcRl1S5toQAJRldCQb1VSkmF2yumQl11kmF2H6LpAH1npP71i0OuF34WwwBoQHWT2HsVlGefxDzWQjED3syiPs+vcD2xQSqlex4Djx/+aEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mIiscjBInoAACIDeC2s6dkAAAAAIAxkWE6'
    }
  ]

  seed() {
    return 'a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c'
  }
}
