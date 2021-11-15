import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { IAirGapSignedTransaction } from '../../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { SignedRskTransaction } from '../../../serializer/schemas/definitions/signed-transaction-rsk'
import { UnsignedTransaction } from '../../../serializer/schemas/definitions/unsigned-transaction'
import { UnsignedRskTransaction } from '../../../serializer/schemas/definitions/unsigned-transaction-rsk'
import { RawRskTransaction } from '../../../serializer/types'
import { FeeDefaults } from '../../ICoinProtocol'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { BaseRskProtocol } from '../BaseRskProtocol'
import { RskExplorerInfoClient } from '../clients/info-clients/RskExplorerInfoClient'
import { AirGapNodeClientRsk, RskRPCDataTransfer } from '../clients/node-clients/AirGapNodeClientRsk'
import { RskERC20ProtocolOptions } from '../RskProtocolOptions'
import { RskUtils } from '../utils/utils'
import { RskAddress } from '../RskAddress'
import { BalanceError, ConditionViolationError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'

import { RskTransactionResult, RskTransactionCursor } from '../RskTypes'

const RskTransaction = require('../../../dependencies/src/ethereumjs-tx-1.3.7/index')

export class GenericRskERC20 extends BaseRskProtocol<AirGapNodeClientRsk, RskExplorerInfoClient> implements ICoinSubProtocol {
  public isSubProtocol: boolean = true
  public subProtocolType: SubProtocolType = SubProtocolType.TOKEN
  public readonly contractAddress: string

  constructor(public readonly options: RskERC20ProtocolOptions) {
    super(options)

    this.contractAddress = options.config.contractAddress
    this.symbol = options.config.symbol
    this.name = options.config.name
    this.marketSymbol = options.config.marketSymbol
    this.identifier = options.config.identifier
    this.decimals = options.config.decimals
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address: RskAddress = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.getValue()])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const balances: BigNumber[] = await Promise.all(
      addresses.map((address: string) => {
        return this.options.nodeClient.callBalanceOf(this.contractAddress, address)
      })
    )

    return balances.reduce((a: BigNumber, b: BigNumber) => a.plus(b)).toString(10)
  }

  public signWithPrivateKey(privateKey: Buffer, transaction: RawRskTransaction): Promise<IAirGapSignedTransaction> {
    if (!transaction.data || transaction.data === '0x') {
      transaction.data = new RskRPCDataTransfer(transaction.to, transaction.value).abiEncoded() // backwards-compatible fix
    }

    return super.signWithPrivateKey(privateKey, transaction)
  }

  private async estimateGas(source: string, recipient: string, hexValue: string): Promise<BigNumber> {
    const result = await this.options.nodeClient.estimateTransferGas(this.contractAddress, source, recipient, hexValue)

    return result
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    return this.getBalanceOfPublicKey(publicKey)
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }
    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }
    const address: string = (await this.getAddressFromPublicKey(publicKey)).getValue()
    const estimatedGas = await this.estimateGas(address, recipients[0], RskUtils.toHex(values[0]))
    const gasPrise = await this.options.nodeClient.getGasPrice()
    const mediumFeeFactor = new BigNumber(1.5)
    const highFeeFactor = new BigNumber(2)
    const estimatedFee = estimatedGas.times(gasPrise)
    const lowFee = estimatedFee
    const mediumFee = estimatedFee.times(mediumFeeFactor) // lowFee * 1.5
    const highFee = estimatedFee.times(highFeeFactor) // lowFee * 2

    return {
      low: lowFee.shiftedBy(-this.feeDecimals).toFixed(),
      medium: mediumFee.shiftedBy(-this.feeDecimals).toFixed(),
      high: highFee.shiftedBy(-this.feeDecimals).toFixed()
    }
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string
  ): Promise<RawRskTransaction> {
    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    if (recipients.length !== wrappedValues.length) {
      throw new ConditionViolationError(Domain.ERC20, 'recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      throw new ConditionViolationError(Domain.ERC20, 'you cannot have 0 recipients')
    }

    const balance: BigNumber = new BigNumber(await this.getBalanceOfPublicKey(publicKey))

    if (balance.isGreaterThanOrEqualTo(wrappedValues[0])) {
      const address: string = await this.getAddressFromPublicKey(publicKey).then((address: RskAddress) => address.getValue())
      const rskBalance: BigNumber = new BigNumber(await super.getBalanceOfAddresses([address]))

      const estimatedGas = await this.estimateGas(address, recipients[0], RskUtils.toHex(wrappedValues[0].toFixed()))

      if (rskBalance.isGreaterThanOrEqualTo(wrappedFee)) {
        const txCount: number = await this.options.nodeClient.fetchTransactionCount(address)
        const gasPrice: BigNumber = wrappedFee.isEqualTo(0)
          ? new BigNumber(0)
          : wrappedFee.div(estimatedGas).integerValue(BigNumber.ROUND_CEIL)
        const transaction: RawRskTransaction = {
          nonce: RskUtils.toHex(txCount),
          gasLimit: RskUtils.toHex(estimatedGas.toFixed()),
          gasPrice: RskUtils.toHex(gasPrice.toFixed()),
          to: this.contractAddress,
          value: RskUtils.toHex(new BigNumber(0).toFixed()),
          chainId: this.options.network.extras.chainID,
          data: new RskRPCDataTransfer(recipients[0], RskUtils.toHex(wrappedValues[0].toFixed())).abiEncoded()
        }

        return transaction
      } else {
        throw new BalanceError(Domain.ERC20, 'not enough RSK balance')
      }
    } else {
      throw new BalanceError(Domain.ERC20, 'not enough token balance')
    }
  }

  public getTransactionsFromAddresses(addresses: string[], limit: number, cursor?: RskTransactionCursor): Promise<RskTransactionResult> {
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<RskTransactionResult>[] = []
      for (const address of addresses) {
        promises.push(this.options.infoClient.fetchContractTransactions(this, this.contractAddress, address, limit, cursor))
      }

      Promise.all(promises)
        .then((values) => {
          const page = Math.max(...values.map((txResult) => txResult.cursor.page))
          overallResolve(
            values.reduce((a, b) => {
              return { transactions: a.transactions.concat(b.transactions), cursor: { page } }
            })
          )
        })
        .catch(overallReject)
    })
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedRskTransaction): Promise<IAirGapTransaction[]> {
    const rskTxs: IAirGapTransaction[] = await super.getTransactionDetailsFromSigned(signedTx)

    if (rskTxs.length !== 1) {
      throw new ConditionViolationError(Domain.ERC20, 'More than one RSK transaction detected.')
    }

    const rskTx: IAirGapTransaction = rskTxs[0]

    const extractedTx = new RskTransaction(signedTx.transaction)
    const tokenTransferDetails = new RskRPCDataTransfer(`0x${extractedTx.data.toString('hex')}`)
    rskTx.to = [RskUtils.toChecksumAddress(tokenTransferDetails.recipient)]
    rskTx.amount = new BigNumber(tokenTransferDetails.amount).toString(10)

    return [rskTx]
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    const unsignedRskTx = unsignedTx as UnsignedRskTransaction
    const rskTxs: IAirGapTransaction[] = await super.getTransactionDetails(unsignedRskTx)

    if (rskTxs.length !== 1) {
      throw new ConditionViolationError(Domain.ERC20, 'More than one RSK transaction detected.')
    }

    const rskTx: IAirGapTransaction = rskTxs[0]

    const tokenTransferDetails = new RskRPCDataTransfer(unsignedRskTx.transaction.data)

    rskTx.to = [RskUtils.toChecksumAddress(tokenTransferDetails.recipient)]
    rskTx.amount = new BigNumber(tokenTransferDetails.amount).toString(10)

    return [rskTx]
  }
}
