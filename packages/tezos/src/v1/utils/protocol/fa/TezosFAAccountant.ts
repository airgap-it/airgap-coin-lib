import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { TezosTransactionOperation, TezosTransactionParameters } from '../../../types/operations/kinds/Transaction'
import { TezosUnits } from '../../../types/protocol'
import { TezosAccountant } from '../tezos/TezosAccountant'

export abstract class TezosFAAccountant<_Units extends string> extends TezosAccountant<_Units> {
  protected abstract transactionDetailsFromParameters(
    parameters: TezosTransactionParameters
  ): Partial<AirGapTransaction<_Units, TezosUnits>>[]

  protected async getDetailsFromTransactionOperation(
    transactionOperation: TezosTransactionOperation
  ): Promise<Partial<AirGapTransaction<_Units, TezosUnits>>[]> {
    let partials: Partial<AirGapTransaction<_Units, TezosUnits>>[] = []
    try {
      partials = transactionOperation.parameters ? this.transactionDetailsFromParameters(transactionOperation.parameters) ?? [] : []
    } catch {}

    if (partials.length === 0) {
      partials.push({})
    }

    return partials.map((partial: Partial<AirGapTransaction<_Units, TezosUnits>>) => {
      return {
        from: [transactionOperation.source],
        amount: newAmount(transactionOperation.amount, 'blockchain'),
        to: [transactionOperation.destination],
        ...partial
      }
    })
  }
}
