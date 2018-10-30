import {
  TransactionSerializer,
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction
} from '../transactions.serializer'
import BigNumber from 'bignumber.js'
import * as Web3 from 'web3'
import * as ethUtil from 'ethereumjs-util'

const localWeb3: Web3 = new Web3()

export type SerializedUnsignedEthereumTransaction = [string, string, string, string, string, string, string]

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
  public serialize(
    publicKey: string,
    transaction: RawEthereumTransaction,
    callback: string = 'airgap-wallet://?d='
  ): SerializedSyncProtocolTransaction {
    const address = ethUtil.toChecksumAddress((ethUtil.pubToAddress(Buffer.from(publicKey, 'hex'), true) as Buffer).toString('hex'))

    const serializedTx: SerializedSyncProtocolTransaction = [
      [
        transaction.nonce,
        transaction.gasPrice,
        transaction.gasLimit,
        transaction.to,
        transaction.value,
        transaction.chainId,
        transaction.data
      ],
      address, // from
      [transaction.to], // to
      [localWeb3.utils.stringToHex(transaction.value.toString())], // amount
      localWeb3.utils.stringToHex(new BigNumber(transaction.gasPrice).multipliedBy(new BigNumber(transaction.gasLimit)).toString()), // fee
      publicKey, // publicKey
      callback // callback-scheme
    ]

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedEthereumTransaction {
    return {
      from: serializedTx[SyncProtocolUnsignedTransactionKeys.FROM][0],
      to: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][3],
      amount: new BigNumber(serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][4]),
      fee: new BigNumber(serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][1]).multipliedBy(
        new BigNumber(serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][2])
      ),
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY],
      transaction: {
        nonce: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0],
        gasPrice: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][1],
        gasLimit: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][2],
        to: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][3],
        value: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][4],
        chainId: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][5],
        data: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][6]
      },
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK]
    }
  }
}
