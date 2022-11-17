export interface AirGapBlockExplorer {
  createAddressUrl(address: string): Promise<string>
  createTransactionUrl(transactionId: string): Promise<string>
}
