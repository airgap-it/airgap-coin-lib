import { UnsignedTransactionSerializer, UnsignedTransaction, SerializedSyncProtocolTransaction, SyncProtocolUnsignedTransactionKeys } from "../unsigned-transaction.serializer";
import { toBuffer } from "../../utils/toBuffer";

export type SerializedUnsignedPolkadotTransaction = [Buffer]

export interface RawPolkadotTransaction {
    encoded: string
}

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: RawPolkadotTransaction
}

export class PolkadotUnsignedTransactionsSerializer extends UnsignedTransactionSerializer {
    
    public serialize(transaction: UnsignedPolkadotTransaction): SerializedSyncProtocolTransaction {
        const toSerialize: any[] = []
            
        toSerialize[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] = [transaction.transaction.encoded, ]
        toSerialize[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY] = transaction.publicKey
        toSerialize[SyncProtocolUnsignedTransactionKeys.CALLBACK] = transaction.callback ? transaction.callback : 'airgap-wallet://?d='
            
        return toBuffer(toSerialize) as SerializedSyncProtocolTransaction
    }   
    
    public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedPolkadotTransaction {
        const unsignedTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedPolkadotTransaction

        return {
            transaction: {
                encoded: unsignedTx.toString()
            },
            publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
            callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
        }
    }

}