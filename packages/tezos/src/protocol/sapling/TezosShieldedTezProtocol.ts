import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { isHex } from '@airgap/coinlib-core/utils/hex'

import { TezosContractCall } from '../contract/TezosContractCall'
import { MichelsonList } from '../types/michelson/generics/MichelsonList'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { TezosTransactionParameters } from '../types/operations/Transaction'

import { TezosSaplingProtocol } from './TezosSaplingProtocol'
import { TezosSaplingProtocolOptions } from './TezosSaplingProtocolOptions'

export class TezosShieldedTezProtocol extends TezosSaplingProtocol {
  constructor(options: TezosSaplingProtocolOptions = new TezosSaplingProtocolOptions()) {
    super(options)
  }

  public async prepareContractCalls(transactions: string[]): Promise<TezosContractCall[]> {
    const balances: BigNumber[] = transactions.map((transaction: string) => {
      const signedBuffer = Buffer.isBuffer(transaction) ? transaction : isHex(transaction) ? Buffer.from(transaction, 'hex') : undefined

      return signedBuffer ? this.encoder.decodeBalanceFromTransaction(signedBuffer) : new BigNumber(0)
    })

    const callAmount: BigNumber = balances.reduce(
      (sum: BigNumber, next: BigNumber) => (next.isNegative() ? sum.plus(next.negated()) : sum),
      new BigNumber(0)
    )

    const contractCall: TezosContractCall = await this.contract.createContractCall('default', transactions, callAmount)

    return [contractCall]
  }

  public async parseParameters(parameters: TezosTransactionParameters): Promise<string[]> {
    if (parameters.entrypoint === 'default') {
      try {
        const callArgumentsList = MichelsonList.from(parameters.value, (bytesJSON) => MichelsonBytes.from(bytesJSON, 'tx')).asRawValue()

        return Array.isArray(callArgumentsList) ? callArgumentsList.map((args) => args.tx) : []
      } catch (error) {
        console.error(error)
        return []
      }
    }

    return []
  }
}
