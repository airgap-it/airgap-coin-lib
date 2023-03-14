import { ICRC1Account } from './account'

export interface ICRC1TransferArgs {
  fromSubaccount?: string
  to: ICRC1Account
  amount: string
  fee?: string
  memo?: string
  createdAtTime?: string
}
