import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { TezosFA2ContractEntrypoint } from '../../../types/fa/TezosFA2ContractEntrypoint'
import { MichelsonList } from '../../../types/michelson/generics/MichelsonList'
import { MichelsonPair } from '../../../types/michelson/generics/MichelsonPair'
import { MichelsonAddress } from '../../../types/michelson/primitives/MichelsonAddress'
import { MichelsonInt } from '../../../types/michelson/primitives/MichelsonInt'
import { TezosTransactionParameters } from '../../../types/operations/kinds/Transaction'
import { TezosFA2ProtocolNetwork, TezosUnits } from '../../../types/protocol'
import { parseAddress } from '../../pack'
import { TezosForger } from '../tezos/TezosForger'

import { TezosFAAccountant } from './TezosFAAccountant'

export class TezosFA2Accountant<_Units extends string> extends TezosFAAccountant<_Units> {
  public constructor(forger: TezosForger, protected readonly network: TezosFA2ProtocolNetwork) {
    super(forger, network)
  }

  protected transactionDetailsFromParameters(
    parameters: TezosTransactionParameters<TezosFA2ContractEntrypoint>
  ): Partial<AirGapTransaction<_Units, TezosUnits>>[] {
    const defaultDetails: Partial<AirGapTransaction<_Units, TezosUnits>> = {
      type: parameters.entrypoint
    }

    if (parameters.entrypoint !== 'transfer') {
      console.warn('Only calls to the transfer entrypoint can be converted to AirGapTransaction')

      return [defaultDetails]
    }

    try {
      const callArgumentsList = MichelsonList.from(parameters.value, (pairJSON: string) =>
        MichelsonPair.from(
          pairJSON,
          undefined,
          (fromJSON: string) => MichelsonAddress.from(fromJSON, 'from_'),
          (txsJSON: string) =>
            MichelsonList.from(
              txsJSON,
              (pairJSON: string) =>
                MichelsonPair.from(
                  pairJSON,
                  undefined,
                  (toJSON: string) => MichelsonAddress.from(toJSON, 'to_'),
                  (pairJSON: string) =>
                    MichelsonPair.from(
                      pairJSON,
                      undefined,
                      (tokenJSON: string) => MichelsonInt.from(tokenJSON, 'token_id'),
                      (amountJSON: string) => MichelsonInt.from(amountJSON, 'amount')
                    )
                ),
              'txs'
            )
        )
      ).asRawValue()

      return Array.isArray(callArgumentsList)
        ? callArgumentsList
            .map((callArguments: unknown) => {
              if (!this.isTransferRequest(callArguments)) {
                return []
              }

              const from: string = isHex(callArguments.from_) ? parseAddress(callArguments.from_) : callArguments.from_

              const transferDetails: [string, BigNumber, BigNumber][] = callArguments.txs.map((tx) => {
                const to: string = isHex(tx.to_) ? parseAddress(tx.to_) : tx.to_

                return [to, tx.token_id, tx.amount] as [string, BigNumber, BigNumber]
              })

              return transferDetails
                .map(([to, tokenId, amount]: [string, BigNumber, BigNumber]) => {
                  if (this.network.tokenId !== undefined && !tokenId.eq(this.network.tokenId)) {
                    return undefined
                  }

                  return {
                    ...defaultDetails,
                    from: [from],
                    to: [to],

                    amount: newAmount(amount, 'blockchain'),
                    type: {
                      name: parameters.entrypoint,
                      assetID: tokenId.toFixed()
                    }
                  }
                })
                .filter(
                  (partialDetails: Partial<AirGapTransaction<_Units, TezosUnits>> | undefined) => partialDetails !== undefined
                ) as AirGapTransaction<_Units, TezosUnits>[]
            })
            .reduce(
              (flatten: Partial<AirGapTransaction<_Units, TezosUnits>>[], next: Partial<AirGapTransaction<_Units, TezosUnits>>[]) =>
                flatten.concat(next),
              []
            )
        : [defaultDetails]
    } catch {
      return [defaultDetails]
    }
  }

  private isTransferRequest(
    obj: unknown
  ): obj is {
    from_: string
    txs: { to_: string; token_id: BigNumber; amount: BigNumber }[]
  } {
    const anyObj = obj as any

    return (
      anyObj instanceof Object &&
      typeof anyObj.from_ === 'string' &&
      Array.isArray(anyObj.txs) &&
      anyObj.txs.every(
        (tx: any) =>
          tx instanceof Object && typeof tx.to_ === 'string' && BigNumber.isBigNumber(tx.token_id) && BigNumber.isBigNumber(tx.amount)
      )
    )
  }
}
