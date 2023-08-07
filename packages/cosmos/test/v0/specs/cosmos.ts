import { AirGapWalletStatus } from '@airgap/coinlib-core/wallet/AirGapWallet'

import { CosmosProtocol, SignedCosmosTransaction } from '../../../src/v0'
import { CosmosSendMessage } from '../../../src/v0/protocol/cosmos-message/CosmosSendMessage'
import { CosmosCoin } from '../../../src/v0/protocol/CosmosCoin'
import { CosmosFee } from '../../../src/v0/protocol/CosmosFee'
import { CosmosTransaction } from '../../../src/v0/protocol/CosmosTransaction'
import { TestProtocolSpec } from '../implementations'
import { CosmosProtocolStub } from '../stubs/cosmos.stub'

const cosmosMessage = new CosmosSendMessage(
  'cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6',
  'cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6',
  [new CosmosCoin('uatom', '2')]
)

export class CosmosTestProtocolSpec extends TestProtocolSpec {
  public name = 'Cosmos'
  public lib = new CosmosProtocol()
  public stub = new CosmosProtocolStub()
  public validAddresses = [
    'cosmos14nzyt8wmx4g6zkeluelukamgsh5v4xgnmeq9y4',
    'cosmos1nec60dgzcxmz7g7ufnmk54rpheztsvj0rpz6cw',
    'cosmos1f074dtttm7fztxkv9s5859583up3kygr4fdwpc',
    'cosmos144fzpepuvdftv4u4r9kq8t35ap2crruv4u3udz',
    'cosmos1mrksy0nfrqutd5qmxh070t56y232zzlu9ugj36',
    'cosmos15v50ymp6n5dn73erkqtmq0u8adpl8d3ujv2e74',
    'cosmosvaloper1kj0h4kn4z5xvedu2nd9c4a9a559wvpuvu0h6qn',
    'cosmosvaloper12w6tynmjzq4l8zdla3v4x0jt8lt4rcz5gk7zg2',
    'cosmosvaloper1648ynlpdw7fqa2axt0w2yp3fk542junl7rsvq6',
    'cosmosvaloper1s7jnk7t6yqzensdgpvkvkag022udk842qdjdtd'
  ]
  public wallet = {
    privateKey: '194ec0f51a1774e5192e159e7c615db6d08d761e11c2c5ac75e21e1c3af15392',
    publicKey: '03df7dfe5b435f96027337e523417e07cce61aa4b9f51bb93aacbdfb54a70a28aa',
    addresses: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'],
    masterFingerprint: '',
    status: AirGapWalletStatus.ACTIVE
  }
  public txs = [
    {
      amount: '2',
      fee: '1',
      to: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'],
      from: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'],
      unsignedTx: new CosmosTransaction(
        [cosmosMessage],
        new CosmosFee([new CosmosCoin('uatom', '1')], '310000'),
        '',
        'cosmoshub-3',
        '0',
        '0'
      ),
      signedTx:
        'Co0BCooBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmoKLWNvc21vczF3M21lYTlnaGZkYzNyN2F4NDVtZWhsMnRjcXc5cDB2bmxobDBwNhItY29zbW9zMXczbWVhOWdoZmRjM3I3YXg0NW1laGwydGNxdzlwMHZubGhsMHA2GgoKBXVhdG9tEgEyEmIKTgpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQPfff5bQ1+WAnM35SNBfgfM5hqkufUbuTqsvftUpwooqhIECgIIARIQCgoKBXVhdG9tEgExEPD1EhpAVZB7sqYkqBNne0OpaJZ9ylXOCulitm3VwYu5D+6ZPslEWkarEYUxPp3xFlUMA+rwD0n6zzo5D/bxoGvezMs0NQ=='
    }
  ]
  public validRawTransactions: any[] = [
    new CosmosTransaction(
      [
        new CosmosSendMessage('cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6', 'cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6', [
          new CosmosCoin('uatom', '2')
        ])
      ],
      new CosmosFee([new CosmosCoin('uatom', '1')], '310000'),
      '',
      'cosmoshub-3',
      '0',
      '0'
    )
  ]
  public invalidUnsignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = []

  public invalidSignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = []

  public validSignedTransactions: SignedCosmosTransaction[] = []

  public messages = [
    {
      message: 'example message',
      signature:
        '0x849eed49b0baaee51bcc9b62f95616856c1aefa3e40fab315db05d397cf064822028a1d0b7c04d1c60372dae7134ed453b3707977805edd21c108a311baad06c'
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '047e5af00e417b238dcd4e242ab19979143ee480b819aab6cc7e2e8ac34c9aa1980901a1ceef1f4702ce2615bf3dd43889890885596a5ecc59f257548b707ff980846f631845d132ea522b65f647ceef576cc942653034621a071790fffb864e2731d22219069ae0cb2d8825087d223c'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '3efdb8f9bbeb8ec879d6716a8a3f39d1!149c7f768d53e31f9ca4a6253c4599!1434b649dd17124fc8ebdc05ef50da48'
    }
  ]

  public transactionResult = {
    transactions: [
      {
        amount: '100000000',
        to: ['cosmos1z3g2nr8m285apqcmelhrk800unkhfrn5x9hccx'],
        from: ['cosmos14nzyt8wmx4g6zkeluelukamgsh5v4xgnmeq9y4'],
        isInbound: false,
        fee: '3575',
        protocolIdentifier: 'cosmos',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://cosmos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://www.mintscan.io' }
        },
        hash: 'ff2beaf71f523ae46b36296d190b68b634ab651c50d7395b1d85c580be516ada',
        timestamp: 1590678838.928
      },
      {
        amount: '86995000',
        to: ['cosmos14nzyt8wmx4g6zkeluelukamgsh5v4xgnmeq9y4'],
        from: ['cosmos1yeygh0y8rfyufdczhzytcl3pehsnxv9d3wsnlg'],
        isInbound: true,
        fee: '5000',
        protocolIdentifier: 'cosmos',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://cosmos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://www.mintscan.io' }
        },
        hash: '0d0182b387dad3f03c60a00199ebabc7389956c3b6cba436c042de54894cb5d1',
        timestamp: 1588943379.552
      }
    ],
    cursor: { offset: 2 }
  }

  public nextTransactionResult = {
    transactions: [
      {
        amount: '7000000',
        to: ['cosmos1latzme6xf6s8tsrymuu6laf2ks2humqv2tkd9a'],
        from: ['cosmos14nzyt8wmx4g6zkeluelukamgsh5v4xgnmeq9y4'],
        isInbound: false,
        fee: '2000',
        protocolIdentifier: 'cosmos',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://cosmos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://www.mintscan.io' }
        },
        hash: '99ff1544d7e7e8b6df7f57775b1de048d5d05864fa44d83b122711e5eaad12b1',
        timestamp: 1588667488.229
      },
      {
        amount: '20000000',
        to: ['cosmos14nzyt8wmx4g6zkeluelukamgsh5v4xgnmeq9y4'],
        from: ['cosmos1ffve0zx389ffl80ae9t8jmghcjuzdlqrh2fhh2'],
        isInbound: true,
        fee: '5000',
        protocolIdentifier: 'cosmos',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://cosmos-node.prod.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://www.mintscan.io' }
        },
        hash: 'b21dfccd5945b1b404db22450b2ec8604b1784cd0a8771ef88001a478aa17e0d',
        timestamp: 1588601992.692
      }
    ],
    cursor: { offset: 4 }
  }
}
