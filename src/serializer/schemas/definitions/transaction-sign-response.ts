export interface SignedTransaction {
  id: string // Message ID used to match request/reaponse
  transaction: string
  accountIdentifier: string
}
