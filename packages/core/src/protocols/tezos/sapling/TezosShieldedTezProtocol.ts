import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { isHex } from '../../../utils/hex'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosAddress } from '../TezosAddress'
import { MichelsonList } from '../types/michelson/generics/MichelsonList'
import { MichelsonOption } from '../types/michelson/generics/MichelsonOption'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { MichelsonString } from '../types/michelson/primitives/MichelsonString'
import { TezosTransactionParameters } from '../types/operations/Transaction'
import { TezosSaplingWrappedTransaction } from '../types/sapling/TezosSaplingWrappedTransaction'
import { isMichelinePrimitive } from '../types/utils'

import { TezosSaplingProtocol } from './TezosSaplingProtocol'
import { TezosSaplingProtocolOptions } from './TezosSaplingProtocolOptions'

// An example sapling contract, to be removed
export class TezosShieldedTezProtocol extends TezosSaplingProtocol {
  constructor(options: TezosSaplingProtocolOptions = new TezosSaplingProtocolOptions()) {
    super(options)
  }

  public async prepareContractCalls(transactions: TezosSaplingWrappedTransaction[]): Promise<TezosContractCall[]> {
    const balances: BigNumber[] = transactions.map((transaction: TezosSaplingWrappedTransaction) =>
      isHex(transaction.signed) ? this.encoder.decodeBalanceFromTransaction(Buffer.from(transaction.signed, 'hex')) : new BigNumber(0)
    )

    const callAmount: BigNumber = balances.reduce(
      (sum: BigNumber, next: BigNumber) => (next.isNegative() ? sum.plus(next.negated()) : sum),
      new BigNumber(0)
    )

    const contractCall: TezosContractCall = await this.contract.createContractCall(
      'default',
      transactions.map((transaction: TezosSaplingWrappedTransaction) => [transaction.signed, transaction.unshieldTarget?.getValue()]),
      callAmount
    )

    return [contractCall]
  }

  public async parseParameters(parameters: TezosTransactionParameters): Promise<TezosSaplingWrappedTransaction[]> {
    if (parameters.entrypoint === 'default') {
      try {
        const callArgumentsList = MichelsonList.from(parameters.value, (pairJSON) =>
          MichelsonPair.from(
            pairJSON,
            undefined,
            (bytesJSON) => MichelsonBytes.from(bytesJSON, 'tx'),
            (optionJSON) =>
              MichelsonOption.from(
                optionJSON,
                (valueJSON) => {
                  if (isMichelinePrimitive('bytes', valueJSON)) {
                    return MichelsonBytes.from(valueJSON)
                  } else if (isMichelinePrimitive('string', valueJSON)) {
                    return MichelsonString.from(valueJSON)
                  } else {
                    return undefined
                  }
                },
                'unshieldTarget'
              )
          )
        ).asRawValue()

        return Array.isArray(callArgumentsList)
          ? Promise.all(
              callArgumentsList.map(async (args) => ({
                signed: args.tx,
                unshieldTarget: args.unshieldTarget
                  ? TezosAddress.isTzAddress(args.unshieldTarget)
                    ? await TezosAddress.fromValue(args.unshieldTarget)
                    : await TezosAddress.fromRawTz(args.unshieldTarget)
                  : undefined
              }))
            )
          : []
      } catch (error) {
        console.error(error)
        return []
      }
    }

    return []
  }
}
