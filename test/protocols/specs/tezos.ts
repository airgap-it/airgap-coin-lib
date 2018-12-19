import BigNumber from 'bignumber.js'
import { TestProtocolSpec } from '../implementations'
import { TezosProtocolStub } from '../stubs/tezos.stub'
import { DeserializedSyncProtocol, SignedTransaction } from '../../../lib'
import { TezosAlphaProtocol } from '../../../lib/protocols/TezosAlphaProtocol'

// Test Mnemonic:
// cannon volume define column midnight uncover cute math ridge torch smooth mask still lumber night
// Address: tz1d9oQZ51E9hRozKPEwSVg9xZCK9JAZrJy5

export class TezosTestProtocolSpec extends TestProtocolSpec {
  name = 'Tezos'
  lib = new TezosAlphaProtocol()
  stub = new TezosProtocolStub()
  wallet = {
    privateKey:
      '65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    publicKey: 'd64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    addresses: ['tz1d9oQZ51E9hRozKPEwSVg9xZCK9JAZrJy5'],
    tx: {
      amount: new BigNumber('100000000'),
      fee: new BigNumber('50000')
    }
  }
  txs = [
    {
      unsignedTx: {
        jsonTransaction: {
          branch: 'BLyypN89WuTQyLtExGP6PEuZiu5WFDxys3GTUf7Vz4KvgKcvo2E',
          contents: [
            {
              kind: 'transaction',
              source: 'tz1d9oQZ51E9hRozKPEwSVg9xZCK9JAZrJy5',
              fee: '50000',
              counter: '3',
              gas_limit: '200',
              storage_limit: '0',
              amount: '100000000',
              destination: 'tz1d9oQZ51E9hRozKPEwSVg9xZCK9JAZrJy5'
            }
          ]
        },
        binaryTransaction: ''
      },
      signedTx: {
        transaction: {
          branch: 'BLyypN89WuTQyLtExGP6PEuZiu5WFDxys3GTUf7Vz4KvgKcvo2E',
          contents: [
            {
              kind: 'transaction',
              source: 'tz1d9oQZ51E9hRozKPEwSVg9xZCK9JAZrJy5',
              fee: '50000',
              counter: '3',
              gas_limit: '200',
              storage_limit: '0',
              amount: '100000000',
              destination: 'tz1d9oQZ51E9hRozKPEwSVg9xZCK9JAZrJy5'
            }
          ]
        },
        bytes: Buffer.from(
          'ce69c5713dac3537254e7be59759cf59c15abd530d10501ccf9028a5786314cf08000002298c03ed7d454a101eb7022bc95f7e5f41ac78d0860303c8010080c2d72f0000e7670f32038107a59a2b9cfefae36ea21f5aa63c00'
        ),
        signature: 'edsigu5Cb8WEmUZzoeGSL3sbSuswNFZoqRPq5nXA18Pg4RHbhnFqshL2Rw5QJBM94UxdWntQjmY7W5MqBDMhugLgqrRAWHyH5hD'
      }
    }
  ]

  signedTransaction(tx: any): DeserializedSyncProtocol {
    const protocol: DeserializedSyncProtocol = super.signedTransaction(tx)
    const payload = protocol.payload as SignedTransaction
    payload.amount = this.wallet.tx.amount
    payload.fee = this.wallet.tx.fee
    payload.from = this.wallet.addresses
    return protocol
  }

  seed() {
    return '19a55a6cb7196defac577bd172f92ce401fbac3223b0ba84831507a4d8ccf2b38afbb40b4e46892dc38554908aeec63a611a10c82d50b56bb3a71efa4be94395'
  }
}
