import { assertNever, Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { PublicKey } from '@airgap/module-kit'

import { TezosDelegationOperation } from '../types/operations/kinds/Delegation'
import { TezosOriginationOperation } from '../types/operations/kinds/Origination'
import { TezosRevealOperation } from '../types/operations/kinds/Reveal'
import { TezosOperation } from '../types/operations/kinds/TezosOperation'
import { TezosTransactionOperation } from '../types/operations/kinds/Transaction'
import { TezosOperationType } from '../types/operations/TezosOperationType'

import { convertPublicKey } from './key'

export const TRANSACTION_FEE: number = 1400
export const REVEAL_FEE: number = 1300

export const ORIGINATION_SIZE: number = 257
export const STORAGE_COST_PER_BYTE: number = 1000

export const ACTIVATION_BURN: number = ORIGINATION_SIZE * STORAGE_COST_PER_BYTE
export const ORIGINATION_BURN: number = ORIGINATION_SIZE * STORAGE_COST_PER_BYTE // https://tezos.stackexchange.com/a/787

export function createRevealOperation(
  counter: BigNumber,
  publicKey: PublicKey,
  address: string,
  fee: string = REVEAL_FEE.toString()
): TezosRevealOperation {
  const encodedPublicKey: PublicKey = convertPublicKey(publicKey, 'encoded')

  const operation: TezosRevealOperation = {
    kind: TezosOperationType.REVEAL,
    fee,
    gas_limit: '10000', // taken from conseiljs
    storage_limit: '0', // taken from conseiljs
    counter: counter.toFixed(),
    public_key: encodedPublicKey.value,
    source: address
  }

  return operation
}

export function getAmountUsedByPreviousOperations(operations: TezosOperation[]): BigNumber {
  let amountUsed: BigNumber = new BigNumber(0)

  operations.forEach((operation: TezosOperation) => {
    switch (operation.kind) {
      case TezosOperationType.REVEAL:
        const revealOperation = operation as TezosRevealOperation
        amountUsed = amountUsed.plus(revealOperation.fee)
        break
      case TezosOperationType.ORIGINATION:
        const originationOperation: TezosOriginationOperation = operation as TezosOriginationOperation
        amountUsed = amountUsed.plus(originationOperation.fee)
        amountUsed = amountUsed.plus(originationOperation.balance)
        break
      case TezosOperationType.DELEGATION:
        const delegationOperation = operation as TezosDelegationOperation
        amountUsed = amountUsed.plus(delegationOperation.fee)
        break
      case TezosOperationType.TRANSACTION:
        const spendOperation: TezosTransactionOperation = operation as TezosTransactionOperation
        amountUsed = amountUsed.plus(spendOperation.fee)
        amountUsed = amountUsed.plus(spendOperation.amount)
        break
      case TezosOperationType.ENDORSEMENT:
      case TezosOperationType.SEED_NONCE_REVELATION:
      case TezosOperationType.DOUBLE_ENDORSEMENT_EVIDENCE:
      case TezosOperationType.DOUBLE_BAKING_EVIDENCE:
      case TezosOperationType.ACTIVATE_ACCOUNT:
      case TezosOperationType.PROPOSALS:
      case TezosOperationType.BALLOT:
        break
      default:
        // Exhaustive switch
        assertNever(operation.kind)
        throw new UnsupportedError(Domain.TEZOS, `operation type not supported ${JSON.stringify(operation.kind)}`)
    }
  })

  return amountUsed
}
