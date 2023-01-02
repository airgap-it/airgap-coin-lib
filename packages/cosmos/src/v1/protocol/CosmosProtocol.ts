import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BIP32Interface, fromSeed } from '@airgap/coinlib-core/dependencies/src/bip32-2.0.4/src/index'
import { mnemonicToSeed, validateMnemonic } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { decodeTxBytes, encodeTxBytes, prepareSignBytes } from '@airgap/coinlib-core/dependencies/src/cosmjs'
import SECP256K1 = require('@airgap/coinlib-core/dependencies/src/secp256k1-3.7.1/elliptic')
import sha = require('@airgap/coinlib-core/dependencies/src/sha.js-2.4.11/index')
import { BalanceError, InvalidValueError, UnsupportedError } from '@airgap/coinlib-core/errors'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  FeeDefaults,
  KeyPair,
  newAmount,
  newPublicKey,
  newSecretKey,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  Secret,
  SecretKey,
  Signature,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'

import { CosmosAddress } from '../data/CosmosAddress'
import { CosmosCoin } from '../data/CosmosCoin'
import { CosmosFee } from '../data/CosmosFee'
import { CosmosTransaction } from '../data/transaction/CosmosTransaction'
import { CosmosDelegateMessage } from '../data/transaction/message/CosmosDelegateMessage'
import { CosmosMessageType, CosmosMessageTypeValue } from '../data/transaction/message/CosmosMessage'
import { CosmosSendMessage } from '../data/transaction/message/CosmosSendMessage'
import { CosmosWithdrawDelegationRewardMessage } from '../data/transaction/message/CosmosWithdrawDelegationRewardMessage'
import { CosmosNodeClient } from '../node/CosmosNodeClient'
import { CosmosProtocolNetwork, CosmosProtocolOptions, CosmosUnits } from '../types/protocol'
import { CosmosAccount, CosmosNodeInfo, CosmosPagedSendTxsResponse } from '../types/rpc'
import { CosmosSignedTransaction, CosmosTransactionCursor, CosmosUnsignedTransaction } from '../types/transaction'
import { convertPublicKey, convertSecretKey } from '../utils/key'
import { convertSignature } from '../utils/signature'
import { calculateTransactionLimit } from '../utils/transaction'

import { CosmosCryptoClient } from './CosmosCryptoClient'

// Interface

export interface CosmosProtocol
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: CosmosProtocolNetwork
      SignedTransaction: CosmosSignedTransaction
      TransactionCursor: CosmosTransactionCursor
      Units: CosmosUnits
      FeeEstimation: FeeDefaults<CosmosUnits>
      UnsignedTransaction: CosmosUnsignedTransaction
    },
    'CryptoExtension',
    'FetchDataForAddressExtension'
  > {
  getKeyPairFromSecretKey(secretKey: SecretKey): Promise<KeyPair>
}

// Implementation

const DEFAULT_GAS: Amount<CosmosUnits> = newAmount('200000', 'blockchain')

export class CosmosProtocolImpl implements CosmosProtocol {
  private readonly options: CosmosProtocolOptions

  private readonly nodeClient: CosmosNodeClient
  private readonly cryptoClient: CosmosCryptoClient

  public constructor(options: RecursivePartial<CosmosProtocolOptions> = {}) {
    this.options = createCosmosProtocolOptions(options.network)

    this.nodeClient = new CosmosNodeClient(this.options.network.rpcUrl, this.options.network.useCORSProxy)
    this.cryptoClient = new CosmosCryptoClient()
  }

  // Common

  private readonly units: ProtocolUnitsMetadata<CosmosUnits> = {
    atom: {
      symbol: { value: 'ATOM', market: 'atom' },
      decimals: 6
    },
    uatom: {
      symbol: { value: 'uATOM' },
      decimals: 0
    }
  }

  private readonly feeDefaults: FeeDefaults<CosmosUnits> = {
    low: newAmount(0.0005, 'atom').blockchain(this.units),
    medium: newAmount(0.005, 'atom').blockchain(this.units),
    high: newAmount(0.0072, 'atom').blockchain(this.units)
  }

