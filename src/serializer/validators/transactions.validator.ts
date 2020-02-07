import { UnsignedTransaction } from '../schemas/definitions/transaction-sign-request'
import { SignedTransaction } from '../schemas/definitions/transaction-sign-response'
import { EthereumTransactionValidator } from '../unsigned-transactions/ethereum-transactions.validator'
import { BitcoinTransactionValidator } from '../unsigned-transactions/bitcoin-transactions.validator'
import { AeternityTransactionValidator } from '../unsigned-transactions/aeternity-transactions.validator'
import { TezosTransactionValidator } from '../unsigned-transactions/tezos-transactions.validator'
import { CosmosTransactionValidator } from '../unsigned-transactions/cosmos-transactions.validator'
import { TezosBTCTransactionValidator } from '../unsigned-transactions/xtz-btc-transactions.validator'

export abstract class TransactionValidator {
  public abstract validateUnsignedTransaction(transaction: UnsignedTransaction): Promise<boolean>
  public abstract validateSignedTransaction(transaction: SignedTransaction): Promise<boolean> // TODO: SignedTransaction
}

export function serializationValidatorByProtocolIdentifier(protocolIdentifier: string): TransactionValidator {
  const validators = {
    eth: EthereumTransactionValidator,
    btc: BitcoinTransactionValidator,
    grs: BitcoinTransactionValidator,
    ae: AeternityTransactionValidator,
    xtz: TezosTransactionValidator,
    cosmos: CosmosTransactionValidator,
    'xtz-btc': TezosBTCTransactionValidator
  }

  const exactMatch = Object.keys(validators).find(protocol => protocolIdentifier === protocol)
  const startsWith = Object.keys(validators).find(protocol => protocolIdentifier.startsWith(protocol))
  let validator = exactMatch ? exactMatch : startsWith
  if (!validator) {
    throw Error(`Validator not implemented for ${protocolIdentifier}, ${exactMatch}, ${startsWith}, ${validator}`)
  }
  return new validators[validator]()
}
