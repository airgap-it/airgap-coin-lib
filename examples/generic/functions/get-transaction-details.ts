// tslint:disable:no-console

import { IAirGapTransaction, ICoinProtocol } from '../../../src'

export const getTransactionDetailsFromSigned: (
  protocol: ICoinProtocol,
  signedTransaction: string
) => Promise<IAirGapTransaction[]> = async (protocol: ICoinProtocol, signedTransaction: string): Promise<IAirGapTransaction[]> => {
  const transactionDetails: IAirGapTransaction[] = await protocol.getTransactionDetailsFromSigned({
    accountIdentifier: '',
    transaction: signedTransaction
  })

  console.log(transactionDetails)
  console.log(`Signed transaction details "${JSON.stringify(transactionDetails, null, 2)}"`)

  return transactionDetails
}

export const getTransactionDetails: (protocol: ICoinProtocol, signedTransaction: string) => Promise<IAirGapTransaction[]> = async (
  protocol: ICoinProtocol,
  unsignedTransaction: string
): Promise<IAirGapTransaction[]> => {
  const transactionDetails: IAirGapTransaction[] = await protocol.getTransactionDetails({
    publicKey: '',
    transaction: { binaryTransaction: unsignedTransaction }
  })

  console.log(transactionDetails)
  console.log(`Transaction details "${JSON.stringify(transactionDetails, null, 2)}"`)

  return transactionDetails
}