  private readonly metadata: ProtocolMetadata<CosmosUnits> = {
    identifier: MainProtocolSymbols.COSMOS,
    name: 'Cosmos',

    units: this.units,
    mainUnit: 'atom',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44'/118'/0'/0/0`,
      address: {
        isCaseSensitive: false,
        placeholder: 'cosmos...',
        regex: '^(cosmos|cosmosvaloper)[a-zA-Z0-9]{39}$'
      }
    },

    transaction: {
      arbitraryData: {
        name: 'memo'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<CosmosUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return CosmosAddress.from(publicKey).asString()
  }

  public async getDetailsFromTransaction(
    transaction: CosmosSignedTransaction | CosmosUnsignedTransaction,
    _publicKey: PublicKey
  ): Promise<AirGapTransaction<CosmosUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction)
      case 'unsigned':
        return this.getDetailsFromUnsignedTransaction(transaction)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.COSMOS, 'Unsupported transaction type.')
    }
  }

  private async getDetailsFromSignedTransaction(transaction: CosmosSignedTransaction): Promise<AirGapTransaction<CosmosUnits>[]> {
    const bytes = Uint8Array.from(Buffer.from(transaction.encoded, 'base64'))
    const decoded = await decodeTxBytes(bytes)

    const fee: string = (decoded.fee?.amount as { amount: string }[])
      .map(({ amount }: { amount: string }) => new BigNumber(amount))
      .reduce((current: BigNumber, next: BigNumber) => current.plus(next))
      .toString(10)
    const result = decoded.messages
      .map((message) => {
        const type: string = message.typeUrl
        switch (type) {
          case CosmosMessageType.Send.value:
            const sendMessage = CosmosSendMessage.fromEncodeObject(message)

            return sendMessage.toAirGapTransaction(this.options.network, fee)
          case CosmosMessageType.Undelegate.value:
          case CosmosMessageType.Delegate.value:
            const delegateMessage = CosmosDelegateMessage.fromEncodeObject(message)

            return delegateMessage.toAirGapTransaction(this.options.network, fee)
          case CosmosMessageType.WithdrawDelegationReward.value:
            const withdrawMessage = CosmosWithdrawDelegationRewardMessage.fromEncodeObject(message)

            return withdrawMessage.toAirGapTransaction(this.options.network, fee)
          default:
            throw new InvalidValueError(Domain.COSMOS, 'Unknown transaction')
        }
      })
      .map((tx: AirGapTransaction<CosmosUnits>) => {
        if (!tx.json) {
          tx.json = {}
        }
        tx.json.memo = decoded.memo
        if (decoded.signerInfos.length > 0) {
          tx.json.sequence = decoded.signerInfos[0].sequence.toString(10)
        }

        tx.arbitraryData = decoded.memo

        return tx
      })

    return result
  }

  private async getDetailsFromUnsignedTransaction(transaction: CosmosUnsignedTransaction): Promise<AirGapTransaction<CosmosUnits>[]> {
    return CosmosTransaction.fromJSON(transaction).toAirGapTransactions(this.options.network)
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    const hexSignature: Signature = convertSignature(signature, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.verifyMessage(message, hexSignature.value, hexPublicKey.value)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.encryptAsymmetric(payload, hexPublicKey.value)
  }

  // Offline

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair> {
    switch (secret.type) {
      case 'hex':
        const nodeFromHex: BIP32Interface = fromSeed(Buffer.from(secret.value, 'hex'))

        return this.getKeyPairFromNode(nodeFromHex, derivationPath)
      case 'mnemonic':
        validateMnemonic(secret.value)
        const seed = mnemonicToSeed(secret.value, secret.password)
        const nodeFromMnemonic = fromSeed(seed)

        return this.getKeyPairFromNode(nodeFromMnemonic, derivationPath)
      default:
        assertNever(secret)
        throw new UnsupportedError(Domain.COSMOS, 'Unsupported secret type.')
    }
  }

  private async getKeyPairFromNode(node: BIP32Interface, derivationPath?: string): Promise<KeyPair> {
    const keyPair = node.derivePath(derivationPath ?? 'm/')
    const secretKey = keyPair.privateKey
    if (secretKey === undefined) {
      throw new InvalidValueError(Domain.COSMOS, 'Cannot generate private key')
    }
    const publicKey = keyPair.publicKey

    return {
      secretKey: newSecretKey(secretKey.toString('hex'), 'hex'),
      publicKey: newPublicKey(publicKey.toString('hex'), 'hex')
    }
  }

  public async signTransactionWithSecretKey(
    transaction: CosmosUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<CosmosSignedTransaction> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')
    const privateKeyBuffer = Buffer.from(hexSecretKey.value, 'hex')
    const { publicKey } = await this.getKeyPairFromSecretKey(secretKey)
    const hexPublicKey = convertPublicKey(publicKey, 'hex')
    const publicKeyBuffer = Buffer.from(hexPublicKey.value, 'hex')

    const encodedObject = CosmosTransaction.fromJSON(transaction).toEncodeObject()

    const signBytes = await prepareSignBytes(
      encodedObject,
      transaction.fee,
      Uint8Array.from(publicKeyBuffer),
      new BigNumber(transaction.sequence).toNumber(),
      transaction.chainID,
      new BigNumber(transaction.accountNumber).toNumber()
    )

    const sha256Hash: string = sha('sha256').update(signBytes).digest()
    const hash = Buffer.from(sha256Hash)
    const signed = SECP256K1.sign(hash, privateKeyBuffer)
    const sigBase64 = Buffer.from(signed.signature, 'binary').toString('base64')

    const txBytes = await encodeTxBytes(
      encodedObject,
      transaction.fee,
      Uint8Array.from(publicKeyBuffer),
      new BigNumber(transaction.sequence).toNumber(),
      {
        signature: sigBase64,
        pub_key: {
          type: 'tendermint/PubKeySecp256k1',
          value: publicKeyBuffer.toString('base64')
        }
      },
      transaction.chainID,
      new BigNumber(transaction.accountNumber).toNumber()
    )

    return newSignedTransaction<CosmosSignedTransaction>({
      encoded: Buffer.from(txBytes).toString('base64')
    })
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const signature: string = await this.cryptoClient.signMessage(message, { privateKey: hexSecretKey.value })

    return newSignature(signature, 'hex')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(keyPair.publicKey, 'hex')

    return this.cryptoClient.decryptAsymmetric(payload, {
      privateKey: hexSecretKey.value,
      publicKey: hexPublicKey.value
    })
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.encryptAES(payload, hexSecretKey.value)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.decryptAES(payload, hexSecretKey.value)
  }

  // Online

  public async getNetwork(): Promise<CosmosProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: CosmosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<CosmosTransactionCursor, CosmosUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: CosmosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<CosmosTransactionCursor, CosmosUnits>> {
    const promises: Promise<CosmosPagedSendTxsResponse>[] = []
    let senderOffset = 0
    let recipientOffset = 0

    let senderTotal = 0
    let recipientTotal = 0

    let senderLimit = 0
    let recipientLimit = 0

    if (cursor) {
      senderOffset = cursor.sender.offset
      recipientOffset = cursor.recipient.offset
      senderTotal = cursor.sender.total
      recipientTotal = cursor.recipient.total

      senderLimit = calculateTransactionLimit(limit, senderTotal, recipientTotal, senderOffset, recipientOffset)

      if (senderOffset <= Math.floor(senderTotal / senderLimit) * senderLimit) {
        promises.push(this.nodeClient.fetchSendTransactionsFor(address, senderLimit, senderOffset, true))
      } else {
        promises.push(
          new Promise((resolve) => {
            resolve({ txs: [], tx_responses: [], pagination: { total: String(senderTotal) } })
          })
        )
      }

      recipientLimit = calculateTransactionLimit(limit, recipientTotal, senderTotal, recipientOffset, senderOffset)

      if (recipientOffset <= Math.floor(recipientTotal / recipientLimit) * recipientLimit) {
        promises.push(this.nodeClient.fetchSendTransactionsFor(address, recipientLimit, recipientOffset, false))
      } else {
        promises.push(
          new Promise((resolve) => {
            resolve({ txs: [], tx_responses: [], pagination: { total: String(recipientTotal) } })
          })
        )
      }
    } else {
      ;[senderTotal, recipientTotal] = await Promise.all([
        this.nodeClient
          .fetchSendTransactionsFor(address, 1, 0, true)
          .then((response) => new BigNumber(response.pagination.total).toNumber()),
        this.nodeClient
          .fetchSendTransactionsFor(address, 1, 0, false)
          .then((response) => new BigNumber(response.pagination.total).toNumber())
      ])

      senderLimit = calculateTransactionLimit(limit, senderTotal, recipientTotal, senderOffset, recipientOffset)
      recipientLimit = calculateTransactionLimit(limit, recipientTotal, senderTotal, recipientOffset, senderOffset)

      promises.push(
        this.nodeClient.fetchSendTransactionsFor(address, senderLimit, senderOffset, true),
        this.nodeClient.fetchSendTransactionsFor(address, recipientLimit, recipientOffset, false)
      )
    }

    const transactions = await Promise.all(promises)
    const sentTransactions = transactions[0]
    const receivedTransactions = transactions[1]

    const allTransactions = sentTransactions?.tx_responses.concat(receivedTransactions?.tx_responses)
    let result: AirGapTransaction<CosmosUnits>[] = []

    for (const transaction of allTransactions) {
      const timestamp = new Date(transaction.timestamp).getTime() / 1000
      const fee = transaction.tx.auth_info.fee.amount
        .filter((coin) => coin.denom === 'uatom')
        .map((coin) => new BigNumber(coin.amount))
        .reduce((current, next) => current.plus(next))

      result = result.concat(
        transaction.tx.body.messages.map((msg) => {
          const tx: Partial<AirGapTransaction<CosmosUnits>> = {
            isInbound: false,
            amount: newAmount('0', 'blockchain'),
            fee: newAmount(fee, 'blockchain'),
            network: this.options.network,
            status: {
              type: 'unknown',
              hash: transaction.txhash
            },
            timestamp
          }
          switch (msg['@type']) {
            case CosmosMessageTypeValue.UNDELEGATE:
              return {
                ...tx,
                from: [msg.validator_address],
                to: [msg.delegator_address]
              }
            case CosmosMessageTypeValue.WITHDRAW_DELEGATION_REWARD:
              return {
                ...tx,
                from: [msg.delegator_address],
                to: [msg.validator_address]
              }
            case CosmosMessageTypeValue.DELEGATE:
              return {
                ...tx,
                from: [msg.delegator_address],
                to: [msg.validator_address]
              }

            default:
              return {
                ...tx,
                from: [msg.from_address],
                to: [msg.to_address],
                isInbound: msg.to_address === address,
                amount: newAmount(msg.amount[0].amount, 'blockchain')
              }
          }
        })
      )
    }

    return {
      transactions: result,
      cursor: {
        hasNext: senderOffset + senderLimit < senderTotal || recipientOffset + recipientLimit < recipientTotal,
        limit,
        sender: {
          total: senderTotal,
          offset: senderOffset + senderLimit
        },
        recipient: {
          total: recipientTotal,
          offset: recipientOffset + recipientLimit
        }
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<CosmosUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<CosmosUnits>> {
    const balance: { total: BigNumber; available: BigNumber } = await this.nodeClient.fetchBalance(address)

    return {
      total: newAmount(balance.total, 'blockchain'),
      transferable: newAmount(balance.available, 'blockchain')
    }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionConfiguration<CosmosUnits>
  ): Promise<Amount<CosmosUnits>> {
    const { total, transferable }: Balance<CosmosUnits> = await this.getBalanceOfPublicKey(publicKey)
    const balance = new BigNumber(newAmount(transferable ?? total).blockchain(this.units).value)

    let fee: Amount<CosmosUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<CosmosUnits> = await this.getTransactionFeeWithPublicKey(
        publicKey,
        to.map((recipient: string) => ({
          to: recipient,
          amount: newAmount(balance.div(to.length).decimalPlaces(0, BigNumber.ROUND_CEIL), 'blockchain')
        }))
      )
      fee = newAmount(estimatedFee.medium).blockchain(this.units)
      if (balance.lte(fee.value)) {
        fee = newAmount(0, 'blockchain')
      }
    }
    fee = newAmount(fee).blockchain(this.units)

    let amountWithoutFees: BigNumber = balance.minus(fee.value)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return newAmount(amountWithoutFees, 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<CosmosUnits>[]
  ): Promise<FeeDefaults<CosmosUnits>> {
    return this.feeDefaults
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<CosmosUnits>[],
    configuration?: TransactionConfiguration<CosmosUnits>
  ): Promise<CosmosUnsignedTransaction> {
    let fee: Amount<CosmosUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<CosmosUnits> = await this.getTransactionFeeWithPublicKey(publicKey, details)
      fee = estimatedFee.medium
    }

    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(this.units).value)

    const address: string = await this.getAddressFromPublicKey(publicKey)
    const nodeInfo: CosmosNodeInfo = await this.nodeClient.fetchNodeInfo()
    const account: CosmosAccount = await this.nodeClient.fetchAccount(address)
    const { total, transferable }: Balance<CosmosUnits> = await this.getBalanceOfPublicKey(publicKey)
    const balance: BigNumber = new BigNumber(newAmount(transferable ?? total).blockchain(this.units).value)

    if (
      balance.lt(
        details.reduce(
          (acc: BigNumber, next: TransactionDetails<CosmosUnits>) => acc.plus(newAmount(next.amount).blockchain(this.units).value),
          wrappedFee
        )
      )
    ) {
      throw new BalanceError(Domain.COSMOS, 'not enough balance')
    }

    const messages: CosmosSendMessage[] = []
    for (let i: number = 0; i < details.length; ++i) {
      const message: CosmosSendMessage = new CosmosSendMessage(address, details[i].to, [
        new CosmosCoin('uatom', newAmount(details[i].amount).blockchain(this.units).value)
      ])
      messages.push(message)
    }
    const memo: string = configuration?.arbitraryData ?? ''
    const transaction: CosmosTransaction = new CosmosTransaction(
      messages,
      new CosmosFee([new CosmosCoin('uatom', wrappedFee.toString(10))], newAmount(DEFAULT_GAS).blockchain(this.units).value),
      memo,
      nodeInfo.network,
      account.value.account_number,
      account.value.sequence ?? '0'
    )

    return newUnsignedTransaction<CosmosUnsignedTransaction>({
      messages: transaction.messages.map((message) => message.toJSON()),
      fee: transaction.fee.toJSON(),
      memo: transaction.memo,
      chainID: transaction.chainID,
      accountNumber: transaction.accountNumber,
      sequence: transaction.sequence
    })
  }

  public async broadcastTransaction(transaction: CosmosSignedTransaction): Promise<string> {
    return this.nodeClient.broadcastSignedTransaction(transaction.encoded)
  }

  // Custom

  public async getKeyPairFromSecretKey(secretKey: SecretKey): Promise<KeyPair> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')
    const publicKey = SECP256K1.publicKeyCreate(Buffer.from(secretKey.value, 'hex'))

    return {
      secretKey: hexSecretKey,
      publicKey: newPublicKey(Buffer.from(publicKey, 'binary').toString('hex'), 'hex')
    }
  }
}

// Factory

export function createCosmosProtocol(options: RecursivePartial<CosmosProtocolOptions> = {}): CosmosProtocol {
  return new CosmosProtocolImpl(options)
}

export const COSMOS_MAINNET_PROTOCOL_NETWORK: CosmosProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://cosmos-node.prod.gke.papers.tech'
}

const DEFAULT_COSMOS_PROTOCOL_NETWORK: CosmosProtocolNetwork = COSMOS_MAINNET_PROTOCOL_NETWORK

export function createCosmosProtocolOptions(network: Partial<CosmosProtocolNetwork> = {}): CosmosProtocolOptions {
  return {
    network: { ...DEFAULT_COSMOS_PROTOCOL_NETWORK, ...network }
  }
}
