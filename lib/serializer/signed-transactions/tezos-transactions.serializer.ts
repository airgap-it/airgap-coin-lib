import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import BigNumber from 'bignumber.js'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'

export interface SignedTezosTransaction extends SignedTransaction {
  from: string[]
  to: string[]
  amount: BigNumber
  fee: BigNumber
  accountIdentifier: string
  transaction: IAirGapSignedTransaction
}

export type SerializedSignedTezosTransaction = [Buffer]

export class TezosSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedTezosTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    // TODO: Find Solution to "unforge" Tezos TX in order to be able to skip supplying all the additional data here
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier
    toSerialize[SyncProtocolSignedTransactionKeys.FROM] = transaction.from
    toSerialize[SyncProtocolSignedTransactionKeys.FEE] = transaction.fee.toFixed()
    toSerialize[SyncProtocolSignedTransactionKeys.AMOUNT] = transaction.amount.toFixed()
    toSerialize[SyncProtocolSignedTransactionKeys.TO] = transaction.to

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTezosTransaction {
    const signedTezosTx: SignedTezosTransaction = {
      from: serializedTx[SyncProtocolSignedTransactionKeys.FROM].map(obj => obj.toString()),
      to: serializedTx[SyncProtocolSignedTransactionKeys.TO].map(obj => obj.toString()),
      amount: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.AMOUNT].toString()),
      fee: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.FEE].toString()),
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }

    return signedTezosTx
  }
}
