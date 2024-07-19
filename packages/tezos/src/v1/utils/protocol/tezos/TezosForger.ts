import { Domain } from '@airgap/coinlib-core'
// import { localForger } from '@airgap/coinlib-core/dependencies/src/@taquito/local-forging-15.0.1/packages/taquito-local-forging/src/taquito-local-forging'
// import { ForgeParams } from '@airgap/coinlib-core/dependencies/src/@taquito/local-forging-15.0.1/packages/taquito-local-forging/src/interface'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'

import { TezosWrappedOperation } from '../../../types/operations/TezosWrappedOperation'
import { TezosSignedTransaction, TezosUnsignedTransaction } from '../../../types/transaction'
import { localForger, ForgeParams } from '@taquito/local-forging'

export class TezosForger {
  public async forgeOperation(wrappedOperation: TezosWrappedOperation): Promise<string> {
    return localForger.forge(wrappedOperation as any)
  }

  public async unforgeOperation(
    forged: string,
    type: (TezosSignedTransaction | TezosUnsignedTransaction)['type'] = 'unsigned'
  ): Promise<TezosWrappedOperation> {
    const minForgedLength: number =
      type === 'signed'
        ? 64 + 128 // branch + signature
        : 64 // branch

    if (forged.length < minForgedLength) {
      throw new ConditionViolationError(Domain.TEZOS, 'Not a valid signed transaction')
    }

    const binaryWithoutSignature: string = type === 'signed' ? forged.substring(0, forged.length - 128) : forged

    const unforged: ForgeParams = await localForger.parse(binaryWithoutSignature)

    return {
      branch: unforged.branch,
      contents: unforged.contents as any // as in v0, but maybe we should consider either converting between the types properly or just using operation types from `@taquito`?
    }
  }
}
