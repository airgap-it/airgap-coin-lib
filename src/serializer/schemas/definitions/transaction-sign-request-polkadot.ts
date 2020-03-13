import { UnsignedTransaction } from "./transaction-sign-request";

interface RawPolkadotTransaction {
    serialized: string
}

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: RawPolkadotTransaction
}