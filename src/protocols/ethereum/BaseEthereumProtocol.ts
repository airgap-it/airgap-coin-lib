import { BigNumber } from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as bitcoinJS from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import * as ethUtil from '../../dependencies/src/ethereumjs-util-5.2.0/index'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { Network } from '../../networks'
import { UnsignedTransaction } from '../../serializer/schemas/definitions/transaction-sign-request'
import { SignedEthereumTransaction } from '../../serializer/schemas/definitions/transaction-sign-response-ethereum'
import { RawEthereumTransaction } from '../../serializer/types'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '../ICoinProtocol'
import { mnemonicToSeed } from '../../dependencies/src/bip39-2.5.0/index'

import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'
import { EthereumUtils } from './utils/utils'

const EthereumTransaction = require('../../dependencies/src/ethereumjs-tx-1.3.7/index')

export interface EthereumProtocolConfiguration<NodeClient extends EthereumNodeClient, InfoClient extends EthereumInfoClient> {
  chainID: number
  nodeClient: NodeClient
  infoClient: InfoClient
}

export abstract class BaseEthereumProtocol<NodeClient extends EthereumNodeClient, InfoClient extends EthereumInfoClient>
  implements ICoinProtocol {
  public symbol: string = 'ETH'
  public name: string = 'Ethereum'
  public marketSymbol: string = 'eth'

  public feeSymbol: string = 'eth'

  public feeDefaults: FeeDefaults = {
    low: '0.00021', // 21000 Gas * 10 Gwei
    medium: '0.000315', // 21000 Gas * 15 Gwei
    high: '0.00084' // 21000 Gas * 40 Gwei
  }

  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: string = 'eth'

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'ETH',
      factor: '1'
    },
    {
      unitSymbol: 'GWEI',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'WEI',
      factor: '0.000000000000000001'
    }
  ]

  public supportsHD: boolean = false
  public standardDerivationPath: string = `m/44'/60'/0'/0/0`

  public addressIsCaseSensitive: boolean = false
  public addressValidationPattern: string = '^0x[a-fA-F0-9]{40}$'
  public addressPlaceholder: string = '0xabc...'

  public blockExplorer: string = 'https://etherscan.io'

  public network: Network
  public configuration: EthereumProtocolConfiguration<NodeClient, InfoClient>

  get subProtocols() {
    return getSubProtocolsByIdentifier(this.identifier) as any[] // TODO: Fix typings once apps are compatible with 3.7
  }

  constructor(configuration: EthereumProtocolConfiguration<NodeClient, InfoClient>) {
    this.configuration = configuration
    this.network = bitcoinJS.networks.bitcoin
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return `${this.blockExplorer}/address/{{address}}`.replace('{{address}}', address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return `${this.blockExplorer}/tx/{{txId}}`.replace('{{txId}}', txId)
  }

  public async getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)
    return this.getPublicKeyFromHexSecret(secret, derivationPath)
  }

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer> {
    const secret = mnemonicToSeed(mnemonic, password)
    return this.getPrivateKeyFromHexSecret(secret, derivationPath)
  }

  public async getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    throw new Error('extended private key support for ether not implemented')
  }

  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return ethereumNode
      .derivePath(derivationPath)
      .neutered()
      .getPublicKeyBuffer()
      .toString('hex')
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return ethereumNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }

  public async getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    throw new Error('extended private key support for ether not implemented')
  }

  public async getAddressFromPublicKey(publicKey: string | Buffer): Promise<string> {
    if (typeof publicKey === 'string') {
      // TODO: Types
      return ethUtil.toChecksumAddress((ethUtil.pubToAddress(Buffer.from(publicKey, 'hex') as any, true) as any).toString('hex'))
    }

    // TODO: Types
    return ethUtil.toChecksumAddress((ethUtil.pubToAddress(publicKey as any, true) as any).toString('hex'))
  }

  public async getAddressesFromPublicKey(publicKey: string | Buffer): Promise<string[]> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return [address]
  }

  public async getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<string> {
    return this.getAddressFromPublicKey(
      bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network)
        .derive(visibilityDerivationIndex)
        .derive(addressDerivationIndex)
        .getPublicKeyBuffer()
        .toString('hex')
    )
  }

  public getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<string[]> {
    const node = bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network)
    const generatorArray = [addressCount].map((x, i) => i + offset)

    return Promise.all(
      generatorArray.map(x =>
        this.getAddressFromPublicKey(
          node
            .derive(visibilityDerivationIndex)
            .derive(x)
            .getPublicKeyBuffer()
            .toString('hex')
        )
      )
    )
  }

  public signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: RawEthereumTransaction): Promise<IAirGapSignedTransaction> {
    return Promise.reject('extended private key signing for ether not implemented')
  }

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawEthereumTransaction): Promise<IAirGapSignedTransaction> {
    if (!transaction.value.startsWith('0x')) {
      transaction.value = EthereumUtils.toHex(parseInt(transaction.value, 10))
    }
    const tx = new EthereumTransaction(transaction)
    tx.sign(privateKey)

    return tx.serialize().toString('hex')
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    const transaction = unsignedTx.transaction as RawEthereumTransaction

    return [
      {
        from: [await this.getAddressFromPublicKey(unsignedTx.publicKey)],
        to: [transaction.to],
        amount: new BigNumber(transaction.value).toString(10),
        fee: new BigNumber(transaction.gasLimit).multipliedBy(new BigNumber(transaction.gasPrice)).toString(10),
        protocolIdentifier: this.identifier,
        isInbound: false,
        data: transaction.data,
        transactionDetails: unsignedTx
      }
    ]
  }

  public async getTransactionDetailsFromSigned(transaction: SignedEthereumTransaction): Promise<IAirGapTransaction[]> {
    const ethTx = new EthereumTransaction(transaction.transaction)

    const hexValue = ethTx.value.toString('hex') || '0x0'
    const hexGasPrice = ethTx.gasPrice.toString('hex') || '0x0'
    const hexGasLimit = ethTx.gasLimit.toString('hex') || '0x0'
    const hexNonce = ethTx.nonce.toString('hex') || '0x0'

    return [
      {
        from: [ethUtil.toChecksumAddress(`0x${ethTx.from.toString('hex')}`)],
        to: [ethUtil.toChecksumAddress(`0x${ethTx.to.toString('hex')}`)],
        amount: new BigNumber(parseInt(hexValue, 16)).toString(10),
        fee: new BigNumber(parseInt(hexGasLimit, 16)).multipliedBy(new BigNumber(parseInt(hexGasPrice, 16))).toString(10),
        protocolIdentifier: this.identifier,
        isInbound: ethTx.toCreationAddress(),
        hash: `0x${ethTx.hash().toString('hex')}`,
        data: `0x${ethTx.data.toString('hex')}`,
        extra: {
          nonce: parseInt(hexNonce, 16)
        },
        transactionDetails: transaction.transaction
      }
    ]
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const balances: BigNumber[] = await Promise.all(
      addresses.map((address: string) => {
        return this.configuration.nodeClient.fetchBalance(address)
      })
    )

    return balances.reduce((a: BigNumber, b: BigNumber) => a.plus(b)).toString(10)
  }

  public getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number = 0): Promise<string> {
    return Promise.reject('extended public balance for ether not implemented')
  }

  public async getAvailableBalanceOfAddresses(addresses: string[]): Promise<string> {
    return this.getBalanceOfAddresses(addresses)
  }

  public estimateMaxTransactionValueFromExtendedPublicKey(extendedPublicKey: string, recipients: string[], fee?: string): Promise<string> {
    return Promise.reject('estimating max value using extended public key not implemented')
  }

  public async estimateFeeDefaultsFromExtendedPublicKey(publicKey: string, recipients: string[], values: string[], data?: any): Promise<FeeDefaults> {
    return Promise.reject('estimating default fees using extended public key not implemented')
  }

  public prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string
  ): Promise<RawEthereumTransaction> {
    return Promise.reject('extended public tx for ether not implemented')
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceWrapper = new BigNumber(balance)
    
    let maxFee: BigNumber
    if (fee !== undefined) {
      maxFee = new BigNumber(fee)
    } else {
      const estimatedFeeDefaults = await this.estimateFeeDefaultsFromPublicKey(publicKey, recipients, [balance])
      maxFee = new BigNumber(estimatedFeeDefaults.medium).shiftedBy(this.decimals)
      if (maxFee.gte(balanceWrapper)) {
        maxFee = new BigNumber(0)
      }
    }

    let amountWithoutFees = balanceWrapper.minus(maxFee)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }
    return amountWithoutFees.toFixed()
  }

  public async estimateFeeDefaultsFromPublicKey(publicKey: string, recipients: string[], values: string[], data?: any): Promise<FeeDefaults> {
    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }
    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }
    const address: string = await this.getAddressFromPublicKey(publicKey)
    const estimatedGas = await this.configuration.nodeClient.estimateTransactionGas(
      address, 
      recipients[0], 
      EthereumUtils.toHex(values[0]), 
      undefined, 
      EthereumUtils.toHex("21000")
    )
    const gasPrise = await this.configuration.nodeClient.getGasPrice()
    const feeStepFactor = new BigNumber(0.5)
    const estimatedFee = estimatedGas.times(gasPrise)
    const lowFee = estimatedFee.minus(estimatedFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))
    const mediumFee = estimatedFee
    const highFee = mediumFee.plus(mediumFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))
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
    fee: string,
    data?: any
  ): Promise<RawEthereumTransaction> {
    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    const address: string = await this.getAddressFromPublicKey(publicKey)

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }

    const amount = EthereumUtils.toHex(wrappedValues[0].toFixed())

    const balance = await this.getBalanceOfPublicKey(publicKey)
    const gasLimit = await this.configuration.nodeClient.estimateTransactionGas(address, recipients[0], amount, undefined, EthereumUtils.toHex("21000"))
    const gasPrice = wrappedFee.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)
    if (new BigNumber(balance).gte(new BigNumber(wrappedValues[0].plus(wrappedFee)))) {
      const txCount = await this.configuration.nodeClient.fetchTransactionCount(address)
      const transaction: RawEthereumTransaction = {
        nonce: EthereumUtils.toHex(txCount),
        gasLimit: EthereumUtils.toHex(gasLimit.toFixed()),
        gasPrice: EthereumUtils.toHex(gasPrice.toFixed()), // 10 Gwei
        to: recipients[0],
        value: amount,
        chainId: this.configuration.chainID,
        data: '0x'
      }

      return transaction
    } else {
      throw new Error('not enough balance')
    }
  }

  public async broadcastTransaction(rawTransaction: string): Promise<string> {
    return this.configuration.nodeClient.sendSignedTransaction(`0x${rawTransaction}`)
  }

  public getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return Promise.reject('extended public transaction list for ether not implemented')
  }

  public async getTransactionsFromPublicKey(publicKey: string, limit: number = 50, offset: number = 0): Promise<IAirGapTransaction[]> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsFromAddresses([address], limit, offset)
  }

  protected getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 1
    }

    return 1 + Math.floor(offset / limit) // We need +1 here because pages start at 1
  }

  public getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const page: number = this.getPageNumber(limit, offset)

    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<IAirGapTransaction[]>[] = []
      for (const address of addresses) {
        promises.push(this.configuration.infoClient.fetchTransactions(this.identifier, address, page, limit))
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

  public async signMessage(message: string, privateKey: Buffer): Promise<string> {
    return Promise.reject('Message signing not implemented')
  }

  public async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
    return Promise.reject('Message verification not implemented')
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    const statusPromises: Promise<AirGapTransactionStatus>[] = transactionHashes.map((txHash: string) => {
      return this.configuration.nodeClient.getTransactionStatus(txHash)
    })

    return Promise.all(statusPromises)
  }
}
