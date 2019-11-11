import * as ethUtil from '../../../dependencies/src/ethereumjs-util-5.2.0/index'

import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapSignedTransaction } from '../../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'

import { RawEthereumTransaction } from '../../../serializer/types'
import { SignedEthereumTransaction } from '../../../serializer/schemas/definitions/signed-transaction-ethereum'
import { UnsignedTransaction } from '../../../serializer/schemas/definitions/unsigned-transaction'
import { UnsignedEthereumTransaction } from '../../../serializer/schemas/definitions/unsigned-transaction-ethereum'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { BaseEthereumProtocol } from '../BaseEthereumProtocol'
import { TrustWalletInfoClient } from '../clients/info-clients/InfoClient'
import { AirGapNodeClient, EthereumRPCDataTransfer } from '../clients/node-clients/AirGapNodeClient'
import { EthereumUtils } from '../utils/utils'

const EthereumTransaction = require('../../../dependencies/src/ethereumjs-tx-1.3.7/index')

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
  public isSubProtocol: boolean = true
  public subProtocolType: SubProtocolType = SubProtocolType.TOKEN
  private readonly contractAddress: string

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

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const balances: BigNumber[] = await Promise.all(
      addresses.map((address: string) => {
        return this.configuration.nodeClient.callBalanceOf(this.contractAddress, address)
      })
    )

    return balances.reduce((a: BigNumber, b: BigNumber) => a.plus(b)).toString(10)
  }

  public signWithPrivateKey(privateKey: Buffer, transaction: RawEthereumTransaction): Promise<IAirGapSignedTransaction> {
    if (!transaction.data || transaction.data === '0x') {
      transaction.data = new EthereumRPCDataTransfer(transaction.to, transaction.value).abiEncoded() // backwards-compatible fix
    }

    return super.signWithPrivateKey(privateKey, transaction)
  }

  private async estimateGas(source: string, recipient: string, hexValue: string): Promise<string> {
    const gasEstimate: number = await this.configuration.nodeClient.estimateTransferGas(this.contractAddress, source, recipient, hexValue)

    return gasEstimate.toFixed()
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string
  ): Promise<RawEthereumTransaction> {
    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    if (recipients.length !== wrappedValues.length) {
      throw new Error('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      throw new Error('you cannot have 0 recipients')
    }

    const balance: BigNumber = new BigNumber(await this.getBalanceOfPublicKey(publicKey))

    if (balance.isGreaterThanOrEqualTo(wrappedValues[0])) {
      const ethBalance: BigNumber = new BigNumber(await super.getBalanceOfPublicKey(publicKey))
      const address: string = await this.getAddressFromPublicKey(publicKey)

      const estimatedAmount: string = await this.estimateGas(
        address,
        recipients[0],
        EthereumUtils.toHex(wrappedValues[0].toFixed()).toString()
      )

      // re-cast to our own big-number
      const gasAmount: BigNumber = new BigNumber(estimatedAmount)

      if (ethBalance.isGreaterThanOrEqualTo(wrappedFee)) {
        const txCount: number = await this.configuration.nodeClient.fetchTransactionCount(address)
        const gasPrice: BigNumber = wrappedFee.isEqualTo(0)
          ? new BigNumber(0)
          : wrappedFee.div(gasAmount).integerValue(BigNumber.ROUND_CEIL)
        const transaction: RawEthereumTransaction = {
          nonce: EthereumUtils.toHex(txCount),
          gasLimit: EthereumUtils.toHex(gasAmount.toFixed()),
          gasPrice: EthereumUtils.toHex(gasPrice.toFixed()),
          to: this.contractAddress,
          value: EthereumUtils.toHex(new BigNumber(0).toFixed()),
          chainId: this.configuration.chainID,
          data: new EthereumRPCDataTransfer(recipients[0], EthereumUtils.toHex(wrappedValues[0].toFixed())).abiEncoded()
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
    const page: number = Math.ceil(offset / limit)

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
    const ethTxs: IAirGapTransaction[] = await super.getTransactionDetailsFromSigned(signedTx)

    if (ethTxs.length !== 1) {
      throw new Error('More than one ETH transaction detected.')
    }

    const ethTx: IAirGapTransaction = ethTxs[0]

    const extractedTx = new EthereumTransaction(signedTx.transaction)
    const tokenTransferDetails = new EthereumRPCDataTransfer(`0x${extractedTx.data.toString('hex')}`)
    ethTx.to = [ethUtil.toChecksumAddress(tokenTransferDetails.recipient)]
    ethTx.amount = new BigNumber(tokenTransferDetails.amount).toString(10)

    return [ethTx]
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    const unsignedEthereumTx = unsignedTx as UnsignedEthereumTransaction
    const ethTxs: IAirGapTransaction[] = await super.getTransactionDetails(unsignedEthereumTx)

    if (ethTxs.length !== 1) {
      throw new Error('More than one ETH transaction detected.')
    }

    const ethTx: IAirGapTransaction = ethTxs[0]

    const tokenTransferDetails = new EthereumRPCDataTransfer(unsignedEthereumTx.transaction.data)

    ethTx.to = [ethUtil.toChecksumAddress(tokenTransferDetails.recipient)]
    ethTx.amount = new BigNumber(tokenTransferDetails.amount).toString(10)

    return [ethTx]
  }
}
