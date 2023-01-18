import { Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { PropertyUndefinedError } from '@airgap/coinlib-core/errors'
import { isHex } from '@airgap/coinlib-core/utils/hex'

import { TezosContractCall } from '../contract/TezosContractCall'
import { MichelsonList } from '../types/michelson/generics/MichelsonList'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { TezosTransactionParameters } from '../types/operations/Transaction'

import { TezosSaplingProtocol } from './TezosSaplingProtocol'
import { TezosSaplingProtocolOptions } from './TezosSaplingProtocolOptions'

export class TezosShieldedTezProtocol extends TezosSaplingProtocol {
  private static readonly typeHash: string = '1724054251'
  private static readonly codeHash: string = '926964708'

  constructor(options: TezosSaplingProtocolOptions = new TezosSaplingProtocolOptions()) {
    super(options)
  }

  public async isContractValid(address: string): Promise<boolean> {
    if (!address.startsWith('KT1')) {
      return false
    }

    try {
      const { typeHash, codeHash } = await this.options.network.extras.indexerClient.getContractCodeHash(address)

      return typeHash === TezosShieldedTezProtocol.typeHash && codeHash === TezosShieldedTezProtocol.codeHash
    } catch (error) {
      return false
    }
  }

  public async prepareContractCalls(transactions: string[]): Promise<TezosContractCall[]> {
    if (this.contract === undefined) {
      throw new PropertyUndefinedError(Domain.TEZOS, 'Contract address not set.')
    }

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
        const callArgumentsList = MichelsonList.from(parameters.value, (bytesJSON: unknown) =>
          MichelsonBytes.from(bytesJSON, 'tx')
        ).asRawValue()

        return Array.isArray(callArgumentsList) ? callArgumentsList.map((args) => args.tx) : []
      } catch (error) {
        console.error(error)
        return []
      }
    }

    return []
  }
}
