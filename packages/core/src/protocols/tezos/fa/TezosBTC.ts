import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosBTCProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

enum TezosBTCContractEntrypoint {
  TOTAL_MINTED = 'getTotalMinted',
  TOTAL_BURNED = 'getTotalBurned'
}

export class TezosBTC extends TezosFA1p2Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosBTCProtocolConfig())
  ) {
    super(options)
  }

  public async getTotalMinted(source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    const getTotalMintedCall = await this.contract.createContractCall(TezosBTCContractEntrypoint.TOTAL_MINTED, [[], callbackContract])

    return this.getContractCallIntResult(getTotalMintedCall, this.requireSource(source))
  }

  public async getTotalBurned(source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    const getTotalBurnedCall = await this.contract.createContractCall(TezosBTCContractEntrypoint.TOTAL_BURNED, [[], callbackContract])

    return this.getContractCallIntResult(getTotalBurnedCall, this.requireSource(source))
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    return this.contract.network.extras.indexerClient.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}
