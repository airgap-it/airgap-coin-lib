import { BigNumber } from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '../../dependencies/src/bip39-2.5.0/index'
import * as bitcoinJS from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'

import { BalanceError, UnsupportedError } from '../../errors'
import { Domain } from '../../errors/coinlib-error'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, AirGapTransactionWarningType, IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { Network } from '../../networks'
import { SignedRskTransaction } from '../../serializer/schemas/definitions/signed-transaction-rsk'
import { UnsignedTransaction } from '../../serializer/schemas/definitions/unsigned-transaction'
import { RawRskTransaction, RawTypedRskTransaction } from '../../serializer/types'
import { MainProtocolSymbols, ProtocolSymbols } from '../../utils/ProtocolSymbols'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '../ICoinProtocol'
import { ICoinSubProtocol, SubProtocolType } from '../ICoinSubProtocol'

import { RskInfoClient } from './clients/info-clients/InfoClient'
import { RskNodeClient } from './clients/node-clients/RskNodeClient'
import { RskAddress } from './RskAddress'
import { RskCryptoClient } from './RskCryptoClient'
import { RskProtocolOptions } from './RskProtocolOptions'
import { EthereumChainIDs } from '../ethereum/EthereumChainIDs'
import { RskTransactionCursor, RskTransactionResult } from './RskTypes'
import { RskUtils } from './utils/utils'

import { RskRPCDataTransfer } from './clients/node-clients/AirGapNodeClientRsk'
import Common from '@ethereumjs/common'
// TODO: ETH TX and ethereumjs-util-5.2.0 removed
import { FeeMarketEIP1559Transaction, Transaction, TransactionFactory } from '@ethereumjs/tx'

export abstract class BaseRskProtocol<NodeClient extends RskNodeClient, InfoClient extends RskInfoClient> implements ICoinProtocol {
  public symbol: string = 'RBTC'
  public name: string = 'RSK'
  public marketSymbol: string = 'rbtc'

  public feeSymbol: string = 'rbtc'

  // https://stats.rsk.co/
  public feeDefaults: FeeDefaults = {
    low: '0.00000124404', // 21000 Gas * 0.05924 Gwei
    medium: '0.00000186606', // 21000 Gas * 0.05924 * 1.5 Gwei
    high: '0.00000248808' // 21000 Gas * 0.05924 * 2 Gwei
  }

  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: ProtocolSymbols = MainProtocolSymbols.RBTC
  protected readonly MAX_GAS_ESTIMATE: string = '300000'

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'RBTC',
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
  public standardDerivationPath: string = `m/44'/137'/0'/0/0`

  public addressIsCaseSensitive: boolean = false
  public addressValidationPattern: string = '^0x[a-fA-F0-9]{40}$'
  public addressPlaceholder: string = '0xabc...'

  public network: Network

  public readonly cryptoClient: RskCryptoClient

  get subProtocols(): ICoinSubProtocol[] {
    return getSubProtocolsByIdentifier(this.identifier, this.options.network)
  }

  constructor(public readonly options: RskProtocolOptions = new RskProtocolOptions()) {
    this.cryptoClient = new RskCryptoClient(this)
    this.network = bitcoinJS.networks.bitcoin
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

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer> {
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
    const rskNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return rskNode.derivePath(derivationPath).neutered().getPublicKeyBuffer().toString('hex')
  }

  public async getExtendedPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return ethereumNode.derivePath(derivationPath).neutered().toBase58()
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer> {
    const rskNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return rskNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }

  public async getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const rskNodeNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)

