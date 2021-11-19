import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosUtils } from '../TezosUtils'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonType } from '../types/michelson/MichelsonType'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'

import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosBTCProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

enum TezosBTCContractEntrypoint {
  TOTAL_MINTED = 'getTotalMinted',
  TOTAL_BURNED = 'getTotalBurned'
}

export class TezosBTC extends TezosFA1p2Protocol {
  private static readonly bigMapKeyLedgerPrefix: string = '0x05070701000000066c65646765720a00000016'

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
    const values = await this.contract.conseilBigMapValues({
      predicates: [
        {
          field: 'key',
          operation: 'startsWith',
          set: [TezosBTC.bigMapKeyLedgerPrefix]
        }
      ]
    })

    return values
      .map((bigMapEntry) => {
        const addressHex = bigMapEntry.key.substring(TezosBTC.bigMapKeyLedgerPrefix.length)
        const address = TezosUtils.parseAddress(addressHex)
        let value: MichelsonType = MichelsonInt.from(0)
        try {
          if (bigMapEntry.value) {
            value = TezosUtils.parseHex(bigMapEntry.value)
          }
        } catch {}

        if (value instanceof MichelsonPair) {
          value = value.items[0].get()
        }

        const amount: BigNumber = value instanceof MichelsonInt ? value.value : new BigNumber(0)

        return {
          address,
          amount: amount.toFixed()
        }
      })
      .filter((value) => value.amount !== '0')
  }
}
