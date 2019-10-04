import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import { CosmosTransaction, RLPCosmosTransaction } from '../../protocols/cosmos/CosmosTransaction'

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: CosmosTransaction
}

export class CosmosUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedCosmosTransaction): SerializedSyncProtocolTransaction {
    const serialized = [
      unsignedTx.transaction.toRLP(),
      unsignedTx.publicKey, // publicKey
      unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
    ]
    return toBuffer(serialized) as SerializedSyncProtocolTransaction
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedCosmosTransaction {
    const cosmosTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as RLPCosmosTransaction
    const rawCosmosTx = CosmosTransaction.fromRLP(cosmosTx)
    return {
      transaction: rawCosmosTx,
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