    return rskNodeNode.derivePath(derivationPath).toBase58()
  }

  public async getAddressFromPublicKey(publicKey: string | Buffer): Promise<RskAddress> {
    return RskAddress.from(publicKey)
  }

  public async getAddressesFromPublicKey(publicKey: string | Buffer): Promise<RskAddress[]> {
    const address = await this.getAddressFromPublicKey(publicKey)

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
  ): Promise<RskAddress> {
    return this.getAddressFromPublicKey(
      await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, visibilityDerivationIndex, addressDerivationIndex)
    )
  }

  public getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<RskAddress[]> {
    const node = bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network)
    const generatorArray = [addressCount].map((x, i) => i + offset)

    return Promise.all(
      generatorArray.map((x) =>
        this.getAddressFromPublicKey(node.derive(visibilityDerivationIndex).derive(x).getPublicKeyBuffer().toString('hex'))
      )
    )
  }

  public async getNextAddressFromPublicKey(publicKey: string, current: RskAddress): Promise<RskAddress> {
    return current
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
    untypedTransaction: RawTypedRskTransaction | RawRskTransaction,
    childDerivationPath?: string
  ): Promise<IAirGapSignedTransaction> {
    const privateKey = await this.getPrivateKeyFromExtendedPrivateKey(extendedPrivateKey, childDerivationPath)

    if ((untypedTransaction as RawTypedRskTransaction).serialized && (untypedTransaction as RawTypedRskTransaction).derivationPath) {
      const transaction: RawTypedRskTransaction = untypedTransaction as RawTypedRskTransaction
      let tx = TransactionFactory.fromSerializedData(Buffer.from(transaction.serialized, 'hex'))

      tx = tx.sign(privateKey)

      return tx.serialize().toString('hex')
    } else {
      return this.signWithPrivateKey(privateKey, untypedTransaction as RawRskTransaction)
    }
  }

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawRskTransaction): Promise<IAirGapSignedTransaction> {
    if (!transaction.value.startsWith('0x')) {
      transaction.value = RskUtils.toHex(parseInt(transaction.value, 10))
    }
    let common: Common | undefined

    try {
      common = new Common({ chain: transaction.chainId })
    } catch {
      common = Common.custom({ chainId: transaction.chainId })
    }

    let tx = TransactionFactory.fromTxData(transaction, { common })
    tx = tx.sign(privateKey)

    return tx.serialize().toString('hex')
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    if (unsignedTx.transaction.serialized) {
      const typedTransaction = unsignedTx.transaction as RawTypedRskTransaction

      const transaction: FeeMarketEIP1559Transaction = TransactionFactory.fromSerializedData(
        Buffer.from(typedTransaction.serialized, 'hex')
      ) as FeeMarketEIP1559Transaction
      const dps = typedTransaction.derivationPath.split('/')
      const ownAddress: RskAddress = unsignedTx.publicKey.startsWith('x') // xPub
        ? await this.getAddressFromExtendedPublicKey(unsignedTx.publicKey, Number(dps[dps.length - 2]), Number(dps[dps.length - 1]))
        : await this.getAddressFromPublicKey(unsignedTx.publicKey)
      const airGapTransaction = {
        from: [ownAddress.getValue()],
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
      const transaction = unsignedTx.transaction as RawRskTransaction
      const ownAddress: RskAddress = unsignedTx.publicKey.startsWith('x') // xPub
        ? await this.getAddressFromExtendedPublicKey(unsignedTx.publicKey, 0, 0)
        : await this.getAddressFromPublicKey(unsignedTx.publicKey)

      return [
        {
          from: [ownAddress.getValue()],
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

  public async getTransactionDetailsFromSigned(transaction: SignedRskTransaction): Promise<IAirGapTransaction[]> {
    const rskTx = TransactionFactory.fromSerializedData(Buffer.from(transaction.transaction, 'hex'))

    if (rskTx.type === 0) {
      const tx = rskTx as Transaction

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
      // RSK doesn't have EIP1559 transaction type
      const feeTx = rskTx as FeeMarketEIP1559Transaction

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
      throw new Error(`Transaction type "${rskTx.type}" not supported`)
    }
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address: RskAddress = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.getValue()])
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
    const address: string = await this.getAddressFromPublicKey(publicKey).then((address: RskAddress) => address.getValue())
    const contractAddresses = subProtocols.map((subProtocol) => {
      if (subProtocol.subProtocolType === SubProtocolType.TOKEN && subProtocol.contractAddress) {
        return subProtocol.contractAddress
      } else {
        throw new UnsupportedError(Domain.RSK, 'can only retrieve balance of Rsk ERC20-token')
      }
    })
    const balances = await this.options.nodeClient.callBalanceOfOnContracts(contractAddresses, address)

    return contractAddresses.map((contractAddress) => balances[contractAddress]?.toFixed() ?? '0')
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
  ): Promise<RawRskTransaction> {
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
    const address: string = await this.getAddressFromPublicKey(publicKey).then((address: RskAddress) => address.getValue())
    const rpcData = new RskRPCDataTransfer(address, recipients[0])
    const estimatedGas = await this.options.nodeClient.estimateTransactionGas(
      address,
      recipients[0],
      RskUtils.toHex(values[0]),
      data ?? rpcData.abiEncoded(),
      RskUtils.toHex(this.MAX_GAS_ESTIMATE)
    )
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
    fee: string,
    data?: any
  ): Promise<RawRskTransaction> {
    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    const address: string = await this.getAddressFromPublicKey(publicKey).then((address: RskAddress) => address.getValue())

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }

    const amount = RskUtils.toHex(wrappedValues[0].toFixed())

    const balance = await this.getBalanceOfPublicKey(publicKey)
    const gasLimit = await this.options.nodeClient.estimateTransactionGas(
      address,
      recipients[0],
      amount,
      undefined,
      RskUtils.toHex(this.MAX_GAS_ESTIMATE)
    )
    const gasPrice = wrappedFee.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)
    if (new BigNumber(balance).gte(new BigNumber(wrappedValues[0].plus(wrappedFee)))) {
      const txCount = await this.options.nodeClient.fetchTransactionCount(address)
      const transaction: RawRskTransaction = {
        nonce: RskUtils.toHex(txCount),
        gasLimit: RskUtils.toHex(gasLimit.toFixed()),
        gasPrice: RskUtils.toHex(gasPrice.toFixed()), // 10 Gwei
        to: recipients[0],
        value: amount,
        chainId: this.options.network.extras.chainID,
        data: '0x'
      }

      return transaction
    } else {
      throw new BalanceError(Domain.RSK, 'not enough balance')
    }
  }

  public async broadcastTransaction(rawTransaction: string): Promise<string> {
    return this.options.nodeClient.sendSignedTransaction(`0x${rawTransaction}`)
  }

  public async getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    cursor: RskTransactionCursor
  ): Promise<RskTransactionResult> {
    const publicKey = await this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, 0, 0)

    return this.getTransactionsFromPublicKey(publicKey, limit, cursor)
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number = 50,
    cursor?: RskTransactionCursor
  ): Promise<RskTransactionResult> {
    const address: RskAddress = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsFromAddresses([address.getValue()], limit, cursor)
  }

  public getTransactionsFromAddresses(addresses: string[], limit: number, cursor?: RskTransactionCursor): Promise<RskTransactionResult> {
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<RskTransactionResult>[] = []
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

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    return this.cryptoClient.signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return this.cryptoClient.verifyMessage(message, signature, publicKey)
  }

  public async encryptAsymmetric(message: string, publicKey: string): Promise<string> {
    return this.cryptoClient.encryptAsymmetric(message, publicKey)
  }

  public async decryptAsymmetric(message: string, keypair: { publicKey: string; privateKey: Buffer }): Promise<string> {
    return this.cryptoClient.decryptAsymmetric(message, keypair)
  }

  public async encryptAES(message: string, privateKey: Buffer): Promise<string> {
    return this.cryptoClient.encryptAES(message, privateKey)
  }

  public async decryptAES(message: string, privateKey: Buffer): Promise<string> {
    return this.cryptoClient.decryptAES(message, privateKey)
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    const statusPromises: Promise<AirGapTransactionStatus>[] = transactionHashes.map((txHash: string) => {
      return this.options.nodeClient.getTransactionStatus(txHash)
    })

    return Promise.all(statusPromises)
  }
}
