import BigNumber from 'bignumber.js'
import { AEProtocol } from '../../../lib'
import { AEProtocolStub } from '../stubs/ae.stub'
import { TestProtocolSpec } from '../implementations'

// Test Mnemonic:
// mango club state husband keen fiber float jelly major include horse infant square spike equip caught version must pen swim setup right poem economy
// Entropy: 8725875337f79aab564bbe866e4db739ad37a3930923f2d24289edfc4973a9c2
// Private Key: 65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9
// Public Key: d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9

export class AETestProtocolSpec extends TestProtocolSpec {
  name = 'Aeternity'
  lib = new AEProtocol()
  stub = new AEProtocolStub()
  wallet = {
    privateKey:
      '65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    publicKey: 'd64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    addresses: ['ak_2eid5UDLCVxNvqL95p9UtHmHQKbiFQahRfoo839DeQuBo8A3Qc'],
    // addresses: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7'],
    tx: {
      amount: new BigNumber('10'),
      fee: new BigNumber('1')
    }
  }
  txs = [
    {
      /*
        HEX of Unsigned TX includes:
        sender_id: 'ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7',
        recipient_id: 'ak_2eid5UDLCVxNvqL95p9UtHmHQKbiFQahRfoo839DeQuBo8A3Qc',
        amount: 10,
        fee: 1,
        ttl: ? (maybe 1000),
        payload: ''
      */
      unsignedTx: {
        transaction:
          'tx_3BqfkeqNiTz3RAYHkjSzVXMcRYXV7gX7UxQ9mbVsQvEwq4U7rVLAjFt3FYfRKgzreiKKP57416xdKNZQb61FPPuii948YgGeA7GNSQAm5kTJjvSmN2ajpgomm1M2W3b28mCAT7YH',
        networkId: 'ae_mainnet'
      },
      signedTx:
        'tx_3nAx7VwmuafPWVYYjyiZjqsVFSbyD9utCzSW9NGY7JPaYGSGfbSxeXwF4skvGTa6z1fADWzVpQPS2gJVdGHgaPZRHVNzk18SKdimf447pYuLyiVPxtQr4yBunpGzKvS4tDxyHqWhziQgUuYcVc9RGRQWDMMPtp5NBXYgRkjU4b8FRnJPUG7ZDBSjMQzCZeLxDYF9QPrEwHxTu5ZoHPAXYdXNGieufxZQMbdk3aFkJMd9t'
    }
  ]
}
