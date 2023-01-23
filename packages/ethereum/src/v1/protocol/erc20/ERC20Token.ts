import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import * as ethUtil from '@airgap/coinlib-core/dependencies/src/ethereumjs-util-5.2.0'
import { BalanceError, ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import {
  AirGapInterface,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  FeeDefaults,
  isAmount,
  newAmount,
  newUnsignedTransaction,
  PublicKey,
  SecretKey,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'
import { FeeMarketEIP1559Transaction, TransactionFactory } from '@ethereumjs/tx'

import { EthereumInfoClient, EthereumInfoClientTransactionsResult } from '../../clients/info/EthereumInfoClient'
import { EtherscanInfoClient } from '../../clients/info/EtherscanInfoClient'
import { AirGapNodeClient, EthereumRPCDataTransfer } from '../../clients/node/AirGapNodeClient'
import { EthereumNodeClient } from '../../clients/node/EthereumNodeClient'
import {
  ERC20TokenMetadata,
  ERC20TokenOptions,
  EthereumProtocolNetwork,
  EthereumProtocolOptions,
  EthereumUnits
} from '../../types/protocol'
import {
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTransactionCursor,
  EthereumUnsignedTransaction
} from '../../types/transaction'
import { EthereumUtils } from '../../utils/EthereumUtils'
import { EthereumBaseProtocol, EthereumBaseProtocolImpl } from '../EthereumBaseProtocol'
import { ETHEREUM_MAINNET_PROTOCOL_NETWORK } from '../EthereumProtocol'

const EthereumTransaction = require('@airgap/coinlib-core/dependencies/src/ethereumjs-tx-1.3.7/index')

// Interface

export interface ERC20Token extends AirGapInterface<EthereumBaseProtocol<string>, 'SingleTokenSubProtocol'> {}

// Implementation

class ERC20TokenImpl extends EthereumBaseProtocolImpl<string> implements ERC20Token {
  private readonly contractAddress: string

  public constructor(nodeClient: EthereumNodeClient, infoClient: EthereumInfoClient, options: ERC20TokenOptions) {
    super(nodeClient, infoClient, {
      network: options.network,

      name: options.name,
      identifier: options.identifier,

      units: options.units,
      mainUnit: options.mainUnit
    })
    this.contractAddress = options.contractAddress
  }

  // SubProtocol

  public async getType(): Promise<'token'> {
    return 'token'
  }

  public async mainProtocol(): Promise<string> {
    return MainProtocolSymbols.ETH
  }

  public async getContractAddress(): Promise<string> {
    return this.contractAddress
  }

  // Common

  public async getDetailsFromTransaction(
    transaction: EthereumSignedTransaction | EthereumUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<string, EthereumUnits>[]> {
    const ethTransactionDetails: AirGapTransaction<string, EthereumUnits>[] = await super.getDetailsFromTransaction(transaction, publicKey)

    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedContractTransaction(transaction, ethTransactionDetails)
      case 'unsigned':
        return this.getDetailsFromUnsignedContractTransaction(transaction, ethTransactionDetails)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.ETHEREUM, 'Unsupported transaction type.')
    }
  }

  private async getDetailsFromSignedContractTransaction(
    transaction: EthereumSignedTransaction,
    ethTransactionDetails: AirGapTransaction<string, EthereumUnits>[]
  ): Promise<AirGapTransaction<string, EthereumUnits>[]> {
    if (ethTransactionDetails.length !== 1) {
      throw new ConditionViolationError(Domain.ERC20, 'More than one ETH transaction detected.')
    }

    const extractedTx = new EthereumTransaction(transaction.serialized)
    const tokenTransferDetails = new EthereumRPCDataTransfer(`0x${extractedTx.data.toString('hex')}`)

    return [
      {
        ...ethTransactionDetails[0],
        to: [ethUtil.toChecksumAddress(tokenTransferDetails.recipient)],
        amount: newAmount(tokenTransferDetails.amount, 'blockchain')
      }
    ]
  }

  private async getDetailsFromUnsignedContractTransaction(
    transaction: EthereumUnsignedTransaction,
    ethTransactionDetails: AirGapTransaction<string, EthereumUnits>[]
  ): Promise<AirGapTransaction<string, EthereumUnits>[]> {
    if (ethTransactionDetails.length !== 1) {
      throw new ConditionViolationError(Domain.ERC20, 'More than one ETH transaction detected.')
    }

    let data: string
    if (transaction.ethereumType === 'raw') {
      data = transaction.data
    } else {
      const typedTransaction: FeeMarketEIP1559Transaction = TransactionFactory.fromSerializedData(
        Buffer.from(transaction.serialized, 'hex')
      ) as FeeMarketEIP1559Transaction

      data = typedTransaction.data.toString('hex')
    }

    const tokenTransferDetails = new EthereumRPCDataTransfer(data)

    return [
      {
        ...ethTransactionDetails[0],
        to: [ethUtil.toChecksumAddress(tokenTransferDetails.recipient)],
        amount: newAmount(tokenTransferDetails.amount, 'blockchain')
      }
    ]
  }

  // Offline

  public async signTransactionWithSecretKey(
    transaction: EthereumUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<EthereumSignedTransaction> {
    if (transaction.ethereumType !== 'raw') {
      // no v0 implementation
      throw new ConditionViolationError(Domain.ERC20, 'Unsupported unsigned transaction type.')
    }

    const rawTransaction: EthereumRawUnsignedTransaction = {
      ...transaction,
      data:
        !transaction.data || transaction.data === '0x'
          ? new EthereumRPCDataTransfer(transaction.to, transaction.value).abiEncoded()
          : transaction.data
    }

    return super.signTransactionWithSecretKey(rawTransaction, secretKey)
  }

  // Online

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<EthereumTransactionCursor, string, EthereumUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<EthereumTransactionCursor, string, EthereumUnits>> {
    return this.getTransactionsForAddresses([address], limit, cursor)
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<EthereumTransactionCursor, string, EthereumUnits>> {
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<EthereumInfoClientTransactionsResult>[] = []
      for (const address of addresses) {
        promises.push(this.infoClient.fetchContractTransactions(this.contractAddress, address, limit, cursor))
      }

      Promise.all(promises)
        .then((values) => {
          const page = Math.max(...values.map((txResult) => txResult.cursor.page))
          const transactions: AirGapTransaction<string, EthereumUnits>[] = values.reduce((acc, current) => {
            return acc.concat(
              current.transactions.map((tx) => ({
                ...tx,
                amount: newAmount(tx.amount.value, 'blockchain'),
                fee: newAmount<EthereumUnits>(tx.fee.value, 'blockchain'),
                network: this.options.network
              }))
            )
          }, [] as AirGapTransaction<string, EthereumUnits>[])

          const hasNext: boolean = transactions.length >= limit

          overallResolve({
            transactions,
            cursor: {
              hasNext,
              page: hasNext ? page : undefined
            }
          })
        })
        .catch(overallReject)
    })
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance> {
    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance> {
    const balances: BigNumber[] = await Promise.all(
      addresses.map((address: string) => {
        return this.nodeClient.callBalanceOf(this.contractAddress, address)
      })
    )

    const totalBalance: BigNumber = balances.reduce((a: BigNumber, b: BigNumber) => a.plus(b))

    return { total: newAmount(totalBalance, 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionConfiguration<EthereumUnits>
  ): Promise<Amount> {
    const balance: Balance = await this.getBalanceOfPublicKey(publicKey)

    return balance.transferable ?? balance.total
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails[],
    configuration?: TransactionConfiguration<EthereumUnits>
  ): Promise<EthereumUnsignedTransaction> {
    if (details.length !== 1) {
      throw new ConditionViolationError(Domain.ETHEREUM, 'you cannot have 0 transaction details')
    }

    let fee: Amount<EthereumUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<EthereumUnits> = await this.getTransactionFeeWithPublicKey(publicKey, details)
      fee = estimatedFee.medium
    }

    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(this.feeUnits).value)
    const wrappedAmount: BigNumber = new BigNumber(newAmount(details[0].amount).blockchain(this.units).value)

    const balance: Balance = await this.getBalanceOfPublicKey(publicKey)
    const wrappedBalance: BigNumber = new BigNumber(newAmount(balance.transferable ?? balance.total).blockchain(this.units).value)

    if (wrappedBalance.isGreaterThanOrEqualTo(wrappedAmount)) {
      const address: string = await this.getAddressFromPublicKey(publicKey)
      const ethBalance: Balance = await super.getBalanceOfAddress(address)
      const wrappedEthBalance: BigNumber = new BigNumber(newAmount(ethBalance.total).blockchain(this.units).value)

      const estimatedGas: BigNumber = await this.estimateGas(address, details[0].to, wrappedAmount)

      if (wrappedEthBalance.isGreaterThanOrEqualTo(wrappedFee)) {
        const txCount: number = await this.nodeClient.fetchTransactionCount(address)
        const gasPrice: BigNumber = wrappedFee.isEqualTo(0)
          ? new BigNumber(0)
          : wrappedFee.div(estimatedGas).integerValue(BigNumber.ROUND_CEIL)
        const transaction: EthereumRawUnsignedTransaction = newUnsignedTransaction({
          ethereumType: 'raw',
          nonce: EthereumUtils.toHex(txCount),
          gasLimit: EthereumUtils.toHex(estimatedGas.toFixed()),
          gasPrice: EthereumUtils.toHex(gasPrice.toFixed()),
          to: this.contractAddress,
          value: EthereumUtils.toHex(new BigNumber(0).toFixed()),
          chainId: this.options.network.chainId,
          data: new EthereumRPCDataTransfer(details[0].to, EthereumUtils.toHex(wrappedAmount.toFixed())).abiEncoded()
        })

        return transaction
      } else {
        throw new BalanceError(Domain.ERC20, 'not enough ETH balance')
      }
    } else {
      throw new BalanceError(Domain.ERC20, 'not enough token balance')
    }
  }

  // Custom

  protected async estimateGas(
    fromAddress: string,
    toAddress: string,
    amount: string | number | BigNumber | Amount,
    _data?: string
  ): Promise<BigNumber> {
    let hexAmount: string
    if (typeof amount === 'string' && isHex(amount)) {
      hexAmount = amount
    } else {
      const blockchainAmount: Amount = isAmount(amount) ? newAmount(amount).blockchain(this.units) : newAmount(amount, 'blockchain')

      hexAmount = EthereumUtils.toHex(blockchainAmount.value)
    }

    return this.nodeClient.estimateTransferGas(this.contractAddress, fromAddress, toAddress, hexAmount)
  }
}

// Factory

export function createERC20Token(metadata: ERC20TokenMetadata): ERC20Token {
  const protocolOptions: EthereumProtocolOptions = createERC20TokenOptions()
  const tokenOptions: ERC20TokenOptions = {
    ...protocolOptions,
    name: metadata.name,
    identifier: metadata.identifier,

    contractAddress: metadata.contractAddress,

    units: {
      [metadata.symbol]: {
        symbol: { value: metadata.symbol, market: metadata.marketSymbol },
        decimals: metadata.decimals
      }
    },
    mainUnit: metadata.symbol
  }

  return new ERC20TokenImpl(
    new AirGapNodeClient(protocolOptions.network.rpcUrl),
    new EtherscanInfoClient(protocolOptions.network.blockExplorerApi),
    tokenOptions
  )
}

export const ETHEREUM_ERC20_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  ...ETHEREUM_MAINNET_PROTOCOL_NETWORK,
  chainId: 3
}

const DEFAULT_ERC20_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_ERC20_MAINNET_PROTOCOL_NETWORK

export function createERC20TokenOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ERC20_PROTOCOL_NETWORK, ...network }
  }
}
