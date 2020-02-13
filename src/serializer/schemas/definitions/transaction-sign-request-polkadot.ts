import { UnsignedTransaction } from "./transaction-sign-request";
import { PolkadotTransaction } from "../../../protocols/polkadot/transaction/PolkadotTransaction";

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: PolkadotTransaction
}