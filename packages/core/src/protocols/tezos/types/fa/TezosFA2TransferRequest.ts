export interface TezosFA2TransferRequest {
  from: string
  txs: {
    to: string
    tokenID: number
    amount: string
  }[]
}