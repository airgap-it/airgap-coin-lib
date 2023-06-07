import { UnsignedTransaction } from '@airgap/coinlib-core'
import { BigNumber } from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'
// @ts-ignore
import * as bitcoinJS from '@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src'
import { BalanceError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { IAirGapSignedTransaction } from '@airgap/coinlib-core/interfaces/IAirGapSignedTransaction'
import {
  AirGapTransactionStatus,
  AirGapTransactionWarningType,
  IAirGapTransaction
} from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { Network } from '@airgap/coinlib-core/networks'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { ICoinSubProtocol, SubProtocolType } from '@airgap/coinlib-core/protocols/ICoinSubProtocol'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import Common from '@ethereumjs/common'
// TODO: ETH TX and ethereumjs-util-5.2.0 removed
import { FeeMarketEIP1559Transaction, Transaction, TransactionFactory } from '@ethereumjs/tx'
import { SignedEthereumTransaction } from '../types/signed-transaction-ethereum'

import { RawEthereumTransaction, RawTypedEthereumTransaction } from '../types/transaction-ethereum'

import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'
import { EthereumAddress } from './EthereumAddress'
import { EthereumChainIDs } from './EthereumChainIDs'
import { EthereumCryptoClient } from './EthereumCryptoClient'
import { EthereumProtocolOptions } from './EthereumProtocolOptions'
import { EthereumAddressCursor, EthereumAddressResult, EthereumTransactionCursor, EthereumTransactionResult } from './EthereumTypes'
import { EthereumUtils } from './utils/utils'

export abstract class BaseEthereumProtocol<NodeClient extends EthereumNodeClient, InfoClient extends EthereumInfoClient>
  implements ICoinProtocol
{
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
  public identifier: ProtocolSymbols = MainProtocolSymbols.ETH
  public readonly MAX_GAS_ESTIMATE: string = '300000'

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
  public network: Network

  public readonly cryptoClient: EthereumCryptoClient

  constructor(public readonly options: EthereumProtocolOptions = new EthereumProtocolOptions()) {
    this.cryptoClient = new EthereumCryptoClient(this)
    this.network = bitcoinJS.networks.bitcoin
  }

  public async getSymbol(): Promise<string> {
    return this.symbol
  }

  public async getName(): Promise<string> {
    return this.name
  }

  public async getMarketSymbol(): Promise<string> {
    return this.marketSymbol
  }

  public async getAssetSymbol(): Promise<string | undefined> {
    return undefined
  }

  public async getFeeSymbol(): Promise<string> {
    return this.feeSymbol
  }

  public async getFeeDefaults(): Promise<FeeDefaults> {
    return this.feeDefaults
  }

  public async getDecimals(): Promise<number> {
    return this.decimals
  }

  public async getFeeDecimals(): Promise<number> {
    return this.feeDecimals
  }

  public async getIdentifier(): Promise<ProtocolSymbols> {
    return this.identifier
  }

  public async getUnits(): Promise<CurrencyUnit[]> {
    return this.units
  }

  public async getSupportsHD(): Promise<boolean> {
    return this.supportsHD
  }

  public async getStandardDerivationPath(): Promise<string> {
    return this.standardDerivationPath
  }

  public async getAddressIsCaseSensitive(): Promise<boolean> {
    return this.addressIsCaseSensitive
  }

  public async getAddressValidationPattern(): Promise<string> {
    return this.addressValidationPattern
  }

  public async getAddressPlaceholder(): Promise<string> {
    return this.addressPlaceholder
  }

  public async getOptions(): Promise<EthereumProtocolOptions> {
    return this.options
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return this.options.network.blockExplorer.getAddressLink(address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return this.options.network.blockExplorer.getTransactionLink(txId)
  }

  public async getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getPublicKeyFromHexSecret(secret, derivationPath)
  }

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getPrivateKeyFromHexSecret(secret, derivationPath)
  }

  public async getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getExtendedPrivateKeyFromHexSecret(secret, derivationPath)
  }

  public async getExtendedPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getExtendedPublicKeyFromHexSecret(secret, derivationPath)
  }

  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return ethereumNode.derivePath(derivationPath).neutered().getPublicKeyBuffer().toString('hex')
  }

  public async getExtendedPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return ethereumNode.derivePath(derivationPath).neutered().toBase58()
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return ethereumNode.derivePath(derivationPath).keyPair.d.toBuffer(32).toString('hex')
  }

  public async getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return ethereumNode.derivePath(derivationPath).toBase58()
  }

  public async getAddressFromPublicKey(publicKey: string | Buffer, cursor?: EthereumAddressCursor): Promise<EthereumAddressResult> {
    const address: EthereumAddress = EthereumAddress.from(publicKey)

    return {
      address: address.asString(),
      cursor: { hasNext: false }
    }
  }

  public async getAddressesFromPublicKey(publicKey: string | Buffer, cursor?: EthereumAddressCursor): Promise<EthereumAddressResult[]> {
    const address = await this.getAddressFromPublicKey(publicKey, cursor)

    return [address]
  }

  private async getPublicKeyFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<string> {
    return bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network)
      .derive(visibilityDerivationIndex)
      .derive(addressDerivationIndex)
      .getPublicKeyBuffer()
      .toString('hex')
  }

  public async getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<EthereumAddressResult> {
    return this.getAddressFromPublicKey(
      await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, visibilityDerivationIndex, addressDerivationIndex)
    )
  }

  public getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<EthereumAddressResult[]> {
    const node = bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network)
    const generatorArray = [addressCount].map((x, i) => i + offset)

    return Promise.all(
      generatorArray.map((x) =>
        this.getAddressFromPublicKey(node.derive(visibilityDerivationIndex).derive(x).getPublicKeyBuffer().toString('hex'))
      )
    )
  }

  private async getPrivateKeyFromExtendedPrivateKey(extendedPrivateKey: string, childDerivationPath?: string): Promise<Buffer> {
    const dp = childDerivationPath ?? '0/0' // This is the default

    if (dp.startsWith('m')) {
      throw new Error('Received full derivation path, expected child derivation path')
    }

    if (dp.toLowerCase().includes('h') || dp.includes(`'`)) {
      throw new Error('Child derivation path cannot include hardened children')
    }

    return dp
      .split('/')
      .reduce((pv: any, cv: string) => pv.derive(Number(cv)), bitcoinJS.HDNode.fromBase58(extendedPrivateKey, this.network))
      .keyPair.d.toBuffer(32)
  }

  public async signWithExtendedPrivateKey(
    extendedPrivateKey: string,
    untypedTransaction: RawTypedEthereumTransaction | RawEthereumTransaction,
    childDerivationPath?: string
  ): Promise<IAirGapSignedTransaction> {
    const privateKey = await this.getPrivateKeyFromExtendedPrivateKey(extendedPrivateKey, childDerivationPath)

    if (
      (untypedTransaction as RawTypedEthereumTransaction).serialized &&
      (untypedTransaction as RawTypedEthereumTransaction).derivationPath
    ) {
      const transaction: RawTypedEthereumTransaction = untypedTransaction as RawTypedEthereumTransaction
      let tx = TransactionFactory.fromSerializedData(Buffer.from(transaction.serialized, 'hex'))

      tx = tx.sign(privateKey)

      return tx.serialize().toString('hex')
    } else {
      return this.signWithPrivateKey(privateKey.toString('hex'), untypedTransaction as RawEthereumTransaction)
    }
  }

  public async signWithPrivateKey(privateKey: string, transaction: RawEthereumTransaction): Promise<IAirGapSignedTransaction> {
    if (!transaction.value.startsWith('0x')) {
      transaction.value = EthereumUtils.toHex(parseInt(transaction.value, 10))
    }
    let common: Common | undefined

    try {
      common = new Common({ chain: transaction.chainId })
    } catch {
      common = Common.custom({ chainId: transaction.chainId })
    }

    let tx = TransactionFactory.fromTxData(transaction, { common })
    tx = tx.sign(Buffer.from(privateKey, 'hex'))

    return tx.serialize().toString('hex')
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    if (unsignedTx.transaction.serialized) {
      const typedTransaction = unsignedTx.transaction as RawTypedEthereumTransaction

      const transaction: FeeMarketEIP1559Transaction = TransactionFactory.fromSerializedData(
        Buffer.from(typedTransaction.serialized, 'hex')
      ) as FeeMarketEIP1559Transaction
      const dps = typedTransaction.derivationPath.split('/')
      const ownAddress: EthereumAddressResult = unsignedTx.publicKey.startsWith('x') // xPub
        ? await this.getAddressFromExtendedPublicKey(unsignedTx.publicKey, Number(dps[dps.length - 2]), Number(dps[dps.length - 1]))
        : await this.getAddressFromPublicKey(unsignedTx.publicKey)
      const airGapTransaction: IAirGapTransaction = {
        from: [ownAddress.address],
        to: [transaction.to?.toString() ?? ''],
        amount: new BigNumber(transaction.value.toString(10)).toString(10),
        fee: new BigNumber(transaction.gasLimit.toString(10))
          .multipliedBy(new BigNumber(transaction.maxFeePerGas.toString(10)))
          .toString(10),
        protocolIdentifier: this.identifier,
        network: this.options.network,
        isInbound: false,
        data: transaction.data.toString('hex'),
        transactionDetails: unsignedTx
      }

      return [
        {
          ...airGapTransaction,
          ...(transaction.chainId.toNumber() !== 1
            ? {
                warnings: [
                  {
                    type: AirGapTransactionWarningType.WARNING,
                    title: 'Chain ID',
                    description: `Please note that this is not an Ethereum Mainnet transaction, it is from ${
                      EthereumChainIDs.get(transaction.chainId.toNumber()) ?? `Chain ID ${transaction.chainId.toNumber()}`
                    }`
                  }
                ]
              }
            : {})
        }
      ]
    } else {
      const transaction = unsignedTx.transaction as RawEthereumTransaction
      const ownAddress: EthereumAddressResult = unsignedTx.publicKey.startsWith('x') // xPub
        ? await this.getAddressFromExtendedPublicKey(unsignedTx.publicKey, 0, 0)
        : await this.getAddressFromPublicKey(unsignedTx.publicKey)

      return [
        {
          from: [ownAddress.address],
          to: [transaction.to],
          amount: new BigNumber(transaction.value).toString(10),
          fee: new BigNumber(transaction.gasLimit).multipliedBy(new BigNumber(transaction.gasPrice)).toString(10),
          protocolIdentifier: this.identifier,
          network: this.options.network,
          isInbound: false,
          data: transaction.data,
          transactionDetails: unsignedTx
        }
      ]
    }
  }

  public async getTransactionDetailsFromSigned(transaction: SignedEthereumTransaction): Promise<IAirGapTransaction[]> {
    const ethTx = TransactionFactory.fromSerializedData(Buffer.from(transaction.transaction, 'hex'))

    if (ethTx.type === 0) {
      const tx = ethTx as Transaction

      const hexValue = tx.value.toString('hex') || '0x0'
      const hexGasPrice = tx.gasPrice.toString('hex') || '0x0'
      const hexGasLimit = tx.gasLimit.toString('hex') || '0x0'
      const hexNonce = tx.nonce.toString('hex') || '0x0'
      const chainId = tx.common.chainIdBN().toString(10)
      const to = tx.to

      if (!to) {
        throw new Error('No "TO" address')
      }

      return [
        {
          from: [tx.getSenderAddress().toString()],
          to: [to.toString()],
          amount: new BigNumber(parseInt(hexValue, 16)).toString(10),
          fee: new BigNumber(parseInt(hexGasLimit, 16)).multipliedBy(new BigNumber(parseInt(hexGasPrice, 16))).toString(10),
          protocolIdentifier: this.identifier,
          network: this.options.network,
          isInbound: tx.toCreationAddress(),
          hash: `0x${tx.hash().toString('hex')}`,
          data: `0x${tx.data.toString('hex')}`,
          extra: {
            chainId,
            nonce: parseInt(hexNonce, 16)
          },
          transactionDetails: { raw: transaction.transaction }
        }
      ]
    }

    try {
      const feeTx = ethTx as FeeMarketEIP1559Transaction

      return [
        {
          from: [feeTx.getSenderAddress().toString()],
          to: [feeTx.to?.toString() ?? ''],
          amount: new BigNumber(feeTx.value.toString(10)).toString(10),
          fee: new BigNumber(feeTx.gasLimit.toString(10)).multipliedBy(new BigNumber(feeTx.maxFeePerGas.toString(10))).toString(10),
          protocolIdentifier: this.identifier,
          network: this.options.network,
          isInbound: false,
          data: feeTx.data.toString('hex'),
          extra: {
            chainId: feeTx.chainId.toString(10),
            nonce: feeTx.nonce.toString(10)
          },
          transactionDetails: { raw: transaction.transaction }
        }
      ]
    } catch (e) {
      throw new Error(`Transaction type "${ethTx.type}" not supported`)
    }
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address: EthereumAddressResult = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const balances: BigNumber[] = await Promise.all(
      addresses.map((address: string) => {
        return this.options.nodeClient.fetchBalance(address)
      })
    )

    return balances.reduce((a: BigNumber, b: BigNumber) => a.plus(b)).toString(10)
  }

  public async getBalanceOfPublicKeyForSubProtocols(publicKey: string, subProtocols: ICoinSubProtocol[]): Promise<string[]> {
    const address: string = await this.getAddressFromPublicKey(publicKey)
      .then((address: EthereumAddressResult) => address.address)
      .catch(
        async () => await this.getAddressFromExtendedPublicKey(publicKey, 0, 0).then((address: EthereumAddressResult) => address.address)
      )
    const contractAddresses = await Promise.all(
      subProtocols.map(async (subProtocol) => {
        const subProtocolType = await subProtocol.getSubProtocolType()
        const subProtocolContractAddress = await subProtocol.getContractAddress()

        if (subProtocolType === SubProtocolType.TOKEN && subProtocolContractAddress) {
          return subProtocolContractAddress
        } else {
          throw new UnsupportedError(Domain.ETHEREUM, 'can only retrieve balance of ERC20 tokens')
        }
      })
    )
    const balances = await this.options.nodeClient.callBalanceOfOnContracts(contractAddresses, address)

    return contractAddresses.map((contractAddresse) => balances[contractAddresse]?.toFixed() ?? '0')
  }

  public async getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number = 0): Promise<string> {
    const publicKey = await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, 0, 0)

    return this.getBalanceOfPublicKey(publicKey)
  }

  public async getAvailableBalanceOfAddresses(addresses: string[]): Promise<string> {
    return this.getBalanceOfAddresses(addresses)
  }

  public async estimateMaxTransactionValueFromExtendedPublicKey(
    extendedPublicKey: string,
    recipients: string[],
    fee?: string
  ): Promise<string> {
    const publicKey = await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, 0, 0)

    return this.estimateMaxTransactionValueFromPublicKey(publicKey, recipients, fee)
  }

  public async estimateFeeDefaultsFromExtendedPublicKey(
    extendedPublicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    const publicKey = await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, 0, 0)

    return this.estimateFeeDefaultsFromPublicKey(publicKey, recipients, values, data)
  }

  public async prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    _offset: number,
    recipients: string[],
    values: string[],
    fee: string,
    data?: any
  ): Promise<RawEthereumTransaction> {
    const publicKey = await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, 0, 0)

    return this.prepareTransactionFromPublicKey(publicKey, recipients, values, fee, data)
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
    const address: string = await this.getAddressFromPublicKey(publicKey).then((address: EthereumAddressResult) => address.address)
    const estimatedGas = await this.options.nodeClient.estimateTransactionGas(
      address,
      recipients[0],
      EthereumUtils.toHex(values[0]),
      undefined,
      EthereumUtils.toHex(this.MAX_GAS_ESTIMATE)
    )
    const gasPrise = await this.options.nodeClient.getGasPrice()
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

    const address: string = await this.getAddressFromPublicKey(publicKey).then((address: EthereumAddressResult) => address.address)

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }

    const amount = EthereumUtils.toHex(wrappedValues[0].toFixed())

    const balance = await this.getBalanceOfPublicKey(publicKey)
    const gasLimit = await this.options.nodeClient.estimateTransactionGas(
      address,
      recipients[0],
      amount,
      undefined,
      EthereumUtils.toHex(this.MAX_GAS_ESTIMATE)
    )
    const gasPrice = wrappedFee.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)
    if (new BigNumber(balance).gte(new BigNumber(wrappedValues[0].plus(wrappedFee)))) {
      const txCount = await this.options.nodeClient.fetchTransactionCount(address)
      const transaction: RawEthereumTransaction = {
        nonce: EthereumUtils.toHex(txCount),
        gasLimit: EthereumUtils.toHex(gasLimit.toFixed()),
        gasPrice: EthereumUtils.toHex(gasPrice.toFixed()), // 10 Gwei
        to: recipients[0],
        value: amount,
        chainId: this.options.network.extras.chainID,
        data: '0x'
      }

      return transaction
    } else {
      throw new BalanceError(Domain.ETHEREUM, 'not enough balance')
    }
  }

  public async broadcastTransaction(rawTransaction: string): Promise<string> {
    return this.options.nodeClient.sendSignedTransaction(`0x${rawTransaction}`)
  }

  public async getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    cursor: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult> {
    const publicKey = await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, 0, 0)

    return this.getTransactionsFromPublicKey(publicKey, limit, cursor)
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number = 50,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult> {
    const address: EthereumAddressResult = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsFromAddresses([address.address], limit, cursor)
  }

  public getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult> {
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<EthereumTransactionResult>[] = []
      for (const address of addresses) {
        promises.push(this.options.infoClient.fetchTransactions(this, address, limit, cursor))
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

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    return this.cryptoClient.signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return this.cryptoClient.verifyMessage(message, signature, publicKey)
  }

  public async encryptAsymmetric(message: string, publicKey: string): Promise<string> {
    return this.cryptoClient.encryptAsymmetric(message, publicKey)
  }

  public async decryptAsymmetric(message: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
    return this.cryptoClient.decryptAsymmetric(message, keypair)
  }

  public async encryptAES(message: string, privateKey: string): Promise<string> {
    return this.cryptoClient.encryptAES(message, privateKey)
  }

  public async decryptAES(message: string, privateKey: string): Promise<string> {
    return this.cryptoClient.decryptAES(message, privateKey)
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    const statusPromises: Promise<AirGapTransactionStatus>[] = transactionHashes.map((txHash: string) => {
      return this.options.nodeClient.getTransactionStatus(txHash)
    })

    return Promise.all(statusPromises)
  }
}
