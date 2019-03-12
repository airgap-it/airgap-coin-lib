import BigNumber from 'bignumber.js'
import { DeserializedSyncProtocol, SignedTransaction, BitcoinTestnetProtocol } from '../../../lib'
import { BitcoinProtocolStub } from '../stubs/bitcoin.stub'
import { TestProtocolSpec } from '../implementations'

export class BitcoinTestProtocolSpec extends TestProtocolSpec {
  name = 'Bitcoin Testnet'
  lib = new BitcoinTestnetProtocol()
  stub = new BitcoinProtocolStub()
  validAddresses = []
  wallet = {
    privateKey: 'tprv8fmGMwHA9QVZZzFAR77eLN6bursxXG4Jb59YnZKFyR8WG48s1JbpLuurf7LiRW3NEkkxR1mNmPcY9sWfrYMwFVDQKzJwhirzw8YpmFCYgEq',
    publicKey: 'tpubDCTJWMKQHnBETTGxJknEjmkiUtPtgbFDANkL55MZPgvu6YPddhRQXQXiqHZdfHwcoVNwTaHmS6DuNjcaYPRqVFkDogJdWSMLpSWSC4pNa3r',
    addresses: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX']
  }
  txs = [
    {
      from: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
      to: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
      amount: new BigNumber('10'),
      fee: new BigNumber('27000'),
      unsignedTx: {
        ins: [
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('10'),
            vout: 0,
            address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
            derivationPath: '0/0'
          },
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('32418989'),
            vout: 1,
            address: 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX',
            derivationPath: '1/3'
          }
        ],
        outs: [
          {
            recipient: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
            isChange: false,
            value: new BigNumber('10')
          },
          {
            recipient: 'miiQwEJY9fCG6GD1BFtnVuWRS6zaTnNafq',
            isChange: true,
            value: new BigNumber('32391989')
          }
        ]
      },
      signedTx: `01000000029d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc000000006b483045022100b77ccca6c6d18e9e7a56a256f4a8c3269dd84985350dcce1d6a2a08e1aa47c4b02201cf2072aa0e242d4c89852d9a452d92aab79e7b2d955b2d065464a1ce7bc51600121024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0effffffff9d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc010000006a47304402203b3ad8fd4b2666c0e9f4696334e8c389b23a72d361989a73597d93c8cdf2563d022026ca52833000725509fe1b942d8eab4c0f730a29d271e4d7fe6db5b300e07a8b012102f75fcf06cbe5726214e6199dd7720230083fd3c4f5a984c209373684b1e010feffffffff020a000000000000001976a9141b6d966bb9c605b984151da9bed896145698c44288ac3543ee01000000001976a91423133112acbd2276071912231a1c08874cfedbd688ac00000000`
    }
  ]

  signedTransaction(tx: any): DeserializedSyncProtocol {
    const protocol: DeserializedSyncProtocol = super.signedTransaction(tx)
    const payload = protocol.payload as SignedTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses
    return protocol
  }
}
