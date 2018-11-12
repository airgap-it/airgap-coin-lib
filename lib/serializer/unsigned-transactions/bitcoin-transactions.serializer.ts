import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import BigNumber from 'bignumber.js'
import { toBuffer } from '../utils/toBuffer'

export type SerializedUnsignedBitcoinTransaction = [[[Buffer, Buffer, Buffer, Buffer, Buffer]], [[Buffer, Buffer, Buffer]]]

export interface IInTransaction {
  txId: string
  value: BigNumber
  vout: number
  address: string
  derivationPath?: string
}

export interface IOutTransaction {
  recipient: string
  isChange: boolean
  value: BigNumber
}

export interface RawBitcoinTransaction {
  ins: IInTransaction[]
  outs: IOutTransaction[]
}

export interface UnsignedBitcoinTransaction extends UnsignedTransaction {
  transaction: RawBitcoinTransaction
}

export class BitcoinUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedBitcoinTransaction): SerializedSyncProtocolTransaction {
    const toSerialize = [
      [
        [...unsignedTx.transaction.ins.map(input => [input.txId, input.value, input.vout, input.address, input.derivationPath])],
        [...unsignedTx.transaction.outs.map(output => [output.isChange, output.recipient, output.value])]
      ],
      unsignedTx.publicKey, // publicKey
      unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
    ]
    const serializedTx: SerializedSyncProtocolTransaction = toBuffer(toSerialize) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedBitcoinTransaction {
    const bitcoinTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedBitcoinTransaction
    const inputs = bitcoinTx[0]
    const outputs = bitcoinTx[1]

    return {
      transaction: {
        ins: inputs.map(val => {
          const input: IInTransaction = {
            txId: val[0].toString(),
            value: new BigNumber(val[1].toString()),
            vout: parseInt(val[2].toString(), 10),
            address: val[3].toString(),
            derivationPath: val[4].toString()
          }
          return input
        }),
        outs: outputs.map(val => {
          const output: IOutTransaction = {
            isChange: val[0].toString() === '0' ? false : true,
            recipient: val[1].toString(),
            value: new BigNumber(val[2].toString())
          }
          return output
        })
      },
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
