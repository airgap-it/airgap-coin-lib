// tslint:disable: no-object-literal-type-assertion
import { XPubResponse } from '@airgap/bitcoin/v1/types/indexer'
import { Amount, ExtendedPublicKey, ExtendedSecretKey, Signature } from '@airgap/module-kit'

import { createGroestlcoinProtocol, GroestlcoinSignedTransaction, GroestlcoinUnits, GroestlcoinUnsignedTransaction } from '../../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { GroestlcoinProtocolStub } from '../stubs/groestlcoin.stub'

export class GroestlcoinProtocolSpec extends TestProtocolSpec {
  public name = 'Groestlcoin'
  public lib = createGroestlcoinProtocol()
  public stub = new GroestlcoinProtocolStub()
  public validAddresses = [
    '3E2p6qP9vh4hFfuVQLsxTAziRDDHJ5DnQj',
    'Fdbvoe7cvqhUieb5ReFeCdhQxhSXuKjDDq',
    '34mYVANQZhdhVpEh3uodhBUUkbW75NFmN9',
    '38vZLCc9MmY5ATUGDBbpW4iGyU2KswjTup',
    'grs1q2udtu5tnqte7exezvj355s27ga297dxshal3kh',
    'grs1q3kfpul4l5nncmnq4npw8qp72rec9y7pxg3nxgs',
    'grs1qj4y2q2ds8wuq3vft3vve5sdadf03q0rxcnxzrv',
    'grs1q24gmqsv6p5rsyw0j2g0pat52jtdqzc02wpl22n',
    'grs1qhpa2lsfrkcmcq8yk8s3s0um7e7uta4vesnd4my',
    'grs1q2rk404unpxru0s27q6mdy2snrhegge8hd5zm4c',
    'grs1qfwqlkwadlmre94jucan05ctxxvdzf4suu63l0y',
    'grs1qtlpls5q9fq3jjwj9ewtt0a56uv05z4rewkvl66',
    'grs1qyl3d3zzdu66yy8u08x693j6sxgsg2xnz69e06f',
    'grs1qavkc8nk0y9f9ul0pgzvr8x5fffntu0mpv9mnu9',
    'grs1qpxhsxeytlwrhj2ssrqqj7s456wmp0d4n9mkl9w',
    '3QJx33XJjxupTo7mGyDCLqU9HpND8GFXFx',
    '3PaJn4UzvPsuke14qDErzsqTR2TtKzn5o7'
  ]
  public wallet = {
    extendedSecretKey: {
      type: 'xpriv',
      format: 'encoded',
      value: 'xprv9z5bsLrneShz9HWM7scd93351vWbBDjhZrPzAArempXENgjP6sCBdE86mXn2SjhbDP8YDYHeXbjH2tjqk365F8j4fMjsJ44e8bLSYzBeYKf'
    } as ExtendedSecretKey,
    extendedPublicKey: {
      type: 'xpub',
      format: 'encoded',
      value: 'xpub6D4xGrPgUpGHMmapDu9dWAyoZxM5agTYw5KaxZGGLA4DFV4XeQWSB2Sacmpf4KA2QoEuU2JDtDscuEGeELXEaQE2qXnMHEoyiEBaYmiTTUs'
    } as ExtendedPublicKey,
    addresses: ['Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz', 'FiEEq7G31QAsFfWFtWbMosVzUGQgtpUJsZ']
  }
  public txs = [
    {
      from: ['FiEEq7G31QAsFfWFtWbMosVzUGQgtpUJsZ', 'Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz'],
      to: ['FkPxwoFcgf16MpYka596GK3HV4SSiAPanR'],
      amount: { value: '60000000', unit: 'blockchain' } as Amount<GroestlcoinUnits>,
      fee: { value: '2000', unit: 'blockchain' } as Amount<GroestlcoinUnits>,
      unsignedTx: {
        type: 'unsigned',
        ins: [
          {
            txId: '859590b5fa94b477d6acfec3410d381a0aa2fe4f8a8c04f8519c4451e282b04d',
            value: '50000000',
            vout: 0,
            address: 'FiEEq7G31QAsFfWFtWbMosVzUGQgtpUJsZ',
            derivationPath: '0/1'
          },
          {
            txId: '8ad19fb60971488667333c184786bb6b24ecfe7599290683720d2631722e6e90',
            value: '50000000',
            vout: 0,
            address: 'Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz',
            derivationPath: '0/0'
          }
        ],
        outs: [
          {
            derivationPath: '',
            recipient: 'FkPxwoFcgf16MpYka596GK3HV4SSiAPanR',
            isChange: false,
            value: '60000000'
          },
          {
            derivationPath: '0',
            recipient: 'FkVmovQbcun3fZ34AnettSSKfxCWtsAvhA',
            isChange: true,
            value: '39998000'
          }
        ]
      } as GroestlcoinUnsignedTransaction,
      signedTx: {
        type: 'signed',
        from: ['FiEEq7G31QAsFfWFtWbMosVzUGQgtpUJsZ', 'Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz'],
        to: ['FkPxwoFcgf16MpYka596GK3HV4SSiAPanR'],
        amount: '60000000',
        fee: '2000',
        transaction: `01000000024db082e251449c51f8048c8a4ffea20a1a380d41c3feacd677b494fab5909585000000006a47304402203ce8c5dd56b3c9167fd844b859f8b3059ca0732d0ed21b5e9779a5a80835ee82022006eca776677015c7f22b72a4483c935b0a9b9a64f9a2d1a1ae4fed8c8834e2890121038d395851a535bfdafd632a2c39b814ce22b1f5735afcb55fe610575c9c13c8cdffffffff906e2e7231260d728306299975feec246bbb8647183c336786487109b69fd18a000000006a47304402200f72418052517c07f2c6874d10f87cf2b9b5f6f723235f8a6e561387d01ce442022010bc61de8381ffa15c920849e8dc19b5567e25ed2a8360c320e34754f0b54e84012103749df51ed0644de54fdb8f090150101e75c1496314a139cc4eade854dd08d7e2ffffffff0200879303000000001976a914a70b658a6125894f59f3bbcb87c486fe3f9cd91c88ac30526202000000001976a914a82498c2236dd3218a7b1d3b093d1c45da4b07f488ac00000000`
      } as GroestlcoinSignedTransaction
    }
  ]

  public messages = [
    {
      message: 'example message',
      signature: {
        value: 'IGplImxLTrtKuTACWK0TzvSNBgjkxxiCU8Wuk801l8Pga4Xv85LJb33SGCWSxWKd5mlCNjmdiprw+GIbjXBhHpc=',
        format: 'encoded'
      } as Signature
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '040f85434d002580b2844a0209e02d93ecc87a54aa141b3c8f1e82d5a1abfd59cb536ca26a5ab100e057438199e73ce16437f59eec4d12a3934c3baefa136027ebabf31948252b240aa1efb3ef61b8050db03e6c17885e5df9994647b8c242473da3e644b30416a9657fcc9244f1558c'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '41651d96e6bd7845f46c6214b787a502!24df07915ae8231fda1eac8c6f0c24!acf0b139906c9999481aa5dcaaf203d1'
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
