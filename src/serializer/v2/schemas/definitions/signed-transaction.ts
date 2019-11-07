export interface SignedTransaction {
  transaction: string
  accountIdentifier: string
  from?: string[]
  amount?: string // TODO: Shouldn't this be an array?
  to?: string[]
  fee?: string
}
