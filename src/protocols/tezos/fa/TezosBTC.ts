import { TezosContractEntity } from '../contract/TezosContractEntity'
import { TezosContractPair } from '../contract/TezosContractPair'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosUtils } from '../TezosUtils'

import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosBTCProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

export class TezosBTC extends TezosFAProtocol {
  private static readonly bigMapKeyLedgerPrefix: string = '0x05070701000000066c65646765720a00000016'

  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosBTCProtocolConfig())
  ) {
    super(options)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    const values = await this.contract.bigMapValues([
      {
        field: 'key' as const,
        operation: 'startsWith' as const,
        set: [TezosBTC.bigMapKeyLedgerPrefix]
      }
    ])

    return values
      .map((bigMapEntry) => {
        const addressHex = bigMapEntry.key.substring(TezosBTC.bigMapKeyLedgerPrefix.length)
        const address = TezosUtils.parseAddress(addressHex)
        let value: number | string | TezosContractEntity = '0'
        try {
          value = bigMapEntry.value ? TezosUtils.parseHex(bigMapEntry.value) : '0'
        } catch {}
        if (value instanceof TezosContractPair) {
          value = value.first
        }

        return {
          address,
          amount: (value as number).toString()
        }
      })
      .filter((value) => value.amount !== '0')
  }
}
