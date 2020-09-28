import { CosmosProtocol, SignedCosmosTransaction } from '../../../src'
import { CosmosSendMessage } from '../../../src/protocols/cosmos/cosmos-message/CosmosSendMessage'
import { CosmosCoin } from '../../../src/protocols/cosmos/CosmosCoin'
import { CosmosFee } from '../../../src/protocols/cosmos/CosmosFee'
import { CosmosTransaction } from '../../../src/protocols/cosmos/CosmosTransaction'
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
    addresses: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6']
  }
  public txs = [
    {
      amount: '2',
      fee: '1',
      to: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'],
      from: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'],
      unsignedTx: new CosmosTransaction(
        [cosmosMessage],
        new CosmosFee([new CosmosCoin('uatom', '1')], '200000'),
        '',
        'cosmoshub-3',
        '0',
        '0'
      ),
      signedTx:
        '{"tx":{"msg":[{"type":"cosmos-sdk/MsgSend","value":{"amount":[{"amount":"2","denom":"uatom"}],"from_address":"cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6","to_address":"cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6"}}],"fee":{"amount":[{"amount":"1","denom":"uatom"}],"gas":"200000"},"signatures":[{"signature":"WwCyYGN1VRqbF1x5KmSBP4EAcQO9ym2p7xRdpywSzcl4L9ubjj/fZNc1G2PgAShMG6fbu9LKbh6rxftlixjnPQ==","pub_key":{"type":"tendermint/PubKeySecp256k1","value":"A999/ltDX5YCczflI0F+B8zmGqS59Ru5Oqy9+1SnCiiq"}}],"memo":""},"mode":"sync"}'
    }
  ]
  public validRawTransactions: any[] = [
    new CosmosTransaction(
      [
        new CosmosSendMessage('cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6', 'cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6', [
          new CosmosCoin('uatom', '2')
        ])
      ],
      new CosmosFee([new CosmosCoin('uatom', '1')], '200000'),
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
