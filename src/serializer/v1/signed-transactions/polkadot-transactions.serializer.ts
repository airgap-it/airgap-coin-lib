import { SignedTransactionSerializer, SignedTransaction, SerializedSyncProtocolSignedTransaction, SyncProtocolSignedTransactionKeys } from "../signed-transaction.serializer";
import { toBuffer } from "../utils/toBuffer";

export type SerializedSignedPolkadotTransaction = [Buffer]

export interface SignedPolkadotTransaction extends SignedTransaction {

}

export class PolkadotSignedTransactionSerializer extends SignedTransactionSerializer {

    public serialize(transaction: SignedPolkadotTransaction): SerializedSyncProtocolSignedTransaction {
        const toSerialize: any[] = []

        toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
        toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier

        return toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction
    }    
    
    public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedPolkadotTransaction {
        return {
            accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
            transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
        }
    }
}