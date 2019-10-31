import * as ethUtil from 'ethereumjs-util'

import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapSignedTransaction } from '../../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { SignedEthereumTransaction } from '../../../serializer/signed-transactions/ethereum-transactions.serializer'
import { UnsignedTransaction } from '../../../serializer/unsigned-transaction.serializer'
import {
  RawEthereumTransaction,
  UnsignedEthereumTransaction
} from '../../../serializer/unsigned-transactions/ethereum-transactions.serializer'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { BaseEthereumProtocol } from '../BaseEthereumProtocol'
import { TrustWalletInfoClient } from '../clients/info-clients/InfoClient'
import { AirGapNodeClient, EthereumRPCDataTransfer } from '../clients/node-clients/AirGapNodeClient'
import { EthereumUtils } from '../utils/utils'

const EthereumTransaction = require('ethereumjs-tx')

export interface GenericERC20Configuration {
  symbol: string
  name: string
  marketSymbol: string
  identifier: string
  contractAddress: string
  decimals?: number
  jsonRPCAPI?: string
  infoAPI?: string
  chainId?: number
}

export class GenericERC20 extends BaseEthereumProtocol<AirGapNodeClient, TrustWalletInfoClient> implements ICoinSubProtocol {
  public isSubProtocol = true
  public subProtocolType = SubProtocolType.TOKEN
  private contractAddress: string

  constructor(config: GenericERC20Configuration) {
    // we probably need another network here, explorer is ok
    super({
      chainID: config.chainId || 1,
      nodeClient: new AirGapNodeClient(config.jsonRPCAPI),
      infoClient: new TrustWalletInfoClient(config.infoAPI)
    })
    this.contractAddress = config.contractAddress
    this.symbol = config.symbol
    this.name = config.name
    this.marketSymbol = config.marketSymbol
    this.identifier = config.identifier
    this.decimals = config.decimals || this.decimals
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    const balances = await Promise.all(
      addresses.map(address => {
        return this.configuration.nodeClient.callBalanceOf(this.contractAddress, address)
      })
    )

    return balances.reduce((a, b) => a.plus(b))
  }

  public signWithPrivateKey(privateKey: Buffer, transaction: RawEthereumTransaction): Promise<IAirGapSignedTransaction> {
    if (!transaction.data || transaction.data === '0x') {
      transaction.data = new EthereumRPCDataTransfer(transaction.to, transaction.value).abiEncoded() // backwards-compatible fix
    }

    return super.signWithPrivateKey(privateKey, transaction)
  }

  private async estimateGas(source: string, recipient: string, hexValue: string): Promise<string> {
    const gasEstimate = await this.configuration.nodeClient.estimateTransferGas(this.contractAddress, source, recipient, hexValue)

    return gasEstimate.toFixed()
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<RawEthereumTransaction> {
    if (recipients.length !== values.length) {
      throw new Error('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      throw new Error('you cannot have 0 recipients')
    }

    const balance = await this.getBalanceOfPublicKey(publicKey)

    if (balance.isGreaterThanOrEqualTo(values[0])) {
      const ethBalance = await super.getBalanceOfPublicKey(publicKey)
      const address = await this.getAddressFromPublicKey(publicKey)

      const estimatedAmount: string = await this.estimateGas(address, recipients[0], EthereumUtils.toHex(values[0].toFixed()).toString())

      // re-cast to our own big-number
      const gasAmount = new BigNumber(estimatedAmount)

      if (ethBalance.isGreaterThanOrEqualTo(fee)) {
        const txCount = await this.configuration.nodeClient.fetchTransactionCount(address)
        const gasPrice = fee.isEqualTo(0) ? new BigNumber(0) : fee.div(gasAmount).integerValue(BigNumber.ROUND_CEIL)
        const transaction: RawEthereumTransaction = {
          nonce: EthereumUtils.toHex(txCount),
          gasLimit: EthereumUtils.toHex(gasAmount.toFixed()),
          gasPrice: EthereumUtils.toHex(gasPrice.toFixed()),
          to: this.contractAddress,
          value: EthereumUtils.toHex(new BigNumber(0).toFixed()),
          chainId: this.configuration.chainID,
          data: new EthereumRPCDataTransfer(recipients[0], EthereumUtils.toHex(values[0].toFixed())).abiEncoded()
        }

        return transaction
      } else {
        throw new Error('not enough ETH balance')
      }
    } else {
      throw new Error('not enough token balance')
    }
  }

  public getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const page = Math.ceil(offset / limit)

    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<IAirGapTransaction[]>[] = []
      for (const address of addresses) {
        promises.push(this.configuration.infoClient.fetchContractTransactions(this.identifier, this.contractAddress, address, page, limit))
      }
      Promise.all(promises)
        .then(values => {
          overallResolve(
            values.reduce((a, b) => {
              return a.concat(b)
            })
          )
        })
        .catch(overallReject)
    })
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedEthereumTransaction): Promise<IAirGapTransaction[]> {
    const ethTxs = await super.getTransactionDetailsFromSigned(signedTx)

    if (ethTxs.length !== 1) {
      throw new Error('More than one ETH transaction detected.')
    }

    const ethTx = ethTxs[0]

    const extractedTx = new EthereumTransaction(signedTx.transaction)
    const tokenTransferDetails = new EthereumRPCDataTransfer(`0x${extractedTx.data.toString('hex')}`)
    ethTx.to = [ethUtil.toChecksumAddress(tokenTransferDetails.recipient)]
    ethTx.amount = new BigNumber(tokenTransferDetails.amount)

    return [ethTx]
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    const unsignedEthereumTx = unsignedTx as UnsignedEthereumTransaction
    const ethTxs = await super.getTransactionDetails(unsignedEthereumTx)

    if (ethTxs.length !== 1) {
      throw new Error('More than one ETH transaction detected.')
    }

    const ethTx = ethTxs[0]

    const tokenTransferDetails = new EthereumRPCDataTransfer(unsignedEthereumTx.transaction.data)

    ethTx.to = [ethUtil.toChecksumAddress(tokenTransferDetails.recipient)]
    ethTx.amount = new BigNumber(tokenTransferDetails.amount)

    return [ethTx]
  }
}
