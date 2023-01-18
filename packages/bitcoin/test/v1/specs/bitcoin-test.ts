// tslint:disable: no-object-literal-type-assertion
import { Amount, ExtendedPublicKey, ExtendedSecretKey } from '@airgap/module-kit'

import { BitcoinSignedTransaction, BitcoinUnits, BitcoinUnsignedTransaction, createBitcoinTestnetProtocol } from '../../../src/v1'
import { XPubResponse } from '../../../src/v1/types/indexer'
import { TestProtocolSpec } from '../implementations'
import { BitcoinTestnetProtocolStub } from '../stubs/bitcoin-test.stub'

export class BitcoinTestProtocolSpec extends TestProtocolSpec {
  public name = 'Bitcoin Testnet'
  public lib = createBitcoinTestnetProtocol()
  public stub = new BitcoinTestnetProtocolStub()
  public validAddresses = []
  public wallet = {
    extendedSecretKey: {
      type: 'xpriv',
      format: 'encoded',
      value: 'tprv8fmGMwHA9QVZZzFAR77eLN6bursxXG4Jb59YnZKFyR8WG48s1JbpLuurf7LiRW3NEkkxR1mNmPcY9sWfrYMwFVDQKzJwhirzw8YpmFCYgEq'
    } as ExtendedSecretKey,
    extendedPublicKey: {
      type: 'xpub',
      format: 'encoded',
      value: 'tpubDCTJWMKQHnBETTGxJknEjmkiUtPtgbFDANkL55MZPgvu6YPddhRQXQXiqHZdfHwcoVNwTaHmS6DuNjcaYPRqVFkDogJdWSMLpSWSC4pNa3r'
    } as ExtendedPublicKey,
    addresses: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX']
  }
  public txs = [
    {
      from: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
      to: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
      amount: { value: '10', unit: 'blockchain' } as Amount<BitcoinUnits>,
      fee: { value: '27000', unit: 'blockchain' } as Amount<BitcoinUnits>,
      unsignedTx: {
        type: 'unsigned',
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
      } as BitcoinUnsignedTransaction,
      signedTx: {
        type: 'signed',
        from: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
        to: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
        amount: '10',
        fee: '27000',
        transaction:
          '01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006b483045022100e5236bea6922b626ad641a4882a5ac22bcd7adac97df014836941f91b3c32fe802203fd012f0d7baade4be83796348c9e5630c1f21f62500019c7eb95805daacdf9d0121024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0effffffffac6e065cabe8932e1accef482ccaebab8947b53e7e4963d4c5c722d26f57abe7000000006a47304402202c3b36a309cab5673996727fcadb7802f6ffb014ffe9e812c66f868ac15f47670220208adb66334813fad3a9995e6f82abc608639e504c03489749bffb3e95be3ba0012102f75fcf06cbe5726214e6199dd7720230083fd3c4f5a984c209373684b1e010feffffffff020a000000000000001976a9141b6d966bb9c605b984151da9bed896145698c44288acc868df03000000001976a91423133112acbd2276071912231a1c08874cfedbd688ac00000000'
      } as BitcoinSignedTransaction
    }
  ]

