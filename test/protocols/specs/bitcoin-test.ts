import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'

import { BitcoinTestnetProtocol, SignedTransaction } from '../../../src'
import { IACMessageDefinition } from '../../../src/serializer/v2/message'
import { TestProtocolSpec } from '../implementations'
import { BitcoinTestnetProtocolStub } from '../stubs/bitcoin-test.stub'

export class BitcoinTestProtocolSpec extends TestProtocolSpec {
  public name = 'Bitcoin Testnet'
  public lib = new BitcoinTestnetProtocol()
  public stub = new BitcoinTestnetProtocolStub()
  public validAddresses = []
  public wallet = {
    privateKey: 'tprv8fmGMwHA9QVZZzFAR77eLN6bursxXG4Jb59YnZKFyR8WG48s1JbpLuurf7LiRW3NEkkxR1mNmPcY9sWfrYMwFVDQKzJwhirzw8YpmFCYgEq',
    publicKey: 'tpubDCTJWMKQHnBETTGxJknEjmkiUtPtgbFDANkL55MZPgvu6YPddhRQXQXiqHZdfHwcoVNwTaHmS6DuNjcaYPRqVFkDogJdWSMLpSWSC4pNa3r',
    addresses: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX']
  }
  public txs = [
    {
      from: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
      to: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
      amount: new BigNumber('10'),
      fee: new BigNumber('27000'),
      unsignedTx: {
        ins: [
          {
            txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
            value: new BigNumber('10'),
            vout: 0,
            address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
            derivationPath: '0/0'
          },
          {
            txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
            value: new BigNumber('65000000'),
            vout: 0,
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
            recipient: 'mm3JNWeMUnFtGCqxphh4RAgXSAnhNz6LV5',
            isChange: true,
            value: new BigNumber('64973000')
          }
        ]
      },
      signedTx: `01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006b483045022100b08a74de56349455c7444acd4eba9e46aa4777eb4925203ba601f5d8765304e202205cafd944b3c92add0ed38a9603e19bac938e9bec6490b33d82d4b36d615df8210121024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0effffffffac6e065cabe8932e1accef482ccaebab8947b53e7e4963d4c5c722d26f57abe7000000006b483045022100d589a6c9a3c8cc4f7d05600b7d5e8a37ab7482671bc0d889671ab420fa2359210220635944edcea9947b7e40396ae41d1f0853deeef8f576a4112ace3366fe1b6453012102f75fcf06cbe5726214e6199dd7720230083fd3c4f5a984c209373684b1e010feffffffff020a000000000000001976a9141b6d966bb9c605b984151da9bed896145698c44288acc868df03000000001976a9143c95ddf9b6baf3086f3880b15900b21d970ddc9d88ac00000000`
    }
  ]

  public signedTransaction(tx: any): IACMessageDefinition[] {
    const protocol: IACMessageDefinition[] = super.signedTransaction(tx)
    const payload = protocol[0].data as SignedTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses

    return protocol
  }
}
