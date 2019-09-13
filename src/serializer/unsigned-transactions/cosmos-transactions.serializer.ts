import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import BigNumber from 'bignumber.js'

export type SerializedUnsignedCosmosTransaction = [[[Buffer, Buffer, [[Buffer, Buffer]]]], [[[Buffer, Buffer]], Buffer], Buffer]

export interface RawCosmosTransaction {
  messages: RawCosmosSendMessage[]
  fee: RawCosmosFee
  memo: string
  chainID: string
}

export interface RawCosmosSendMessage {
  fromAddress: string
  toAddress: string
  coins: RawCosmosCoin[]
}

export interface RawCosmosCoin {
  denom: string
  amount: BigNumber
}

export interface RawCosmosFee {
  amount: RawCosmosCoin[]
  gas: BigNumber
}

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: RawCosmosTransaction
}

export class CosmosTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedCosmosTransaction): SerializedSyncProtocolTransaction {
    const serialized = [
      [
        [
          ...unsignedTx.transaction.messages.map(message => [
            message.fromAddress,
            message.toAddress,
            [
              ...message.coins.map(coin => {
                ;[coin.denom, coin.amount]
              })
            ]
          ])
        ],
        [[...unsignedTx.transaction.fee.amount.map(amount => [amount.denom, amount.amount])], unsignedTx.transaction.fee.gas],
        unsignedTx.transaction.memo
      ],
      unsignedTx.publicKey, // publicKey
      unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
    ]
    return toBuffer(serialized) as SerializedSyncProtocolTransaction
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedCosmosTransaction {
    const cosmosTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedCosmosTransaction
    const messages = cosmosTx[0]
    const fee = cosmosTx[1]
    const memo = cosmosTx[2]

    const rawCosmosTx: RawCosmosTransaction = {
      messages: messages.map(message => {
        return {
          fromAddress: message[0].toString(),
          toAddress: message[1].toString(),
          coins: message[2].map(coin => {
            return {
              denom: coin[0].toString(),
              amount: new BigNumber(coin[1].toString())
            }
          })
        }
      }),
      chainID: '',
      fee: {
        amount: fee[0].map(amount => {
          return {
            denom: amount[0].toString(),
            amount: new BigNumber(amount[1].toString())
          }
        }),
        gas: new BigNumber(fee[1].toString())
      },
      memo: memo.toString()
    }
    return {
      transaction: rawCosmosTx,
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
