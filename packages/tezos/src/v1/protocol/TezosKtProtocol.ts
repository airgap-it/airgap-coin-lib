import { Domain } from '@airgap/coinlib-core'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  BalanceError,
  ConditionViolationError,
  InvalidValueError,
  NetworkError,
  OperationFailedError,
  UnsupportedError
} from '@airgap/coinlib-core/errors'
import {
  AddressWithCursor,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  FeeEstimation,
  KeyPair,
  newAmount,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  RecursivePartial,
  Secret,
  SecretKey,
  Signature,
  SubProtocolType,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'

import { createTezosIndexerClient } from '../indexer/factory'
import { TezosIndexerClient } from '../indexer/TezosIndexerClient'
import { TezosKtAddressCursor } from '../types/address'
import { TezosOperation } from '../types/operations/kinds/TezosOperation'
import { TezosTransactionOperation } from '../types/operations/kinds/Transaction'
import { TezosOperationType } from '../types/operations/TezosOperationType'
import { TezosWrappedOperation } from '../types/operations/TezosWrappedOperation'
import { TezosProtocolNetwork, TezosProtocolOptions, TezosUnits } from '../types/protocol'
import { TezosKtTransactionCursor, TezosSignedTransaction, TezosTransactionCursor, TezosUnsignedTransaction } from '../types/transaction'
import { decodeBase58 } from '../utils/encoding'
import { createRevealOperation } from '../utils/operations'

import { createTezosProtocol, createTezosProtocolOptions, TezosProtocol } from './TezosProtocol'

// Interface

export interface TezosKtProtocol
  extends AirGapProtocol<
    {
      AddressCursor: TezosKtAddressCursor
      AddressResult: AddressWithCursor<TezosKtAddressCursor>
      ProtocolNetwork: TezosProtocolNetwork
      Units: TezosUnits
      UnsignedTransaction: TezosUnsignedTransaction
      SignedTransaction: TezosSignedTransaction
      TransactionCursor: TezosKtTransactionCursor
    },
    'SubProtocolExtension',
    'MultiAddressPublicKeyExtension',
    'MultiAddressAccountExtension'
  > {
  migrateKtContract(publicKey: PublicKey, destinationContract: string): Promise<TezosUnsignedTransaction>
}

// Implementation

const INDEX_LIMIT: number = 10000
const MIGRATION_FEE: number = 5000

class TezosKtProtocolImpl implements TezosKtProtocol {
  private readonly tezos: TezosProtocol

  private readonly indexerClient: TezosIndexerClient

  public constructor(options: RecursivePartial<TezosProtocolOptions>) {
    const completeOptions = createTezosProtocolOptions(options.network)

    this.tezos = createTezosProtocol(completeOptions)
    this.indexerClient = createTezosIndexerClient(completeOptions.network.indexer)
  }

  // SubProtocol

  public async getType(): Promise<SubProtocolType> {
    return 'account'
  }

  // Common

  public async getMetadata(): Promise<ProtocolMetadata<TezosUnits>> {
    const tezosMetadata: ProtocolMetadata<TezosUnits> = await this.tezos.getMetadata()

    return {
      ...tezosMetadata,
      account: {
        ...(tezosMetadata.account ?? {}),
        address: {
          ...(tezosMetadata.account?.address ?? {}),
          regex: '^(tz1|KT1)[1-9A-Za-z]{33}$'
        }
      }
    }
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor<TezosKtAddressCursor>> {
    const tzAddress: string = await this.tezos.getAddressFromPublicKey(publicKey)

    return {
      address: tzAddress,
      cursor: {
        hasNext: true,
        index: 0
      }
    }
  }

  public async getNextAddressFromPublicKey(
    publicKey: PublicKey,
    cursor: TezosKtAddressCursor
  ): Promise<AddressWithCursor<TezosKtAddressCursor> | undefined> {
    if (!cursor.hasNext) {
      return undefined
    }

    const tzAddress: string = await this.tezos.getAddressFromPublicKey(publicKey)
    const ktAddresses: string[] = await this.indexerClient.getDelegatorContracts(tzAddress, INDEX_LIMIT)

    const index = cursor.index + 1
    const address: string = [tzAddress, ...ktAddresses.reverse()][index]

    return {
      address,
      cursor: {
        hasNext: index < INDEX_LIMIT + 1 /* tzAddress + INDEX_LIMIT * ktAddresses */,
        index
      }
    }
  }

  public async getDetailsFromTransaction(
    transaction: TezosUnsignedTransaction | TezosSignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<TezosUnits>[]> {
    return this.tezos.getDetailsFromTransaction(transaction, publicKey)
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    return this.tezos.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    return this.tezos.encryptAsymmetricWithPublicKey(payload, publicKey)
  }

  // Offline

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair> {
    return this.tezos.getKeyPairFromSecret(secret, derivationPath)
  }

  public async signTransactionWithSecretKey(transaction: TezosUnsignedTransaction, secretKey: SecretKey): Promise<TezosSignedTransaction> {
    return this.tezos.signTransactionWithSecretKey(transaction, secretKey)
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    return this.tezos.signMessageWithKeyPair(message, keyPair)
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    return this.decryptAsymmetricWithKeyPair(payload, keyPair)
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    return this.encryptAESWithSecretKey(payload, secretKey)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    return this.decryptAESWithSecretKey(payload, secretKey)
  }

  // Online

  public async getNetwork(): Promise<TezosProtocolNetwork> {
    return this.tezos.getNetwork()
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: TezosKtTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosKtTransactionCursor, TezosUnits>> {
    const address: AddressWithCursor<TezosKtAddressCursor> = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address.address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: TezosKtTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosKtTransactionCursor, TezosUnits>> {
    const transactions: AirGapTransactionsWithCursor<TezosTransactionCursor, TezosUnits> = await this.tezos.getTransactionsForAddress(
      address,
      limit,
      this.toTezosTransactionCursor(cursor, address)
    )

    return {
      transactions: transactions.transactions,
      cursor: {
        hasNext: transactions.cursor.hasNext,
        offsets: Object.assign(cursor?.offsets ?? {}, { [address]: transactions.cursor.offset })
      }
    }
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: TezosKtTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<TezosKtTransactionCursor, TezosUnits>> {
    if (addresses.length === 0) {
      throw new ConditionViolationError(Domain.TEZOS, 'At least one address must be provided.')
    }

    const singleLimit: number = new BigNumber(limit).div(addresses.length).decimalPlaces(0, BigNumber.ROUND_FLOOR).toNumber()
    const singleLimitCompensation: number = Math.max(limit - addresses.length * singleLimit, 0)

    const allTransactions: [string, AirGapTransactionsWithCursor<TezosTransactionCursor, TezosUnits>][] = await Promise.all(
      addresses.map(async (address: string, index: number) => {
        const limit: number = index === 0 ? singleLimit + singleLimitCompensation : singleLimit
        const transactions: AirGapTransactionsWithCursor<TezosTransactionCursor, TezosUnits> = await this.tezos.getTransactionsForAddress(
          address,
          limit,
          this.toTezosTransactionCursor(cursor, address)
        )

        return [address, transactions]
      })
    )

    return allTransactions.reduce(
      (
        acc: AirGapTransactionsWithCursor<TezosKtTransactionCursor, TezosUnits>,
        next: [string, AirGapTransactionsWithCursor<TezosTransactionCursor, TezosUnits>]
      ) => {
        // tslint:disable-next-line: no-object-literal-type-assertion
        return {
          transactions: acc.transactions.concat(next[1].transactions),
          cursor: {
            hasNext: acc.cursor.hasNext || next[1].cursor.hasNext,
            offsets: Object.assign(acc.cursor.offsets, { [next[0]]: next[1].cursor.offset })
          }
        } as AirGapTransactionsWithCursor<TezosKtTransactionCursor, TezosUnits>
      },
      {
        transactions: [],
        cursor: { hasNext: false, offsets: {} }
        // tslint:disable-next-line: no-object-literal-type-assertion
      } as AirGapTransactionsWithCursor<TezosKtTransactionCursor, TezosUnits>
    )
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<TezosUnits>> {
    return this.tezos.getBalanceOfPublicKey(publicKey)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<TezosUnits>> {
    return this.tezos.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<TezosUnits>> {
    const metadata: ProtocolMetadata<TezosUnits> = await this.getMetadata()

    const allBalances: Balance<TezosUnits>[] = await Promise.all(addresses.map((address) => this.tezos.getBalanceOfAddress(address)))

    return allBalances.reduce((acc: Balance<TezosUnits>, next: Balance<TezosUnits>) => ({
      total: newAmount(
        new BigNumber(newAmount(acc.total).blockchain(metadata.units).value).plus(newAmount(next.total).blockchain(metadata.units).value),
        'blockchain'
      )
    }))
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    _to: string[],
    _configuration?: TransactionConfiguration<TezosUnits>
  ): Promise<Amount<TezosUnits>> {
    const balance: Balance<TezosUnits> = await this.getBalanceOfPublicKey(publicKey)

    return balance.total
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<TezosUnits>[]
  ): Promise<FeeEstimation<TezosUnits>> {
    return newAmount(MIGRATION_FEE, 'blockchain')
  }

  public async prepareTransactionWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<TezosUnits>[],
    _configuration?: TransactionConfiguration<TezosUnits>
  ): Promise<TezosUnsignedTransaction> {
    throw new UnsupportedError(Domain.TEZOS, 'sending funds from KT addresses is not supported. Please use the migration feature.')
  }

  public async broadcastTransaction(transaction: TezosSignedTransaction): Promise<string> {
    return this.tezos.broadcastTransaction(transaction)
  }

  // Custom

  public async migrateKtContract(publicKey: PublicKey, destinationContract: string): Promise<TezosUnsignedTransaction> {
    const metadata: ProtocolMetadata<TezosUnits> = await this.getMetadata()

    let counter: BigNumber = new BigNumber(1)
    let branch: string = ''

    const operations: TezosOperation[] = []

    const tzAddress: string = await this.tezos.getAddressFromPublicKey(publicKey)

    const balanceOfManager: Balance<TezosUnits> = await this.tezos.getBalanceOfAddress(tzAddress)
    const wrappedBalanceOfManager: BigNumber = new BigNumber(newAmount(balanceOfManager.total).blockchain(metadata.units).value)

    if (wrappedBalanceOfManager.isLessThan(MIGRATION_FEE)) {
      throw new BalanceError(Domain.TEZOS, 'not enough balance on tz address for fee')
    }

    const amount: Balance<TezosUnits> = await this.getBalanceOfAddress(destinationContract)
    const wrappedAmount: BigNumber = new BigNumber(newAmount(amount.total).blockchain(metadata.units).value)

    const network: TezosProtocolNetwork = await this.tezos.getNetwork()
    const results: AxiosResponse[] | void = await Promise.all([
      axios.get(`${network.rpcUrl}/chains/main/blocks/head/context/contracts/${tzAddress}/counter`),
      axios.get(`${network.rpcUrl}/chains/main/blocks/head~2/hash`),
      axios.get(`${network.rpcUrl}/chains/main/blocks/head/context/contracts/${tzAddress}/manager_key`)
    ]).catch((error) => {
      if (error.response && error.response.status !== 404) {
        throw new NetworkError(Domain.TEZOS, error as AxiosError)
      }
    })

    counter = new BigNumber(results[0].data).plus(1)
    branch = results[1].data

    const accountManager: string = results[2].data

    // check if we have revealed the address already
    if (!accountManager) {
      operations.push(createRevealOperation(counter, publicKey, tzAddress))
      counter = counter.plus(1)
    }

    let hexDestination: string = decodeBase58(tzAddress).toString('hex')

    if (hexDestination.length > 42) {
      // must be less or equal 21 bytes
      throw new InvalidValueError(Domain.TEZOS, 'provided source is invalid')
    }

    while (hexDestination.length !== 42) {
      // fill up with 0s to match 21 bytes
      hexDestination = `0${hexDestination}`
    }

    // Taken from https://blog.nomadic-labs.com/babylon-update-instructions-for-delegation-wallet-developers.html#transfer-from-a-managertz-smart-contract-to-an-implicit-tz-account
    const spendOperation: TezosTransactionOperation = {
      kind: TezosOperationType.TRANSACTION,
      fee: MIGRATION_FEE.toString(),
      gas_limit: '26283',
      storage_limit: '0',
      amount: '0',
      counter: counter.toFixed(),
      destination: destinationContract,
      source: tzAddress,
      parameters: {
        entrypoint: 'do',
        value: [
          { prim: 'DROP' },
          { prim: 'NIL', args: [{ prim: 'operation' }] },
          {
            prim: 'PUSH',
            args: [
              { prim: 'key_hash' },
              {
                bytes: hexDestination
              }
            ]
          },
          { prim: 'IMPLICIT_ACCOUNT' },
          {
            prim: 'PUSH',
            args: [{ prim: 'mutez' }, { int: wrappedAmount.toString(10) }]
          },
          { prim: 'UNIT' },
          { prim: 'TRANSFER_TOKENS' },
          { prim: 'CONS' }
        ]
      }
    }

    operations.push(spendOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx: string = await this.tezos.forgeOperation(tezosWrappedOperation)

      return newUnsignedTransaction<TezosUnsignedTransaction>({ binary: binaryTx })
    } catch (error) {
      console.warn(error.message)
      throw new OperationFailedError(Domain.TEZOS, 'Forging Tezos TX failed.')
    }
  }

  private toTezosTransactionCursor(cursor: TezosKtTransactionCursor | undefined, address: string): TezosTransactionCursor | undefined {
    return cursor && cursor.offsets[address] ? { hasNext: cursor.hasNext, offset: cursor.offsets[address] } : undefined
  }
}

// Factory

export function createTezosKtProtocol(options: RecursivePartial<TezosProtocolOptions> = {}): TezosKtProtocol {
  return new TezosKtProtocolImpl(options)
}
