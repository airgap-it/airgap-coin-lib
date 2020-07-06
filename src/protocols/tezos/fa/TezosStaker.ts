import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'

import { TezosFA1Protocol } from './TezosFA1Protocol'

export class TezosStaker extends TezosFA1Protocol {
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
      contractAddress,
      jsonRPCAPI,
      baseApiUrl,
      baseApiKey,
      baseApiNetwork,
      network
    })
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    const values = await this.contract.bigMapValues()

    return values
      .map((value) => {
        return {
          address: TezosUtils.parseAddress(value.key.substring(2)),
          amount: value.value !== null ? value.value : '0'
        }
      })
      .filter((value) => value.amount !== '0')
  }
}
