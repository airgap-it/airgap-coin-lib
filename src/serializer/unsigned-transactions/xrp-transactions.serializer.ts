import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import { Adjustment, MaxAdjustment } from 'ripple-lib/dist/npm/common/types/objects/adjustments'
import { Amount } from 'ripple-lib/dist/npm/common/types/objects'

export type SerializedAdjustment = [Buffer, [Buffer, Buffer, Buffer, Buffer], Buffer]
export type SerializedMemos = [[Buffer, Buffer, Buffer]]

export type SerializedUnsignedXrpTransaction = [
  // XrpPayment
  Buffer,
  Buffer,

  Buffer,
  Buffer,
  Buffer,
  Buffer,
  Buffer,

  Buffer, // max ledger version

  SerializedMemos // memos,
]
export interface XrpMemo {
  type?: string
  format?: string
  data: string
}

export interface RawXrpTransaction {
  transactionType: string
  account: string
  fee: number
  destination: string
  destinationTag?: number
  amount: number

  sequence: number // needed for offline support
  maxLedgerVersion: number // needed for offline support

  memos: XrpMemo[]
}

export interface UnsignedXrpTransaction extends UnsignedTransaction {
  transaction: RawXrpTransaction
}

export class XrpUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  serializedToAdjustment(serialized: SerializedAdjustment, isMax: boolean = false): Adjustment | MaxAdjustment {
    if (isMax) {
      const maxAdjustment: MaxAdjustment = {
        address: serialized[0].toString(),
        maxAmount: this.bufferArrayToAmount(serialized[1]),
        tag: this.toNumberOrNull(serialized[2])
      }

      return maxAdjustment
    }

    const adjustment: Adjustment = {
      address: serialized[0].toString(),
      amount: this.bufferArrayToAmount(serialized[1]),
      tag: this.toNumberOrNull(serialized[2])
    }

    return adjustment
  }

  bufferArrayToAmount(buffers: [Buffer, Buffer, Buffer, Buffer]): Amount {
    const amount: Amount = {
      value: buffers[0].toString(),
      currency: buffers[1].toString(),
      issuer: this.toStringOrNull(buffers[2]),
      counterparty: this.toStringOrNull(buffers[3])
    }

    return amount
  }

  serializedToMemo(serialized: SerializedMemos): Array<XrpMemo> {
    const memos = serialized.map(buffers => {
      let memo: XrpMemo = {
        data: this.toString(buffers[0]),
        format: this.toStringOrNull(buffers[1]),
        type: this.toStringOrNull(buffers[2])
      }

      return memo
    })

    return memos
  }

  memoToBuffer(memo: XrpMemo): Buffer[] {
    var memoItems = new Array<any>()
    memoItems.push(memo.data)
    memoItems.push(memo.format)
    memoItems.push(memo.type)

    return toBuffer(memoItems, true) as Buffer[]
  }

  toNumberOrNull(buffer: Buffer): number | undefined {
    if (buffer.length < 1) return undefined

    return parseFloat(buffer.toString())
  }

  toNumber(buffer: Buffer): number {
    if (buffer.length < 1) throw new Error('No number data in buffer')

    return parseFloat(buffer.toString())
  }

  toBooleanrOrNull(buffer: Buffer): boolean | undefined {
    if (buffer.length < 1) return undefined

    return buffer.toString() === '0' ? false : true
  }

  toStringOrNull(buffer: Buffer): string | undefined {
    if (buffer.length < 1) return undefined

    return buffer.toString()
  }

  toString(buffer: Buffer): string {
    if (buffer.length < 1) return ''

    return buffer.toString()
  }

  public serialize(transaction: UnsignedXrpTransaction): SerializedSyncProtocolTransaction {
    const tx = transaction.transaction

    const serializedTx: SerializedSyncProtocolTransaction = toBuffer(
      [
        [
          tx.transactionType,
          tx.account,

          tx.fee,
          tx.destination,
          tx.destinationTag,

          tx.amount,

          tx.sequence,
          tx.maxLedgerVersion,

          tx.memos ? tx.memos.map(x => this.memoToBuffer(x)) : new Array<Array<Buffer>>()
        ],
        transaction.publicKey, // publicKey
        transaction.callback ? transaction.callback : 'airgap-wallet://?d=' // callback-scheme
      ],
      true
    ) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedXrpTransaction {
    let xrpTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedXrpTransaction

    const unsignedXrpTx: UnsignedXrpTransaction = {
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: {
        transactionType: this.toString(xrpTx[0]),
        account: this.toString(xrpTx[1]),
        fee: this.toNumber(xrpTx[2]),
        destination: this.toString(xrpTx[3]),
        destinationTag: this.toNumberOrNull(xrpTx[4]),
        amount: this.toNumber(xrpTx[5]),
        sequence: this.toNumber(xrpTx[6]),
        maxLedgerVersion: this.toNumber(xrpTx[7]),
        memos: this.serializedToMemo(xrpTx[8])
      },
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }

    return unsignedXrpTx
  }
}
