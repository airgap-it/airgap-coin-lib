import { assertNever, Domain } from '@airgap/coinlib-core'
import { NotFoundError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { TezosDelegationOperation } from '../../../types/operations/kinds/Delegation'
import { TezosOriginationOperation } from '../../../types/operations/kinds/Origination'
import { TezosRevealOperation } from '../../../types/operations/kinds/Reveal'
import { TezosOperation } from '../../../types/operations/kinds/TezosOperation'
import { TezosTransactionOperation } from '../../../types/operations/kinds/Transaction'
import { TezosOperationType } from '../../../types/operations/TezosOperationType'
import { TezosWrappedOperation } from '../../../types/operations/TezosWrappedOperation'
import { TezosProtocolNetwork, TezosUnits } from '../../../types/protocol'
import { TezosSignedTransaction, TezosUnsignedTransaction } from '../../../types/transaction'

import { TezosForger } from './TezosForger'

export class TezosAccountant<_Units extends string> {
  public constructor(protected readonly forger: TezosForger, protected readonly network: TezosProtocolNetwork) {}

  public async getDetailsFromTransaction(
    transaction: TezosUnsignedTransaction | TezosSignedTransaction
  ): Promise<AirGapTransaction<_Units, TezosUnits>[]> {
    const wrappedOperation: TezosWrappedOperation = await this.forger.unforgeOperation(transaction.binary, transaction.type)

    return this.getDetailsFromWrappedOperation(wrappedOperation)
  }

  public async getDetailsFromWrappedOperation(wrappedOperation: TezosWrappedOperation): Promise<AirGapTransaction<_Units, TezosUnits>[]> {
    return Promise.all(
      wrappedOperation.contents.map(async (content: TezosOperation) => {
        let operation: TezosRevealOperation | TezosTransactionOperation | TezosOriginationOperation | TezosDelegationOperation | undefined

        let partialTxs: Partial<AirGapTransaction<_Units, TezosUnits>>[] = []

        switch (content.kind) {
          case TezosOperationType.REVEAL:
            operation = content as TezosRevealOperation
            partialTxs = [
              {
                from: [operation.source],
                to: ['Reveal']
              }
            ]
            break
          case TezosOperationType.TRANSACTION:
            const tezosSpendOperation: TezosTransactionOperation = content as TezosTransactionOperation
            operation = tezosSpendOperation
            partialTxs = (await this.getDetailsFromTransactionOperation(tezosSpendOperation)).map(
              (tx: Partial<AirGapTransaction<_Units, TezosUnits>>): Partial<AirGapTransaction<_Units, TezosUnits>> => ({
                ...tx,
                extra: tezosSpendOperation.parameters
                  ? {
                      ...(tx.extra ?? {}),
                      parameters: tezosSpendOperation.parameters
                    }
                  : undefined
              })
            )
            break
          case TezosOperationType.ORIGINATION:
            {
              const tezosOriginationOperation: TezosOriginationOperation = content as TezosOriginationOperation
              operation = tezosOriginationOperation
              const delegate: string | undefined = tezosOriginationOperation.delegate
              partialTxs = [
                {
                  from: [operation.source],
                  amount: newAmount(tezosOriginationOperation.balance, 'blockchain'),
                  to: [delegate ? `Delegate: ${delegate}` : 'Origination']
                }
              ]
            }
            break
          case TezosOperationType.DELEGATION:
            {
              operation = content as TezosDelegationOperation
              const delegate: string | undefined = operation.delegate
              partialTxs = [
                {
                  from: [operation.source],
                  to: [delegate ? delegate : 'Undelegate']
                }
              ]
            }
            break
          case TezosOperationType.ENDORSEMENT:
          case TezosOperationType.SEED_NONCE_REVELATION:
          case TezosOperationType.DOUBLE_ENDORSEMENT_EVIDENCE:
          case TezosOperationType.DOUBLE_BAKING_EVIDENCE:
          case TezosOperationType.ACTIVATE_ACCOUNT:
          case TezosOperationType.PROPOSALS:
          case TezosOperationType.BALLOT:
            throw new UnsupportedError(Domain.TEZOS, 'operation not supported: ' + JSON.stringify(content.kind))
          default:
            // Exhaustive switch
            assertNever(content.kind)
            throw new NotFoundError(Domain.TEZOS, 'no operation to unforge found')
        }

        return partialTxs.map((partialTx: Partial<AirGapTransaction<_Units, TezosUnits>>) => {
          return {
            from: [],
            to: [],
            isInbound: false,

            amount: newAmount('0', 'blockchain'),
            fee: newAmount(operation !== undefined ? operation.fee : '0', 'blockchain'),
            network: this.network,
            json: content,
            ...partialTx
          }
        })
      })
    ).then((airGapTxs: AirGapTransaction<_Units, TezosUnits>[][]) =>
      airGapTxs.reduce(
        (flatten: AirGapTransaction<_Units, TezosUnits>[], next: AirGapTransaction<_Units, TezosUnits>[]) => flatten.concat(next),
        []
      )
    )
  }

  protected async getDetailsFromTransactionOperation(
    transactionOperation: TezosTransactionOperation
  ): Promise<Partial<AirGapTransaction<_Units, TezosUnits>>[]> {
    return [
      {
        from: [transactionOperation.source],
        to: [transactionOperation.destination],
        amount: newAmount(transactionOperation.amount, 'blockchain')
      }
    ]
  }
}
