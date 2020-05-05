import { TezosBTCDetails } from './../../../serializer/constants'
import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'

export class TezosBTC extends TezosFAProtocol {
  constructor(
    contractAddress: string = TezosBTCDetails.CONTRACT_ADDRESS,
    jsonRPCAPI: string = 'https://tezos-node.prod.gke.papers.tech',
    baseApiUrl: string = 'https://tezos-mainnet-conseil-1.kubernetes.papers.tech',
    baseApiKey: string = 'airgap123',
    baseApiNetwork: string = 'mainnet',
    network: TezosNetwork = TezosNetwork.MAINNET
  ) {
    super({
      symbol: 'TZBTC',
      name: 'Tezos BTC',
      marketSymbol: 'btc',
      identifier: 'xtz-btc',
      feeDefaults: {
        low: '0.100',
        medium: '0.300',
        high: '0.500'
      },
      decimals: 8,
      contractAddress: contractAddress,
      jsonRPCAPI: jsonRPCAPI,
      baseApiUrl: baseApiUrl,
      baseApiKey: baseApiKey,
      baseApiNetwork: baseApiNetwork,
      network: network
    })
  }

  public async fetchHolders(): Promise<{address: string, amount: string}[]> {

    const values = await this.contract.bigMapValues([{
      field: 'key' as const,
      operation: "startsWith" as const,
      set: ["0x05070701000000066c65646765720a00000016"]
    }])
    return values.map((value) => {
      return {
        address: value.key,
        amount: value.value !== null ? value.value : "0"
      }
    })
  }
}
