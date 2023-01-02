import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { TezosFA1ContractEntrypoint } from '../../../types/fa/TezosFA1ContractEntrypoint'
import { MichelsonPair } from '../../../types/michelson/generics/MichelsonPair'
import { MichelsonAddress } from '../../../types/michelson/primitives/MichelsonAddress'
import { MichelsonInt } from '../../../types/michelson/primitives/MichelsonInt'
import { TezosTransactionParameters } from '../../../types/operations/kinds/Transaction'
import { TezosUnits } from '../../../types/protocol'
import { parseAddress } from '../../pack'

import { TezosFAAccountant } from './TezosFAAccountant'

export class TezosFA1Accountant<_Units extends string> extends TezosFAAccountant<_Units> {
  protected transactionDetailsFromParameters(
    parameters: TezosTransactionParameters<TezosFA1ContractEntrypoint>
  ): Partial<AirGapTransaction<_Units, TezosUnits>>[] {
    const defaultDetails: Partial<AirGapTransaction<_Units, TezosUnits>> = {
      type: parameters.entrypoint
    }

    if (parameters.entrypoint !== 'transfer') {
      console.warn('Only calls to the transfer entrypoint can be converted to AirGapTransaction')

      return [defaultDetails]
    }

    try {
      const callArguments = MichelsonPair.from(
        parameters.value,
        undefined,
        (fromJSON: string) => MichelsonAddress.from(fromJSON, 'from'),
        (pairJSON: string) =>
          MichelsonPair.from(
            pairJSON,
            undefined,
            (toJSON: string) => MichelsonAddress.from(toJSON, 'to'),
            (valueJSON: string) => MichelsonInt.from(valueJSON, 'value')
          )
      ).asRawValue()

      if (!this.isTransferRequest(callArguments)) {
        return [defaultDetails]
      }

      return [
        {
          ...defaultDetails,
          from: [isHex(callArguments.from) ? parseAddress(callArguments.from) : callArguments.from],
          to: [isHex(callArguments.to) ? parseAddress(callArguments.to) : callArguments.to],
          amount: newAmount(callArguments.value, 'blockchain')
        }
      ]
    } catch {
      return [defaultDetails]
    }
  }

  private isTransferRequest(obj: unknown): obj is { from: string; to: string; value: BigNumber } {
    const anyObj: any = obj as any

    return (
      anyObj instanceof Object && typeof anyObj.from === 'string' && typeof anyObj.to === 'string' && BigNumber.isBigNumber(anyObj.value)
    )
  }
}