  public transactionList(xpub: string): { first: XPubResponse; next: XPubResponse } {
    const first: XPubResponse = {
      page: 1,
      totalPages: 2,
      itemsOnPage: 2,
      address: xpub,
      balance: '260279',
      totalReceived: '1911697',
      totalSent: '1651418',
      unconfirmedBalance: '0',
      unconfirmedTxs: 0,
      txs: 3,
      transactions: [
        {
          txid: 'a8250db2926a58f1789db8e0bd0ee0ef3eed1e12029baee091e3a095c1ce275a',
          version: 1,
          vin: [
            {
              txid: '2f14240cd23604c352ee0a6924d46e537daa4e2c5411df6e4109b0f673643ea4',
              vout: 1,
              sequence: 4294967295,
              n: 0,
              addresses: ['18nZGL714Ru5ggE4fxoWRGjwA3oRayRAAc'],
              isAddress: true,
              isOwn: true,
              value: '298383',
              hex:
                '47304402206c12c9c08bfd06e44587341e04b896e1d2148ccb7a38596a43b0f96f44d95fcb0220631db7c1a388eae32ba6a77b736e16ad5e6f319956c6dd8055eed60fc23686da0121029cb3c9cf3df791086f62844fa8afc1ab2ea1b9be6c010a92b07c5119c3192196'
            }
          ],
          vout: [
            {
              value: '50000',
              n: 0,
              spent: true,
              hex: '00145767bf963179b8bbe1635623d097cde2cd138fd7',
              addresses: ['bc1q2anml9330xuthctr2c3ap97dutx38r7hnfu8kr'],
              isAddress: true
            },
            {
              value: '246279',
              n: 1,
              hex: '76a91455f57221190ea0db39bb6bbdf66a1c1f754b262a88ac',
              addresses: ['18qWUBSPpoWSEb4GjJEZPiWLqGtYgwNznY'],
              isAddress: true,
              isOwn: true
            }
          ],
          blockHash: '0000000000000000000566dc611ec8175a312afce07a9d02921c0e300969fb75',
          blockHeight: 733671,
          confirmations: 30847,
          blockTime: 1650989179,
          value: '296279',
          valueIn: '298383',
          fees: '2104',
          hex:
            '0100000001a43e6473f6b009416edf11542c4eaa7d536ed424690aee52c30436d20c24142f010000006a47304402206c12c9c08bfd06e44587341e04b896e1d2148ccb7a38596a43b0f96f44d95fcb0220631db7c1a388eae32ba6a77b736e16ad5e6f319956c6dd8055eed60fc23686da0121029cb3c9cf3df791086f62844fa8afc1ab2ea1b9be6c010a92b07c5119c3192196ffffffff0250c30000000000001600145767bf963179b8bbe1635623d097cde2cd138fd707c20300000000001976a91455f57221190ea0db39bb6bbdf66a1c1f754b262a88ac00000000'
        },
        {
          txid: '2f14240cd23604c352ee0a6924d46e537daa4e2c5411df6e4109b0f673643ea4',
          version: 1,
          vin: [
            {
              txid: '9b483fba71dfa83201483369dd0de8a5a4597879bb161fc998da85f4841f5473',
              vout: 1,
              sequence: 4294967295,
              n: 0,
              addresses: ['1BQEKFQMt3gnBxWsTFaB1a6n54CiL9LkJv'],
              isAddress: true,
              isOwn: true,
              value: '301518',
              hex:
                '47304402203e2de60e78b3ef4e48903c0fa04cd326eaed558373a957134138767c6fe889080220323dad6adf16f2c3be2c403eabe0aeee57b8142c024e5c4bfea8fb2d7ae6d7d8012102d249e8e145cd3440961a084face27238af7f1db8a6a960b04a1796d7479785f7'
            }
          ],
          vout: [
            {
              value: '900',
              n: 0,
              spent: true,
              hex: '001426c70090845e753c68feb48056e8aad40fed64de',
              addresses: ['bc1qymrspyyyte6nc687kjq9d6926s876ex7k5u3p3'],
              isAddress: true
            },
            {
              value: '298383',
              n: 1,
              spent: true,
              hex: '76a9145566881a12a4b061855a920280ecc907697b325088ac',
              addresses: ['18nZGL714Ru5ggE4fxoWRGjwA3oRayRAAc'],
              isAddress: true,
              isOwn: true
            }
          ],
          blockHash: '00000000000000000006d646e14c071cb6ce38e9e1bcf52ad4fb021aa6992e1a',
          blockHeight: 707092,
          confirmations: 57426,
          blockTime: 1635419944,
          value: '299283',
          valueIn: '301518',
          fees: '2235',
          hex:
            '010000000173541f84f485da98c91f16bb797859a4a5e80ddd6933480132a8df71ba3f489b010000006a47304402203e2de60e78b3ef4e48903c0fa04cd326eaed558373a957134138767c6fe889080220323dad6adf16f2c3be2c403eabe0aeee57b8142c024e5c4bfea8fb2d7ae6d7d8012102d249e8e145cd3440961a084face27238af7f1db8a6a960b04a1796d7479785f7ffffffff02840300000000000016001426c70090845e753c68feb48056e8aad40fed64de8f8d0400000000001976a9145566881a12a4b061855a920280ecc907697b325088ac00000000'
        }
      ]
    }

    const next: XPubResponse = {
      page: 2,
      totalPages: 2,
      itemsOnPage: 10,
      address: xpub,
      balance: '260279',
      totalReceived: '1911697',
      totalSent: '1651418',
      unconfirmedBalance: '0',
      unconfirmedTxs: 0,
      txs: 3,
      transactions: [
        {
          txid: '9b483fba71dfa83201483369dd0de8a5a4597879bb161fc998da85f4841f5473',
          version: 1,
          vin: [
            {
              txid: '89bd7f15259ba64efc8425c62988c5d773bac0e0116343a9b420157391ad9963',
              vout: 1,
              sequence: 4294967295,
              n: 0,
              addresses: ['1ByRdzRff99FoaacPkBkLxxNb4pLM3jfk7'],
              isAddress: true,
              isOwn: true,
              value: '335957',
              hex:
                '4730440220248586117c9596be377a2c682b4915b007308785b45d8293c6fb278ce74baf98022001fa5d69c7223d50e94d9b792457187c7e931bd42f95ab82252e9bebf0017b420121033b1694fe454fd7aaffe825856fb43fcb9bb681a0f71bbd17494d286a321d0a53'
            }
          ],
          vout: [
            {
              value: '30000',
              n: 0,
              spent: true,
              hex: 'a9147cb88274f1b48e74d69f7a18a51bce6c6007439e87',
              addresses: ['3D4UkHKokagbaDJ8toLwVDvy2r8xkbPG3C'],
              isAddress: true
            },
            {
              value: '301518',
              n: 1,
              spent: true,
              hex: '76a9147215f07fbe64128d515b503c74a8cc532a6de47c88ac',
              addresses: ['1BQEKFQMt3gnBxWsTFaB1a6n54CiL9LkJv'],
              isAddress: true,
              isOwn: true
            }
          ],
          blockHash: '0000000000000000000adda86985b0f2425a087d0e63c78b4d97d5c0bcff9e70',
          blockHeight: 703490,
          confirmations: 61028,
          blockTime: 1633343748,
          value: '331518',
          valueIn: '335957',
          fees: '4439',
          hex:
            '01000000016399ad91731520b4a9436311e0c0ba73d7c58829c62584fc4ea69b25157fbd89010000006a4730440220248586117c9596be377a2c682b4915b007308785b45d8293c6fb278ce74baf98022001fa5d69c7223d50e94d9b792457187c7e931bd42f95ab82252e9bebf0017b420121033b1694fe454fd7aaffe825856fb43fcb9bb681a0f71bbd17494d286a321d0a53ffffffff02307500000000000017a9147cb88274f1b48e74d69f7a18a51bce6c6007439e87ce990400000000001976a9147215f07fbe64128d515b503c74a8cc532a6de47c88ac00000000'
        }
      ]
    }

    return { first, next }
  }
}
