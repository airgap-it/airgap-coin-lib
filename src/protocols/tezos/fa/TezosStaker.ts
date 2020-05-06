import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'

export class TezosStaker extends TezosFAProtocol {

    constructor(
        contractAddress: string = 'KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv',
        jsonRPCAPI?: string,
        baseApiUrl?: string,
        baseApiKey?: string,
        baseApiNetwork?: string,
        network?: TezosNetwork
      ) {
        super({
          symbol: 'STKR',
          name: 'Staker',
          marketSymbol: 'stkr',
          identifier: 'xtz-stkr',
          feeDefaults: {
            low: '0.100',
            medium: '0.300',
            high: '0.500'
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