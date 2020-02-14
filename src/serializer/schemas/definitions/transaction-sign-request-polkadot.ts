import { UnsignedTransaction } from "./transaction-sign-request";

export interface RawPolkadotTransaction {
    type: string,
    encoded: string
}

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: RawPolkadotTransaction
}