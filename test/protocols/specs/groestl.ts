import { GroestlcoinProtocol, SignedBitcoinTransaction } from '../../../src'
import { IACMessageDefinitionObject } from '../../../src/serializer/message'
import { TestProtocolSpec } from '../implementations'
import { GroestlcoinProtocolStub } from '../stubs/groestlcoin.stub'

export class GroestlcoinProtocolSpec extends TestProtocolSpec {
  public name = 'Groestlcoin'
  public lib = new GroestlcoinProtocol()
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
    privateKey: 'xprv9z5bsLrneShz9HWM7scd93351vWbBDjhZrPzAArempXENgjP6sCBdE86mXn2SjhbDP8YDYHeXbjH2tjqk365F8j4fMjsJ44e8bLSYzBeYKf',
    publicKey: 'xpub6D4xGrPgUpGHMmapDu9dWAyoZxM5agTYw5KaxZGGLA4DFV4XeQWSB2Sacmpf4KA2QoEuU2JDtDscuEGeELXEaQE2qXnMHEoyiEBaYmiTTUs',
    addresses: ['Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz', 'FiEEq7G31QAsFfWFtWbMosVzUGQgtpUJsZ']
  }
  public txs = [
    {
      from: ['FiEEq7G31QAsFfWFtWbMosVzUGQgtpUJsZ', 'Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz'],
      to: ['FkPxwoFcgf16MpYka596GK3HV4SSiAPanR'],
      amount: '60000000',
      fee: '2000',
      unsignedTx: {
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
      },
      signedTx: `01000000024db082e251449c51f8048c8a4ffea20a1a380d41c3feacd677b494fab5909585000000006a47304402203ce8c5dd56b3c9167fd844b859f8b3059ca0732d0ed21b5e9779a5a80835ee82022006eca776677015c7f22b72a4483c935b0a9b9a64f9a2d1a1ae4fed8c8834e2890121038d395851a535bfdafd632a2c39b814ce22b1f5735afcb55fe610575c9c13c8cdffffffff906e2e7231260d728306299975feec246bbb8647183c336786487109b69fd18a000000006a47304402200f72418052517c07f2c6874d10f87cf2b9b5f6f723235f8a6e561387d01ce442022010bc61de8381ffa15c920849e8dc19b5567e25ed2a8360c320e34754f0b54e84012103749df51ed0644de54fdb8f090150101e75c1496314a139cc4eade854dd08d7e2ffffffff0200879303000000001976a914a70b658a6125894f59f3bbcb87c486fe3f9cd91c88ac30526202000000001976a914a82498c2236dd3218a7b1d3b093d1c45da4b07f488ac00000000`
    }
  ]

  public signedTransaction(tx: any): IACMessageDefinitionObject[] {
    const protocol: IACMessageDefinitionObject[] = super.signedTransaction(tx)
    const payload = protocol[0].payload as SignedBitcoinTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses

    return protocol
  }

  public messages = [
    {
      message: 'example message',
      signature: 'IGplImxLTrtKuTACWK0TzvSNBgjkxxiCU8Wuk801l8Pga4Xv85LJb33SGCWSxWKd5mlCNjmdiprw+GIbjXBhHpc='
    }
  ]

  public transactionResult = {
    transactions: [
      {
        hash: '1dac97c6f8f2023f972142ea646a493a64b521cf2b200b633113eb0061bb7ce8',
        from: [],
        to: ['3E2p6qP9vh4hFfuVQLsxTAziRDDHJ5DnQj', 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9'],
        isInbound: true,
        amount: '0',
        fee: '0',
        blockHeight: '3270952',
        protocolIdentifier: 'grs',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://chainz.cryptoid.info/grs' },
          extras: {
            indexerApi: 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://blockbook.groestlcoin.org',
            network: {
              messagePrefix: '\u001cGroestlCoin Signed Message:\n',
              bech32: 'grs',
              bip32: { public: 76067358, private: 76066276 },
              pubKeyHash: 36,
              scriptHash: 5,
              wif: 128,
              coin: 'grs',
              hashFunctions: {}
            }
          }
        }
      },
      {
        hash: '09e04b794209c48411318f4e69b085903978c800284bb643b0095a249c199de0',
        from: [],
        to: ['3E2p6qP9vh4hFfuVQLsxTAziRDDHJ5DnQj', 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9'],
        isInbound: true,
        amount: '0',
        fee: '0',
        blockHeight: '3270951',
        protocolIdentifier: 'grs',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://chainz.cryptoid.info/grs' },
          extras: {
            indexerApi: 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://blockbook.groestlcoin.org',
            network: {
              messagePrefix: '\u001cGroestlCoin Signed Message:\n',
              bech32: 'grs',
              bip32: { public: 76067358, private: 76066276 },
              pubKeyHash: 36,
              scriptHash: 5,
              wif: 128,
              coin: 'grs',
              hashFunctions: {}
            }
          }
        }
      }
    ],
    cursor: { page: 2 }
  }

  public nextTransactionResult = {
    transactions: [
      {
        hash: '5f71b88f3143ea4a3e54c36fd1eff6810774a6a4bc817c13e29ca77e40126781',
        from: [],
        to: ['3E2p6qP9vh4hFfuVQLsxTAziRDDHJ5DnQj', 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9'],
        isInbound: true,
        amount: '0',
        fee: '0',
        blockHeight: '3270950',
        protocolIdentifier: 'grs',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://chainz.cryptoid.info/grs' },
          extras: {
            indexerApi: 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://blockbook.groestlcoin.org',
            network: {
              messagePrefix: '\u001cGroestlCoin Signed Message:\n',
              bech32: 'grs',
              bip32: { public: 76067358, private: 76066276 },
              pubKeyHash: 36,
              scriptHash: 5,
              wif: 128,
              coin: 'grs',
              hashFunctions: {}
            }
          }
        }
      },
      {
        hash: '47f95dd5a9eb091fcf73ea5ac01e8b2fd115e59f8c6966752744593c07b74422',
        from: [],
        to: ['3E2p6qP9vh4hFfuVQLsxTAziRDDHJ5DnQj', 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9'],
        isInbound: true,
        amount: '0',
        fee: '0',
        blockHeight: '3270949',
        protocolIdentifier: 'grs',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://chainz.cryptoid.info/grs' },
          extras: {
            indexerApi: 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://blockbook.groestlcoin.org',
            network: {
              messagePrefix: '\u001cGroestlCoin Signed Message:\n',
              bech32: 'grs',
              bip32: { public: 76067358, private: 76066276 },
              pubKeyHash: 36,
              scriptHash: 5,
              wif: 128,
              coin: 'grs',
              hashFunctions: {}
            }
          }
        }
      }
    ],
    cursor: { page: 3 }
  }
}
