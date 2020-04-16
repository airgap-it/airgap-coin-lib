import { TransactionValidator } from "../validators/transactions.validator";
import { UnsignedSubstrateTransaction } from "../schemas/definitions/transaction-sign-request-substrate";
import { SignedSubstrateTransaction } from "../schemas/definitions/transaction-sign-response-substrate";
import { RawSubstrateTransaction } from "../types";
import { validateSyncScheme } from "../validators/validators";
import { async } from "../../dependencies/src/validate.js-0.13.1/validate";

const unsignedTransactionConstraints = {
    encoded: {
        presence: { allowEmpty: false },
        type: 'String'
    }
}

const signedTransactionConstraints = {
    transaction: {
        isValidSubstrateTransaction: true,
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

export class SubstrateTransactionValidator extends TransactionValidator {
    public async validateUnsignedTransaction(unsignedTx: UnsignedSubstrateTransaction): Promise<any> {
        const rawTx: RawSubstrateTransaction = unsignedTx.transaction
        validateSyncScheme({})
        return async(rawTx, unsignedTransactionConstraints).then(success, error)
    }

    public async validateSignedTransaction(signedTx: SignedSubstrateTransaction): Promise<any> {
        return async(signedTx, signedTransactionConstraints).then(success, error)
    }

}