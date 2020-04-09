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
}
