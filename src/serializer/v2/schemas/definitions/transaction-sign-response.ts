export interface SignedTransaction {
  transaction: string
  accountIdentifier: string
  from?: string[]
  amount?: string
  to?: string[]
  fee?: string
}
