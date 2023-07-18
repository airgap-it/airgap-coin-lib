import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapTransactionStatus } from '@airgap/module-kit'

export interface EthereumNodeClient {
  fetchBalance(address: string): Promise<BigNumber>
  fetchTransactionCount(address: string): Promise<number>
  sendSignedTransaction(transaction: string): Promise<string>
  callBalanceOf(contractAddress: string, address: string): Promise<BigNumber>
  getTransactionStatus(transactionHash: string): Promise<AirGapTransactionStatus>
  estimateTransferGas(contractAddress: string, fromAddress: string, toAddress: string, hexAmount: string): Promise<BigNumber>

  estimateTransactionGas(fromAddress: string, toAddress: string, amount?: string, data?: string, gas?: string): Promise<BigNumber>
  getGasPrice(): Promise<BigNumber>

  callBalanceOfOnContracts(contractAddresses: string[], address: string): Promise<{ [contractAddress: string]: BigNumber }>

  getContractName(contractAddress: string): Promise<string | undefined>
  getContractSymbol(contractAddress: string): Promise<string | undefined>
  getContractDecimals(contractAddress: string): Promise<number | undefined>
}
