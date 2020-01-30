import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'

export class TezosBTC extends TezosFAProtocol {
  constructor(
    contractAddress: string = 'KT1LH2o12xVRwTpJMZ6QJG74Fox8gE9QieFd',
    jsonRPCAPI: string = 'https://tezos-babylonnet-node-1.kubernetes.papers.tech'
  ) {
    super({
      symbol: 'TZBTC',
      name: 'Tezos BTC',
      marketSymbol: 'btc',
      identifier: 'xtz-btc',
      contractAddress: contractAddress,
      jsonRPCAPI: jsonRPCAPI,
      baseApiUrl: "https://tezos-babylonnet-conseil-1.kubernetes.papers.tech",
      baseApiKey: 'airgap00391',
      baseApiNetwork: 'babylonnet',
      network: TezosNetwork.BABYLONNET
    })
  }
}
