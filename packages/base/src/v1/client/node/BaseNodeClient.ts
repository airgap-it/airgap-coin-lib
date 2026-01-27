import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { EthereumNodeClient, EthereumUnsignedTransaction } from '@airgap/ethereum/v1'

export interface BaseNodeClient extends EthereumNodeClient {
  getL1Fee(contractAddress: string, tx: EthereumUnsignedTransaction): Promise<BigNumber>
}
