import { AxiosError } from '../../dependencies/src/axios-0.19.0'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { NetworkError } from '../../errors'
import { Domain } from '../../errors/coinlib-error'
import { AirGapTransactionStatus, IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { SignedSubstrateTransaction } from '../../serializer/schemas/definitions/signed-transaction-substrate'
import { UnsignedSubstrateTransaction } from '../../serializer/schemas/definitions/unsigned-transaction-substrate'
import { RawSubstrateTransaction } from '../../serializer/types'
import { ProtocolSymbols } from '../../utils/ProtocolSymbols'
import { CurrencyUnit, FeeDefaults } from '../ICoinProtocol'
import { ICoinSubProtocol } from '../ICoinSubProtocol'
import { NonExtendedProtocol } from '../NonExtendedProtocol'

import { SubstrateAddress } from './common/data/account/SubstrateAddress'
import { SubstrateTransaction, SubstrateTransactionType } from './common/data/transaction/SubstrateTransaction'
import { SubstrateAccountId, SubstrateCompatAddressType } from './compat/SubstrateCompatAddress'
import { SubstrateCryptoClient } from './SubstrateCryptoClient'
import { SubstrateNetwork } from './SubstrateNetwork'
import { SubstrateProtocolOptions } from './SubstrateProtocolOptions'
import { SubstrateTransactionCursor, SubstrateTransactionResult } from './SubstrateTypes'

export abstract class SubstrateProtocol<Network extends SubstrateNetwork> extends NonExtendedProtocol {
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

  public abstract addressIsCaseSensitive: boolean

  public addressValidationPattern: string = '^5[a-km-zA-HJ-NP-Z1-9]+$'
  public addressPlaceholder: string = `5ABC...`

  public readonly cryptoClient: SubstrateCryptoClient = new SubstrateCryptoClient()

  constructor(public readonly options: SubstrateProtocolOptions<Network>) {
    super()
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

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer> {
    const keyPair = await this.options.accountController.createKeyPairFromMnemonic(mnemonic, derivationPath, password)

    return keyPair.privateKey
  }

  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const keyPair = await this.options.accountController.createKeyPairFromHexSecret(secret, derivationPath)

    return keyPair.publicKey.toString('hex')
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer> {
    const keyPair = await this.options.accountController.createKeyPairFromHexSecret(secret, derivationPath)

    return keyPair.privateKey
  }

  public async getAddressFromPublicKey(publicKey: string): Promise<SubstrateCompatAddressType[Network]> {
    return this.options.accountController.createAddressFromPublicKey(publicKey)
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<SubstrateCompatAddressType[Network][]> {
    return [await this.getAddressFromPublicKey(publicKey)]
  }

  public async getNextAddressFromPublicKey(
    publicKey: string,
    current: SubstrateCompatAddressType[Network]
  ): Promise<SubstrateCompatAddressType[Network]> {
    return current
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: SubstrateTransactionCursor
  ): Promise<SubstrateTransactionResult> {
    const addresses = await this.getAddressesFromPublicKey(publicKey).then((addresses: SubstrateCompatAddressType[Network][]) =>
      addresses.map((address: SubstrateCompatAddressType[Network]) => address.getValue())
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

  public async signWithPrivateKey(privateKey: Buffer, rawTransaction: RawSubstrateTransaction): Promise<string> {
    const txs = this.options.transactionController.decodeDetails(rawTransaction.encoded)
    const signed = await Promise.all(
      txs.map((tx) => this.options.transactionController.signTransaction(privateKey, tx.transaction, tx.payload))
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

    return this.getBalanceOfAddresses([address.getValue()])
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
      this.getFutureRequiredTransactions(publicKey, 'check')
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
      low: fee.shiftedBy(-this.decimals).toFixed(),
      medium: fee.shiftedBy(-this.decimals).toFixed(),
      high: fee.shiftedBy(-this.decimals).toFixed()
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
      this.options.accountController.isNominating(accountId),
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

  public async signMessage(message: string, keypair: { publicKey: string; privateKey: Buffer }): Promise<string> {
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
    // https://github.com/w3f/schnorrkel/blob/master/src/keys.rs
    // https://github.com/polkadot-js/wasm/blob/master/packages/wasm-crypto/src/sr25519.rs
    const key: Buffer = privateKey.slice(0, 32) // Substrate key is 32 bytes key + 32 bytes nonce

    return this.cryptoClient.encryptAES(message, key)
  }

  public async decryptAES(message: string, privateKey: Buffer): Promise<string> {
    // https://github.com/w3f/schnorrkel/blob/master/src/keys.rs
    // https://github.com/polkadot-js/wasm/blob/master/packages/wasm-crypto/src/sr25519.rs
    const key: Buffer = privateKey.slice(0, 32) // Substrate key is 32 bytes key + 32 bytes nonce

    return this.cryptoClient.decryptAES(message, key)
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    return Promise.reject('Transaction status not implemented')
  }
}
