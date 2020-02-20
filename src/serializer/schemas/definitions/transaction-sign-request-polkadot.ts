import { UnsignedTransaction } from "./transaction-sign-request";

interface RawPolkadotTransaction {
    type: string,
    encoded: string,
    payload: string
}

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: RawPolkadotTransaction
}