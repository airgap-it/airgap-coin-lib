import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'

import { TezosFA12Protocol } from './TezosFA12Protocol'
import { RawTezosTransaction } from '../../../serializer/v1/unsigned-transactions/tezos-transactions.serializer'

export class TezosStaker extends TezosFA12Protocol {
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

  public async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
    callbackContract: string = this.callbackContract(),
    source?: string
  ): Promise<string> {
    throw new Error('Entrypoint `getAllowance` is not supported')
  }

  public async approve(spenderAddress: string, amount: string, fee: string, publicKey: string): Promise<RawTezosTransaction> {
    throw new Error('Entrypoint `approve` is not supported')
  }
}
