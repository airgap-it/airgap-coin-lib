import { TransactionValidator } from "../validators/transactions.validator";
import { UnsignedPolkadotTransaction } from "../schemas/definitions/transaction-sign-request-polkadot";
import { SignedPolkadotTransaction } from "../schemas/definitions/transaction-sign-response-polkadot";
import { RawPolkadotTransaction } from "../types";
import { validateSyncScheme } from "../validators/validators";
import { async } from "../../dependencies/src/validate.js-0.13.1/validate";

const unsignedTransactionConstraints = {
    serialized: {
        presence: { allowEmpty: false },
        type: 'String'
    }
}

const signedTransactionConstraints = {
    transaction: {
        isValidPolkadotTransaction: true,
        presence: { allowEmpty: false },
        type: 'String'
    },
    accountIdentifier: {
        presence: { allowEmpty: false },
        type: 'String'
    }
}

const success = () => undefined
const error = errors => errors

export class PolkadotTransactionValidator extends TransactionValidator {
    public async validateUnsignedTransaction(unsignedTx: UnsignedPolkadotTransaction): Promise<any> {
        const rawTx: RawPolkadotTransaction = unsignedTx.transaction
        validateSyncScheme({})
        return async(rawTx, unsignedTransactionConstraints).then(success, error)
    }

    public async validateSignedTransaction(signedTx: SignedPolkadotTransaction): Promise<any> {
        return async(signedTx, signedTransactionConstraints).then(success, error)
    }

}