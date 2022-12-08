import { ICoinProtocol, ICoinSubProtocol } from '@airgap/coinlib-core'
import { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { NetworkError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { AirGapTransactionStatus, IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { CurrencyUnit, FeeDefaults } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { NonExtendedProtocol } from '@airgap/coinlib-core/protocols/NonExtendedProtocol'
import { ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { SignedSubstrateTransaction } from '../types/signed-transaction-substrate'

import { RawSubstrateTransaction } from '../types/transaction-substrate'
import { UnsignedSubstrateTransaction } from '../types/unsigned-transaction-substrate'

import { SubstrateAddress } from './common/data/account/SubstrateAddress'
import { SubstrateTransaction, SubstrateTransactionType } from './common/data/transaction/SubstrateTransaction'
import { SubstrateAccountId, SubstrateCompatAddressType } from './compat/SubstrateCompatAddress'
import { SubstrateCryptoClient } from './SubstrateCryptoClient'
import { SubstrateNetwork } from './SubstrateNetwork'
import { SubstrateProtocolOptions } from './SubstrateProtocolOptions'
import { SubstrateAddressCursor, SubstrateAddressResult, SubstrateTransactionCursor, SubstrateTransactionResult } from './SubstrateTypes'

export abstract class SubstrateProtocol<Network extends SubstrateNetwork> extends NonExtendedProtocol implements ICoinProtocol {
  public abstract symbol: string
  public abstract name: string
  public abstract marketSymbol: string
  public abstract feeSymbol: string

  public abstract decimals: number
  public abstract feeDecimals: number
  public abstract identifier: ProtocolSymbols

  public abstract feeDefaults: FeeDefaults
  public abstract units: CurrencyUnit[]
  public abstract standardDerivationPath: string

  public supportsHD: boolean = false

  public addressIsCaseSensitive: boolean = true
  public addressValidationPattern: string = '^5[a-km-zA-HJ-NP-Z1-9]+$'
  public addressPlaceholder: string = `5ABC...`

  public readonly cryptoClient: SubstrateCryptoClient = new SubstrateCryptoClient()

  constructor(public readonly options: SubstrateProtocolOptions<Network>) {
    super()
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

  public async getFeeSymbol(): Promise<string> {
    return this.feeSymbol
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

  public async getFeeDefaults(): Promise<FeeDefaults> {
    return this.feeDefaults
  }

  public async getUnits(): Promise<CurrencyUnit[]> {
    return this.units
  }

  public async getStandardDerivationPath(): Promise<string> {
    return this.standardDerivationPath
  }

  public async getSupportsHD(): Promise<boolean> {
    return this.supportsHD
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

  public async getOptions(): Promise<SubstrateProtocolOptions<Network>> {
    return this.options
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return this.options.network.blockExplorer.getAddressLink(address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return this.options.network.blockExplorer.getTransactionLink(txId)
  }

  public async getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const keyPair = await this.options.accountController.createKeyPairFromMnemonic(mnemonic, derivationPath, password)

    return keyPair.publicKey.toString('hex')
  }

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const keyPair = await this.options.accountController.createKeyPairFromMnemonic(mnemonic, derivationPath, password)

    return keyPair.privateKey.toString('hex')
  }

  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const keyPair = await this.options.accountController.createKeyPairFromHexSecret(secret, derivationPath)

    return keyPair.publicKey.toString('hex')
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const keyPair = await this.options.accountController.createKeyPairFromHexSecret(secret, derivationPath)

    return keyPair.privateKey.toString('hex')
  }

  public async getAddressFromPublicKey(publicKey: string, cursor?: SubstrateAddressCursor): Promise<SubstrateAddressResult> {
    const address: SubstrateCompatAddressType[Network] = await this.options.accountController.createAddressFromPublicKey(publicKey)

    return {
      address: address.asString(),
      cursor: { hasNext: false }
    }
  }

  public async getAddressesFromPublicKey(publicKey: string, cursor?: SubstrateAddressCursor): Promise<SubstrateAddressResult[]> {
    return [await this.getAddressFromPublicKey(publicKey, cursor)]
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: SubstrateTransactionCursor
  ): Promise<SubstrateTransactionResult> {
    const addresses = await this.getAddressesFromPublicKey(publicKey).then((addresses: SubstrateAddressResult[]) =>
      addresses.map((address: SubstrateAddressResult) => address.address)
    )

    return this.getTransactionsFromAddresses(addresses, limit, cursor)
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: SubstrateTransactionCursor
  ): Promise<SubstrateTransactionResult> {
    const txs: Partial<IAirGapTransaction[]>[] = await Promise.all(
      addresses.map((address) => this.options.blockExplorerClient.getTransactions(address, limit, this.decimals, cursor))
    )

    const transactions = txs
      .reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
      .map((tx) => ({
        protocolIdentifier: this.identifier,
        network: this.options.network,
        from: [],
        to: [],
        isInbound: false,
        amount: '',
        fee: '',
        ...tx
      }))

    return { transactions, cursor: { page: cursor ? cursor.page + 1 : 1 } }
  }

  public async signWithPrivateKey(privateKey: string, rawTransaction: RawSubstrateTransaction): Promise<string> {
    const txs = this.options.transactionController.decodeDetails(rawTransaction.encoded)
    const signed = await Promise.all(
      txs.map((tx) => this.options.transactionController.signTransaction(Buffer.from(privateKey, 'hex'), tx.transaction, tx.payload))
    )

    txs.forEach((tx, index) => (tx.transaction = signed[index]))

    return this.options.transactionController.encodeDetails(txs)
  }

  public async getTransactionDetails(transaction: UnsignedSubstrateTransaction): Promise<IAirGapTransaction[]> {
    return this.getTransactionDetailsFromEncoded(transaction.transaction.encoded)
  }

  public async getTransactionDetailsFromSigned(transaction: SignedSubstrateTransaction): Promise<IAirGapTransaction[]> {
    return this.getTransactionDetailsFromEncoded(transaction.transaction)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const balances = await Promise.all(addresses.map((address) => this.options.accountController.getBalance(address)))
    const balance = balances.reduce((current: BigNumber, next: BigNumber) => current.plus(next))

    return balance.toString(10)
  }

  public async getAvailableBalanceOfAddresses(addresses: string[]): Promise<string> {
    const balances = await Promise.all(addresses.map((address) => this.options.accountController.getTransferableBalance(address, false)))
    const balance = balances.reduce((current: BigNumber, next: BigNumber) => current.plus(next))

    return balance.toString(10)
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.address])
  }

  public async getBalanceOfPublicKeyForSubProtocols(publicKey: string, subProtocols: ICoinSubProtocol[]): Promise<string[]> {
    throw Promise.reject('get balance of sub protocols not supported')
  }

  public async estimateMaxTransactionValueFromPublicKey(
    publicKey: string,
    _recipients: string[],
    fee?: string,
    data?: { excludeExistentialDeposit?: boolean }
  ): Promise<string> {
    const results = await Promise.all([
      this.options.accountController.getTransferableBalance(publicKey, data?.excludeExistentialDeposit),
      this.getFutureRequiredTransactions(publicKey, 'transfer')
    ])

    const transferableBalance = results[0]
    const futureTransactions = results[1]

    const feeEstimate = await this.options.transactionController.estimateTransactionFees(publicKey, futureTransactions)

    if (!feeEstimate) {
      return Promise.reject('Could not estimate max value.')
    }

    let maxAmount = transferableBalance.minus(feeEstimate).minus(new BigNumber(fee || 0))

    if (maxAmount.lt(0)) {
      maxAmount = new BigNumber(0)
    }

    return maxAmount.toFixed()
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    const destination = recipients[0]
    const value = values[0]

    const transaction = await this.options.transactionController.createTransaction(SubstrateTransactionType.TRANSFER, publicKey, 0, {
      to: destination && destination.length > 0 ? destination : publicKey,
      value: new BigNumber(value)
    })
    const fee = await this.options.transactionController.calculateTransactionFee(transaction)

    if (!fee) {
      return Promise.reject('Could not fetch all necessary data.')
    }

    return {
      low: fee.shiftedBy(-this.feeDecimals).toFixed(),
      medium: fee.shiftedBy(-this.feeDecimals).toFixed(),
      high: fee.shiftedBy(-this.feeDecimals).toFixed()
    }
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { excludeExistentialDeposit?: boolean }
  ): Promise<RawSubstrateTransaction> {
    if (recipients.length !== values.length) {
      return Promise.reject("Recipients length doesn't match values length.")
    }

    const recipientsWithValues: [string, string][] = recipients.map((recipient, index) => [recipient, values[index]])
    const excludeExistentialDeposit = data?.excludeExistentialDeposit
    const transferableBalance = await this.options.accountController.getTransferableBalance(publicKey, excludeExistentialDeposit)
    const totalValue = values.map((value) => new BigNumber(value)).reduce((total, next) => total.plus(next), new BigNumber(0))

    const available = new BigNumber(transferableBalance).minus(totalValue)

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(
      publicKey,
      available,
      recipientsWithValues.map(([recipient, value]) => ({
        type: SubstrateTransactionType.TRANSFER,
        tip: 0, // temporary, until we handle Substrate fee/tip model
        args: {
          to: recipient,
          value: new BigNumber(value)
        }
      }))
    )

    return { encoded }
  }

  public async broadcastTransaction(encoded: string): Promise<string> {
    const txs: [number | undefined, SubstrateTransaction<Network>][] = this.options.transactionController
      .decodeDetails(encoded)
      .map((tx) => [tx.runtimeVersion, tx.transaction])

    const txHashes = await Promise.all(
      txs.map((tx) =>
        this.options.nodeClient.submitTransaction(tx[1].encode({ network: this.options.network.extras.network, runtimeVersion: tx[0] }))
      )
    ).catch((error) => {
      throw new NetworkError(Domain.SUBSTRATE, error as AxiosError)
    })

    return txs[0][1]?.type !== SubstrateTransactionType.SUBMIT_BATCH ? txHashes[0] : ''
  }

  public async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<SubstrateCompatAddressType[Network]>,
    intention: 'check' | 'transfer' | 'delegate'
  ): Promise<[SubstrateTransactionType, any][]> {
    const results = await Promise.all([
      this.options.accountController.isBonded(accountId),
      this.options.accountController.isDelegating(accountId),
      this.options.accountController.getTransferableBalance(accountId),
      this.options.accountController.getTransferableBalance(accountId, false, false),
      this.options.accountController.getUnlockingBalance(accountId)
    ])

    const isBonded = results[0]
    const isNominating = results[1]
    const transferableBalance = results[2]
    const stakingBalance = results[3]
    const unlockingBalance = results[4]

    const isUnbonding = unlockingBalance.gt(0)

    const requiredTransactions: [SubstrateTransactionType, any][] = []

    if (intention === 'transfer') {
      requiredTransactions.push([
        SubstrateTransactionType.TRANSFER,
        {
          to: SubstrateAddress.createPlaceholder(),
          value: transferableBalance
        }
      ])
    }
    if (!isBonded && !isUnbonding && intention === 'delegate') {
      // not delegated & unbond
      requiredTransactions.push(
        [
          SubstrateTransactionType.BOND,
          {
            controller: SubstrateAddress.createPlaceholder(),
            value: stakingBalance,
            payee: 0
          }
        ],
        [
          SubstrateTransactionType.NOMINATE,
          {
            targets: [SubstrateAddress.createPlaceholder()]
          }
        ],
        [SubstrateTransactionType.CANCEL_NOMINATION, {}],
        [
          SubstrateTransactionType.UNBOND,
          {
            value: stakingBalance
          }
        ],
        [
          SubstrateTransactionType.WITHDRAW_UNBONDED,
          {
            slashingSpansNumber: 0
          }
        ]
      )
    } else if (isUnbonding && intention === 'delegate') {
      requiredTransactions.push(
        [
          SubstrateTransactionType.REBOND,
          {
            value: unlockingBalance
          }
        ],
        [
          SubstrateTransactionType.NOMINATE,
          {
            targets: [SubstrateAddress.createPlaceholder()]
          }
        ],
        [SubstrateTransactionType.CANCEL_NOMINATION, {}],
        [
          SubstrateTransactionType.UNBOND,
          {
            value: stakingBalance.plus(unlockingBalance)
          }
        ],
        [
          SubstrateTransactionType.WITHDRAW_UNBONDED,
          {
            slashingSpansNumber: 0
          }
        ]
      )
    } else if (isBonded) {
      requiredTransactions.push(
        [
          SubstrateTransactionType.UNBOND,
          {
            value: stakingBalance
          }
        ],
        [
          SubstrateTransactionType.WITHDRAW_UNBONDED,
          {
            slashingSpansNumber: 0
          }
        ]
      )
    }

    if (isNominating) {
      requiredTransactions.push([SubstrateTransactionType.CANCEL_NOMINATION, {}])
    }

    return requiredTransactions
  }

  private async getTransactionDetailsFromEncoded(encoded: string): Promise<IAirGapTransaction[]> {
    const txs = this.options.transactionController.decodeDetails(encoded)

    return txs
      .map((tx) => {
        return tx.transaction.toAirGapTransactions().map((part) => ({
          from: [],
          to: [],
          amount: '',
          fee: tx.fee.toString(),
          protocolIdentifier: this.identifier,
          network: this.options.network,
          isInbound: false,
          ...part
        }))
      })
      .reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
  }

  public async signMessage(message: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
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
    // https://github.com/w3f/schnorrkel/blob/master/src/keys.rs
    // https://github.com/polkadot-js/wasm/blob/master/packages/wasm-crypto/src/sr25519.rs
    const key: Buffer = Buffer.from(privateKey, 'hex').slice(0, 32) // Substrate key is 32 bytes key + 32 bytes nonce

    return this.cryptoClient.encryptAES(message, key.toString('hex'))
  }

  public async decryptAES(message: string, privateKey: string): Promise<string> {
    // https://github.com/w3f/schnorrkel/blob/master/src/keys.rs
    // https://github.com/polkadot-js/wasm/blob/master/packages/wasm-crypto/src/sr25519.rs
    const key: Buffer = Buffer.from(privateKey, 'hex').slice(0, 32) // Substrate key is 32 bytes key + 32 bytes nonce

    return this.cryptoClient.decryptAES(message, key.toString('hex'))
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    return Promise.reject('Transaction status not implemented')
  }
}
