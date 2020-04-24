import { UnsignedTransaction } from "./transaction-sign-request";

interface RawSubstrateTransaction {
    encoded: string
}

export interface UnsignedSubstrateTransaction extends UnsignedTransaction {
    transaction: RawSubstrateTransaction
}