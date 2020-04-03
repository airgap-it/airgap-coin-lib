import { UnsignedTransaction } from "./transaction-sign-request";

interface RawPolkadotTransaction {
    encoded: string
}

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: RawPolkadotTransaction
}