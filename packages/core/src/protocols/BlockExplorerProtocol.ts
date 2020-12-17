import { ProtocolOptions } from '../utils/ProtocolOptions'

export abstract class BlockExplorerProtocol {
  public abstract options: ProtocolOptions

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return this.options.network.blockExplorer.getAddressLink(address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return this.options.network.blockExplorer.getTransactionLink(txId)
  }
}
