import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'

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
  derivationPath?: string
}

interface RawBitcoinTransaction {
  ins: IInTransaction[]
  outs: IOutTransaction[]
}

export interface UnsignedBitcoinTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: RawBitcoinTransaction
}
