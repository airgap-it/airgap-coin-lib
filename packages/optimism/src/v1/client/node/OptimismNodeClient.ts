import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { EthereumNodeClient, EthereumUnsignedTransaction } from '@airgap/ethereum/v1'

export abstract class OptimismNodeClient extends EthereumNodeClient {
  public abstract getL1Fee(contractAddress: string, tx: EthereumUnsignedTransaction): Promise<BigNumber>
}
