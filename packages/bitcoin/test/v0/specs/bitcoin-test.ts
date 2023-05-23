import { AirGapWalletStatus } from '@airgap/coinlib-core/wallet/AirGapWallet'

import { IACMessageDefinitionObject } from '../../../../serializer/src'
import { BitcoinTestnetProtocol, SignedBitcoinTransaction } from '../../../src/v0'
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
    addresses: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
    masterFingerprint: '',
    status: AirGapWalletStatus.ACTIVE
  }
  public txs = [
    {
      from: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
      to: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
      amount: '10',
      fee: '27000',
      unsignedTx: {
        ins: [
          {
            txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
            value: '10',
            vout: 0,
            address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
            derivationPath: '0/0'
          },
          {
            txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
            value: '65000000',
            vout: 0,
            address: 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX',
            derivationPath: '1/3'
          }
        ],
        outs: [
          {
            derivationPath: '',
            recipient: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
            isChange: false,
            value: '10'
          },
          {
            derivationPath: '4',
            recipient: 'miiQwEJY9fCG6GD1BFtnVuWRS6zaTnNafq',
            isChange: true,
            value: '64973000'
          }
        ]
      },
      signedTx: `01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006b483045022100e5236bea6922b626ad641a4882a5ac22bcd7adac97df014836941f91b3c32fe802203fd012f0d7baade4be83796348c9e5630c1f21f62500019c7eb95805daacdf9d0121024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0effffffffac6e065cabe8932e1accef482ccaebab8947b53e7e4963d4c5c722d26f57abe7000000006a47304402202c3b36a309cab5673996727fcadb7802f6ffb014ffe9e812c66f868ac15f47670220208adb66334813fad3a9995e6f82abc608639e504c03489749bffb3e95be3ba0012102f75fcf06cbe5726214e6199dd7720230083fd3c4f5a984c209373684b1e010feffffffff020a000000000000001976a9141b6d966bb9c605b984151da9bed896145698c44288acc868df03000000001976a91423133112acbd2276071912231a1c08874cfedbd688ac00000000`
    }
  ]

  public async signedTransaction(tx: any): Promise<IACMessageDefinitionObject[]> {
    const protocol: IACMessageDefinitionObject[] = await super.signedTransaction(tx)
    const payload = protocol[0].payload as SignedBitcoinTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses

    return protocol
  }
}
