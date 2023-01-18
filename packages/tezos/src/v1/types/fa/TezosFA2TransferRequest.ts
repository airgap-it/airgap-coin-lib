export interface TezosFA2TransferRequest {
  from: string
  txs: {
    to: string
    tokenId: number
    amount: string
  }[]
}
