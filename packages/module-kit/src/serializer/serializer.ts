import { TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { V3SchemaConfiguration } from '../types/serializer'
import { SignedTransaction, UnsignedTransaction } from '../types/transaction'

export interface AirGapV3SerializerCompanion {
  schemas: V3SchemaConfiguration[]

  toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest>
  fromTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<UnsignedTransaction>
  validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean>

  toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse>
  fromTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<SignedTransaction>
  validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean>
}
