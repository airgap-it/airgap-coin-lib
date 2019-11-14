import { UnsignedTransaction } from './transaction-sign-request'

interface IInTransaction {
  txId: string
  value: string
  vout: number
  address: string
  derivationPath?: string
}

interface IOutTransaction {
  recipient: string
  isChange: boolean
  value: string
}

interface RawBitcoinTransaction {
  ins: IInTransaction[]
  outs: IOutTransaction[]
}

export interface UnsignedBitcoinTransaction extends UnsignedTransaction {
  transaction: RawBitcoinTransaction
}
