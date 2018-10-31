import {
  TransactionSerializer,
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction
} from '../transactions.serializer'
import BigNumber from 'bignumber.js'
import * as ethUtil from 'ethereumjs-util'
import { toHexString } from '../utils/toHex'
import { toBuffer } from '../utils/toBuffer'

export type SerializedUnsignedEthereumTransaction = [Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer]

export interface RawEthereumTransaction {
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  value: string
  chainId: string
  data: string
}

export interface UnsignedEthereumTransaction extends UnsignedTransaction {
  transaction: RawEthereumTransaction
}

export class EthereumUnsignedTransactionSerializer extends TransactionSerializer {
  public serialize(transaction: UnsignedEthereumTransaction): SerializedSyncProtocolTransaction {
    const address = ethUtil.toChecksumAddress(
      (ethUtil.pubToAddress(Buffer.from(transaction.publicKey, 'hex'), true) as Buffer).toString('hex')
    )

    const serializedTx: SerializedSyncProtocolTransaction = toBuffer([
      [
        transaction.transaction.nonce,
        transaction.transaction.gasPrice,
        transaction.transaction.gasLimit,
        transaction.transaction.to,
        transaction.transaction.value,
        transaction.transaction.chainId,
        transaction.transaction.data
      ],
      [address], // from
      [transaction.transaction.to], // to
      [transaction.transaction.value], // amount
      toHexString(new BigNumber(transaction.transaction.gasPrice).multipliedBy(new BigNumber(transaction.transaction.gasLimit))),
      transaction.publicKey, // publicKey
      transaction.callback ? transaction.callback : 'airgap-vault://?d=' // callback-scheme
    ])

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedEthereumTransaction {
    return {
      from: serializedTx[SyncProtocolUnsignedTransactionKeys.FROM][0].toString(),
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: {
        nonce: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0].toString(),
        gasPrice: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][1].toString(),
        gasLimit: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][2].toString(),
        to: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][3].toString(),
        value: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][4].toString(),
        chainId: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][5].toString(),
        data: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][6].toString()
      },
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
