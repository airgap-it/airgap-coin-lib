import {
  TransactionSerializer,
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction
} from '../transactions.serializer'
import BigNumber from 'bignumber.js'
import { SerializedSyncProtocol, EncodedType } from '../serializer'
import Web3 from 'web3'
import * as rlp from 'rlp'

const localWeb3: Web3 = new Web3()

export type SerializedUnsignedEthereumTransaction = [string, string, string, string, string, string]

export interface RawEthereumTransaction {
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  value: string
  chainId: string
}

export interface UnsignedEthereumTransaction extends UnsignedTransaction {
  transaction: RawEthereumTransaction
}

export class EthereumUnsignedTransactionSerializer extends TransactionSerializer {
  public serialize(
    from: string,
    fee: BigNumber,
    amount: BigNumber,
    publicKey: string,
    transaction: SerializedUnsignedEthereumTransaction
  ): string {
    const serializedTx: SerializedSyncProtocol = [
      1, // version
      EncodedType.UNSIGNED_TRANSACTION,
      'eth', // protocol identifier
      [
        transaction,
        from, // from
        [], // to
        [localWeb3.utils.stringToHex(amount.toString())], // amount
        localWeb3.utils.stringToHex(fee.toString()), // fee
        publicKey // publicKey
      ]
    ]

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return rlp.encode(serializedTx as any).toString('base64')
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
        chainId: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][5]
      }
    }
  }
}
