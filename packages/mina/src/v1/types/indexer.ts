export const ACCOUNT_TRANSFER_KIND: string = 'PAYMENT'

export interface AccountTransaction {
  to: string
  from: string
  amount: string | number
  fee: string | number
  memo?: string
  kind?: string
  hash?: string
  dateTime: string
  failureReason?: string // TODO: confirm type
}
