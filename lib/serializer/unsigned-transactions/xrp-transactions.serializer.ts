import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import { RippleAPI, FormattedTransactionType, RippleAPIBroadcast } from 'ripple-lib'
import { Payment } from 'ripple-lib/dist/npm/transaction/payment'
import { Instructions } from 'ripple-lib/dist/npm/transaction/types'
import { Adjustment, MaxAdjustment } from 'ripple-lib/dist/npm/common/types/objects/adjustments'
import { Memo } from 'ripple-lib/dist/npm/common/types/objects/memos'
import { Amount } from 'ripple-lib/dist/npm/common/types/objects'

export type SerializedAdjustment = [Buffer, [Buffer, Buffer, Buffer, Buffer], Buffer]
export type SerializedMemos = [[Buffer, Buffer, Buffer]]

export type SerializedUnsignedXrpTransaction = [
  // Instructions
  [Buffer, Buffer, Buffer, Buffer, Buffer, Buffer],

  // XrpPayment
  [
    SerializedAdjustment, // source
    SerializedAdjustment, // destination
    SerializedMemos, // memos
    Buffer,
    Buffer,
    Buffer,
    Buffer,
    Buffer
  ]
]

export interface XrpPayment extends Payment {
  source: MaxAdjustment
  destination: Adjustment
}

export interface RawXrpTransaction {
  instructions: Instructions
  payment: XrpPayment
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

  serializedToMemo(serialized: SerializedMemos): Array<Memo> {
    const memos = serialized.map(buffers => {
      let memo: Memo = {
        data: this.toStringOrNull(buffers[0]),
        format: this.toStringOrNull(buffers[1]),
        type: this.toStringOrNull(buffers[2])
      }

      return memo
    })

    return memos
  }

  memoToBuffer(memo: Memo): Buffer[] {
    var memoItems = new Array<any>()
    memoItems.push(memo.data)
    memoItems.push(memo.format)
    memoItems.push(memo.type)

    return toBuffer(memoItems, true) as Buffer[]
  }

  toNumberOrNull(buffer: Buffer, radix: number = 10): number | undefined {
    if (buffer.length < 1) return undefined

    return parseInt(buffer.toString(), radix)
  }

  toBooleanrOrNull(buffer: Buffer): boolean | undefined {
    if (buffer.length < 1) return undefined

    return buffer.toString() === '0' ? false : true
  }

  toStringOrNull(buffer: Buffer): string | undefined {
    if (buffer.length < 1) return undefined

    return buffer.toString()
  }

  public serialize(transaction: UnsignedXrpTransaction): SerializedSyncProtocolTransaction {
    const tx = transaction.transaction

    const serializedTx: SerializedSyncProtocolTransaction = toBuffer(
      [
        [
          [
            tx.instructions.sequence,
            tx.instructions.fee,
            tx.instructions.maxFee,
            tx.instructions.maxLedgerVersion,
            tx.instructions.maxLedgerVersionOffset,
            tx.instructions.signersCount
          ],
          [
            [
              tx.payment.source.address,
              [
                tx.payment.source.maxAmount.value,
                tx.payment.source.maxAmount.currency,
                tx.payment.source.maxAmount.issuer,
                tx.payment.source.maxAmount.counterparty
              ],
              tx.payment.source.tag
            ],
            [
              tx.payment.destination.address,
              [
                tx.payment.destination.amount.value,
                tx.payment.destination.amount.currency,
                tx.payment.destination.amount.issuer,
                tx.payment.destination.amount.counterparty
              ],
              tx.payment.destination.tag
            ],
            tx.payment.memos ? tx.payment.memos.map(x => this.memoToBuffer(x)) : new Array<Array<Buffer>>(),
            tx.payment.paths,
            tx.payment.invoiceID,
            tx.payment.allowPartialPayment,
            tx.payment.noDirectRipple,
            tx.payment.limitQuality
          ]
        ],
        transaction.publicKey, // publicKey
        transaction.callback ? transaction.callback : 'airgap-wallet://?d=' // callback-scheme
      ],
      true
    ) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedXrpTransaction {
    let test = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0][0]
    let xrpTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedXrpTransaction

    const unsignedXrpTx: UnsignedXrpTransaction = {
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: {
        instructions: {
          sequence: this.toNumberOrNull(xrpTx[0][0]),
          fee: this.toStringOrNull(xrpTx[0][1]),
          maxFee: this.toStringOrNull(xrpTx[0][2]),
          maxLedgerVersion: this.toNumberOrNull(xrpTx[0][3]),
          maxLedgerVersionOffset: this.toNumberOrNull(xrpTx[0][4]),
          signersCount: this.toNumberOrNull(xrpTx[0][5])
        },
        payment: {
          source: this.serializedToAdjustment(xrpTx[1][0], true) as MaxAdjustment,
          destination: this.serializedToAdjustment(xrpTx[1][1], false) as Adjustment,
          memos: this.serializedToMemo(xrpTx[1][2]),
          paths: this.toStringOrNull(xrpTx[1][3]),
          invoiceID: this.toStringOrNull(xrpTx[1][4]),
          allowPartialPayment: this.toBooleanrOrNull(xrpTx[1][5]),
          noDirectRipple: this.toBooleanrOrNull(xrpTx[1][6]),
          limitQuality: this.toBooleanrOrNull(xrpTx[1][7])
        }
      },
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }

    return unsignedXrpTx
  }
}
