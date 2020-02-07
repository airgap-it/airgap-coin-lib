import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'

export class TezosBTC extends TezosFAProtocol {
  constructor(
    contractAddress: string = 'KT1LH2o12xVRwTpJMZ6QJG74Fox8gE9QieFd',
    jsonRPCAPI: string = 'https://tezos-babylonnet-node-1.kubernetes.papers.tech',
    baseApiUrl: string = 'https://tezos-babylonnet-conseil-1.kubernetes.papers.tech',
    baseApiKey: string = 'airgap00391',
    baseApiNetwork: string = 'babylonnet',
    network: TezosNetwork = TezosNetwork.BABYLONNET
  ) {
    super({
      symbol: 'TZBTC',
      name: 'Tezos BTC',
      marketSymbol: 'btc',
      identifier: 'xtz-btc',
      feeDefaults: {
        low: '0.250',
        medium: '0.50',
        high: '1.00'
      },
      contractAddress: contractAddress,
      jsonRPCAPI: jsonRPCAPI,
      baseApiUrl: baseApiUrl,
      baseApiKey: baseApiKey,
      baseApiNetwork: baseApiNetwork,
      network: network
    })
  }
}
