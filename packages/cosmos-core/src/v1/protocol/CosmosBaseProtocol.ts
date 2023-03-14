import { assertNever, BalanceError, DelegateeDetails, DelegatorAction, DelegatorDetails, Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import { BIP32Interface, fromBase58 } from '@airgap/coinlib-core/dependencies/src/bip32-2.0.4/src/index'
import { decodeTxBytes, encodeTxBytes, prepareSignBytes } from '@airgap/coinlib-core/dependencies/src/cosmjs'
import SECP256K1 = require('@airgap/coinlib-core/dependencies/src/secp256k1-3.7.1/elliptic')
// @ts-ignore
import sha = require('@airgap/coinlib-core/dependencies/src/sha.js-2.4.11/index')
import { InvalidValueError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { DelegationDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import { encodeDerivative } from '@airgap/crypto'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newPublicKey,
  newSecretKey,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  SecretKey,
  Signature,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'
import { AirGapDelegateProtocol } from '@airgap/module-kit/internal'

import { CosmosNodeClient } from '../node/CosmosNodeClient'
import { CosmosCryptoConfiguration } from '../types/crypto'
import { CosmosAddress } from '../types/data/CosmosAddress'
import { CosmosCoin } from '../types/data/CosmosCoin'
import { CosmosFee } from '../types/data/CosmosFee'
import { CosmosTransaction } from '../types/data/transaction/CosmosTransaction'
import { CosmosDelegateMessage } from '../types/data/transaction/message/CosmosDelegateMessage'
import { CosmosMessageType, CosmosMessageTypeValue } from '../types/data/transaction/message/CosmosMessage'
import { CosmosSendMessage } from '../types/data/transaction/message/CosmosSendMessage'
import { CosmosWithdrawDelegationRewardMessage } from '../types/data/transaction/message/CosmosWithdrawDelegationRewardMessage'
import { CosmosProtocolNetwork, CosmosProtocolOptions } from '../types/protocol'
import {
  CosmosAccount,
  CosmosDelegation,
  CosmosNodeInfo,
  CosmosPagedSendTxsResponse,
  CosmosRewardDetails,
  CosmosUnbondingDelegation,
  CosmosValidator
} from '../types/rpc'
import {
  CosmosDelegationActionType,
  CosmosSignedTransaction,
  CosmosTransactionCursor,
  CosmosUnsignedTransaction
} from '../types/transaction'
import { convertPublicKey, convertSecretKey } from '../utils/key'
import { convertSignature } from '../utils/signature'
import { calculateTransactionLimit } from '../utils/transaction'

import { CosmosCryptoClient } from './CosmosCryptoClient'

// @ts-ignore

export interface CosmosBaseProtocol<_Units extends string>
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: CosmosProtocolNetwork
      CryptoConfiguration: CosmosCryptoConfiguration
      SignedTransaction: CosmosSignedTransaction
      TransactionCursor: CosmosTransactionCursor
      Units: _Units
      FeeEstimation: FeeDefaults<_Units>
      UnsignedTransaction: CosmosUnsignedTransaction
    },
    'Crypto',
    'FetchDataForAddress'
  > {
  getKeyPairFromSecretKey(secretKey: SecretKey): Promise<KeyPair>
}

export interface CosmosBaseStakingProtocol<_Units extends string> extends CosmosBaseProtocol<_Units>, AirGapDelegateProtocol {
  prepareDelegatorActionFromPublicKey(
    publicKey: PublicKey,
    type: CosmosDelegationActionType,
    data?: { validator: Address; amount?: string }
  ): Promise<CosmosTransaction[]>
  undelegate(publicKey: PublicKey, validatorAddress: Address, amount: Amount<_Units>, memo?: string): Promise<CosmosTransaction>
  delegate(
    publicKey: PublicKey,
    validatorAddress: Address | string[],
    amount: Amount<_Units>,
    undelegate: boolean,
    memo?: string
  ): Promise<CosmosTransaction>
  withdrawDelegationRewards(publicKey: PublicKey, validatorAddresses: Address[], memo?: string): Promise<CosmosTransaction>
  withdrawAllDelegationRewards(delegatorAddress: Address, fee: Amount<_Units>, memo?: string): Promise<string>
  fetchTotalReward(delegatorAddress: Address): Promise<Amount<_Units>>
  fetchRewardForDelegation(delegatorAddress: Address, validatorAddress: Address): Promise<Amount<_Units>>
  fetchDelegations(address: Address): Promise<CosmosDelegation[]>
  fetchTotalDelegatedAmount(address: Address): Promise<Amount<_Units>>
  fetchValidator(address: Address): Promise<CosmosValidator>
  fetchValidators(): Promise<CosmosValidator[]>
  fetchUnbondingDelegations(delegatorAddress: Address): Promise<CosmosUnbondingDelegation[]>
  fetchTotalUnbondingAmount(address: Address): Promise<Amount<_Units>>
  fetchSelfDelegation(address: Address): Promise<CosmosDelegation>
}

export abstract class CosmosBaseProtocolImpl<_Units extends string> implements CosmosBaseStakingProtocol<_Units> {
  protected readonly options: CosmosProtocolOptions<_Units>

  private readonly nodeClient: CosmosNodeClient<_Units>
  private readonly cryptoClient: CosmosCryptoClient
  private readonly cryptoConfiguration: CosmosCryptoConfiguration = {
    algorithm: 'secp256k1'
  }

  public constructor(options: CosmosProtocolOptions<_Units>) {
    this.options = options

    this.nodeClient = new CosmosNodeClient(this.options.network.rpcUrl, this.options.network.useCORSProxy)
    this.cryptoClient = new CosmosCryptoClient()
  }

  public async getKeyPairFromSecretKey(secretKey: SecretKey): Promise<KeyPair> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')
    const publicKey = SECP256K1.publicKeyCreate(Buffer.from(secretKey.value, 'hex'))

    return {
      secretKey: hexSecretKey,
      publicKey: newPublicKey(Buffer.from(publicKey, 'binary').toString('hex'), 'hex')
    }
  }

  public async getCryptoConfiguration(): Promise<CosmosCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const bip32Node = encodeDerivative('bip32', derivative)
    const bip32: BIP32Interface = fromBase58(bip32Node.secretKey)
    const secretKey = bip32.privateKey
    if (secretKey === undefined) {
      throw new InvalidValueError(Domain.COSMOS, 'Cannot generate secret key')
    }

    const publicKey = bip32.publicKey

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

  public abstract getMetadata(): Promise<ProtocolMetadata<_Units, _Units>>

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return CosmosAddress.from(publicKey, this.options.addressPrefix).asString()
  }

  public async getDetailsFromTransaction(
    transaction: CosmosSignedTransaction | CosmosUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<_Units, _Units>[]> {
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

  private async getDetailsFromSignedTransaction(transaction: CosmosSignedTransaction): Promise<AirGapTransaction<_Units>[]> {
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

            return sendMessage.toAirGapTransaction<_Units>(this.options.network, fee)
          case CosmosMessageType.Undelegate.value:
          case CosmosMessageType.Delegate.value:
            const delegateMessage = CosmosDelegateMessage.fromEncodeObject(message)

            return delegateMessage.toAirGapTransaction<_Units>(this.options.network, fee)
          case CosmosMessageType.WithdrawDelegationReward.value:
            const withdrawMessage = CosmosWithdrawDelegationRewardMessage.fromEncodeObject(message)

            return withdrawMessage.toAirGapTransaction<_Units>(this.options.network, fee)
          default:
            throw new InvalidValueError(Domain.COSMOS, 'Unknown transaction')
        }
      })
      .map((tx: AirGapTransaction<_Units>) => {
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

  private async getDetailsFromUnsignedTransaction(transaction: CosmosUnsignedTransaction): Promise<AirGapTransaction<_Units>[]> {
    return CosmosTransaction.fromJSON(transaction).toAirGapTransactions(this.options.network)
  }

  public async getNetwork(): Promise<CosmosProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: CosmosTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<CosmosTransactionCursor, _Units, _Units>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey, configuration?: undefined): Promise<Balance<_Units>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionConfiguration<_Units> | undefined
  ): Promise<Amount<_Units>> {
    const units = (await this.getMetadata()).units
    const { total, transferable }: Balance<_Units> = await this.getBalanceOfPublicKey(publicKey)
    const balance = new BigNumber(newAmount(transferable ?? total).blockchain(units).value)

    let fee: Amount<_Units>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<_Units> = await this.getTransactionFeeWithPublicKey(
        publicKey,
        to.map((recipient: string) => ({
          to: recipient,
          amount: newAmount(balance.div(to.length).decimalPlaces(0, BigNumber.ROUND_CEIL), 'blockchain')
        }))
      )
      fee = newAmount(estimatedFee.medium).blockchain(units)
      if (balance.lte(fee.value)) {
        fee = newAmount(0, 'blockchain')
      }
    }
    fee = newAmount(fee).blockchain(units)

    let amountWithoutFees: BigNumber = balance.minus(fee.value)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return newAmount(amountWithoutFees, 'blockchain')
  }

  public abstract getTransactionFeeWithPublicKey(publicKey: PublicKey, details: TransactionDetails<_Units>[]): Promise<FeeDefaults<_Units>>

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionConfiguration<_Units> | undefined
  ): Promise<CosmosUnsignedTransaction> {
    let fee: Amount<_Units>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<_Units> = await this.getTransactionFeeWithPublicKey(publicKey, details)
      fee = estimatedFee.medium
    }

    const units = (await this.getMetadata()).units
    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(units).value)

    const address: string = await this.getAddressFromPublicKey(publicKey)
    const nodeInfo: CosmosNodeInfo = await this.nodeClient.fetchNodeInfo()
    const account: CosmosAccount = await this.nodeClient.fetchAccount(address)
    const { total, transferable }: Balance<_Units> = await this.getBalanceOfPublicKey(publicKey)
    const balance: BigNumber = new BigNumber(newAmount(transferable ?? total).blockchain(units).value)

    if (
      balance.lt(
        details.reduce(
          (acc: BigNumber, next: TransactionDetails<_Units>) => acc.plus(newAmount(next.amount).blockchain(units).value),
          wrappedFee
        )
      )
    ) {
      throw new BalanceError(Domain.COSMOS, 'not enough balance')
    }

    const messages: CosmosSendMessage[] = []
    for (let i: number = 0; i < details.length; ++i) {
      const message: CosmosSendMessage = new CosmosSendMessage(address, details[i].to, [
        new CosmosCoin(this.options.baseUnit, newAmount(details[i].amount).blockchain(units).value)
      ])
      messages.push(message)
    }
    const memo: string = configuration?.arbitraryData ?? ''
    const transaction: CosmosTransaction = new CosmosTransaction(
      messages,
      new CosmosFee(
        [new CosmosCoin(this.options.baseUnit, wrappedFee.toString(10))],
        newAmount(this.options.defaultGas).blockchain(units).value
      ),
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

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const signature: string = await this.cryptoClient.signMessage(message, { privateKey: hexSecretKey.value })

    return newSignature(signature, 'hex')
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    const hexSignature: Signature = convertSignature(signature, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.verifyMessage(message, hexSignature.value, hexPublicKey.value)
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(keyPair.publicKey, 'hex')

    return this.cryptoClient.decryptAsymmetric(payload, {
      privateKey: hexSecretKey.value,
      publicKey: hexPublicKey.value
    })
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.encryptAsymmetric(payload, hexPublicKey.value)
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.encryptAES(payload, hexSecretKey.value)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.decryptAES(payload, hexSecretKey.value)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: CosmosTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<CosmosTransactionCursor, _Units, _Units>> {
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
    let result: AirGapTransaction<_Units>[] = []

    for (const transaction of allTransactions) {
      const timestamp = new Date(transaction.timestamp).getTime() / 1000
      const fee = transaction.tx.auth_info.fee.amount.reduce(
        (current, next) => (next.denom === this.options.baseUnit ? current.plus(new BigNumber(next.amount)) : current),
        new BigNumber(0)
      )

      result = result.concat(
        transaction.tx.body.messages.map((msg: any) => {
          const tx: Partial<AirGapTransaction<_Units>> = {
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

  public async getBalanceOfAddress(address: string, _configuration?: undefined): Promise<Balance<_Units>> {
    const metadata = await this.getMetadata()
    const { total, available } = await this.nodeClient.fetchBalance(address, this.options.baseUnit)

    return {
      total: newAmount(total).blockchain(metadata.units),
      transferable: newAmount(available).blockchain(metadata.units)
    }
  }

  // DELEGATION

  public async getDefaultDelegatee(): Promise<string> {
    const validators = await this.nodeClient.fetchValidators()

    return validators.length > 0 ? validators[0].operator_address : ''
  }

  public async getCurrentDelegateesForPublicKey(publicKey: PublicKey): Promise<string[]> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getCurrentDelegateesForAddress(address)
  }

  public async getCurrentDelegateesForAddress(address: string): Promise<string[]> {
    const delegations = await this.nodeClient.fetchDelegations(address)

    return delegations.map((delegation) => delegation.delegation.validator_address)
  }

  public async getDelegateeDetails(address: string): Promise<DelegateeDetails> {
    const validator = await this.nodeClient.fetchValidator(address)
    const statusCodes: Record<number, string> = { 0: 'jailed', 1: 'inactive', 2: 'active' }

    return {
      name: validator.description.moniker,
      status: statusCodes[validator.status],
      address: validator.operator_address
    }
  }

  public async isPublicKeyDelegating(publicKey: PublicKey): Promise<boolean> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.isAddressDelegating(address)
  }

  public async isAddressDelegating(address: string): Promise<boolean> {
    const delegations = await this.nodeClient.fetchDelegations(address)

    return delegations.length > 0
  }

  public async getDelegatorDetailsFromPublicKey(publicKey: PublicKey): Promise<DelegatorDetails> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegatorDetailsFromAddress(address)
  }

  public async getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails> {
    return this.getDelegatorDetails(address)
  }

  private async getDelegatorDetails(address: string, validator?: string): Promise<DelegatorDetails> {
    const results = await Promise.all([
      this.getBalanceOfAddress(address),
      this.nodeClient.fetchDelegations(address).catch(() => [] as CosmosDelegation[]),
      this.nodeClient.fetchRewardDetails(address).catch(() => [] as CosmosRewardDetails[])
    ])
    const metadata = await this.getMetadata()
    const totalBalance = newAmount(results[0].total).blockchain(metadata.units)
    const availableBalance = results[0].transferable ? newAmount(results[0].transferable).blockchain(metadata.units) : totalBalance
    const delegations = results[1]
    const rewardDetails = results[2]

    const unclaimedRewards = rewardDetails.map(
      (details) =>
        [
          details.validator_address,
          details.reward?.reduce((total, next) => total.plus(next.amount), new BigNumber(0)).decimalPlaces(0, BigNumber.ROUND_FLOOR) ??
            new BigNumber(0)
        ] as [string, BigNumber]
    )

    const unclaimedTotalRewards = unclaimedRewards.reduce((total, next) => total.plus(next[1]), new BigNumber(0))
    const unclaimedValidatorRewards = validator
      ? unclaimedRewards.find(([validatorAddress, _]) => validatorAddress === validator)?.[1] || new BigNumber(0)
      : undefined

    const isDelegating = validator
      ? delegations.some((delegation) => delegation.delegation.validator_address === validator)
      : delegations.length > 0
    const availableActions = await this.getAvailableDelegatorActions(
      isDelegating,
      new BigNumber(availableBalance.value),
      unclaimedTotalRewards,
      unclaimedValidatorRewards
    )

    return {
      address,
      balance: totalBalance.value,
      delegatees: delegations.map((delegation) => delegation.delegation.validator_address),
      availableActions
    }
  }

  private async getAvailableDelegatorActions(
    isDelegating: boolean,
    availableBalance: BigNumber,
    unclaimedTotalRewards: BigNumber,
    unclaimedDelegationRewards?: BigNumber
  ): Promise<DelegatorAction[]> {
    const actions: DelegatorAction[] = []
    const metadata = await this.getMetadata()
    const requiredFee = new BigNumber(metadata.fee?.defaults?.low.value ?? '0')
    const hasSufficientBalance = availableBalance.gt(requiredFee)

    if (hasSufficientBalance) {
      actions.push({
        type: CosmosDelegationActionType.DELEGATE,
        args: ['validator', 'amount']
      })
    }

    if (isDelegating) {
      actions.push({
        type: CosmosDelegationActionType.UNDELEGATE,
        args: ['validator', 'amount']
      })
    }

    if (unclaimedTotalRewards.gt(0)) {
      actions.push({
        type: CosmosDelegationActionType.WITHDRAW_ALL_REWARDS
      })
    }

    if (unclaimedDelegationRewards?.gt(0)) {
      actions.push({
        type: CosmosDelegationActionType.WITHDRAW_VALIDATOR_REWARDS,
        args: ['validator']
      })
    }

    return actions
  }

  public async getDelegationDetailsFromPublicKey(publicKey: PublicKey, delegatees: string[]): Promise<DelegationDetails> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegationDetailsFromAddress(address, delegatees)
  }

  public async getDelegationDetailsFromAddress(address: string, delegatees: string[]): Promise<DelegationDetails> {
    if (delegatees.length > 1) {
      return Promise.reject('Multiple validators for a single delegation are not supported.')
    }

    const validator = delegatees[0]
    const results = await Promise.all([this.getDelegatorDetails(address, validator), this.getDelegateeDetails(validator)])

    const delegatorDetails = results[0]
    const validatorDetails = results[1]

    return {
      delegator: delegatorDetails,
      delegatees: [validatorDetails]
    }
  }

  public async prepareDelegatorActionFromPublicKey(
    publicKey: PublicKey,
    type: CosmosDelegationActionType,
    data?: { validator: string; amount?: string } | undefined
  ): Promise<CosmosTransaction[]> {
    switch (type) {
      case CosmosDelegationActionType.DELEGATE:
        assertFields(`${type} action`, data, 'validator', 'amount')

        return [await this.delegate(publicKey, data!.validator, { value: data!.amount!, unit: 'blockchain' }, false)]
      case CosmosDelegationActionType.UNDELEGATE:
        assertFields(`${type} action`, data, 'validator', 'amount')

        return [await this.undelegate(publicKey, data!.validator, { value: data!.amount!, unit: 'blockchain' })]
      case CosmosDelegationActionType.WITHDRAW_ALL_REWARDS:
        return [await this.withdrawDelegationRewards(publicKey, [])]
      case CosmosDelegationActionType.WITHDRAW_VALIDATOR_REWARDS:
        assertFields(`${type} action`, data, 'validator')

        return [await this.withdrawDelegationRewards(publicKey, [data!.validator])]
      default:
        return Promise.reject(`Delegator action type ${type} is not supported.`)
    }
  }

  public async undelegate(
    publicKey: PublicKey,
    validatorAddress: string,
    amount: Amount<_Units>,
    memo?: string | undefined
  ): Promise<CosmosTransaction> {
    return this.delegate(publicKey, validatorAddress, amount, true, memo)
  }

  public async delegate(
    publicKey: PublicKey,
    validatorAddress: string | string[],
    amount: Amount<_Units>,
    undelegate: boolean,
    memo?: string | undefined
  ): Promise<CosmosTransaction> {
    const address: string = await this.getAddressFromPublicKey(publicKey)
    const nodeInfo: CosmosNodeInfo = await this.nodeClient.fetchNodeInfo()
    const account: CosmosAccount = await this.nodeClient.fetchAccount(address)
    const metadata = await this.getMetadata()
    const message: CosmosDelegateMessage = new CosmosDelegateMessage(
      address,
      Array.isArray(validatorAddress) ? validatorAddress[0] : validatorAddress,
      new CosmosCoin(this.options.baseUnit, newAmount(amount).blockchain(metadata.units).value),
      undelegate
    )

    return new CosmosTransaction(
      [message],
      new CosmosFee(
        [new CosmosCoin(this.options.baseUnit, newAmount(metadata.fee!.defaults!.low).blockchain(metadata.units).value)],
        newAmount(this.options.defaultGas).blockchain(metadata.units).value
      ),
      memo !== undefined ? memo : '',
      nodeInfo.network,
      account.value.account_number,
      account.value.sequence ?? '0'
    )
  }

  public async withdrawDelegationRewards(
    publicKey: PublicKey,
    _validatorAddresses: string[],
    memo?: string | undefined
  ): Promise<CosmosTransaction> {
    let validatorAddresses: string[]
    if (_validatorAddresses.length > 0) {
      validatorAddresses = _validatorAddresses
    } else {
      const address: string = await this.getAddressFromPublicKey(publicKey)
      const rewards = await this.nodeClient.fetchRewardDetails(address)
      const filteredRewards = rewards.filter((reward) =>
        reward.reward
          ? reward.reward
              .reduce((total, next) => total.plus(new BigNumber(next.amount)), new BigNumber(0))
              .decimalPlaces(0, BigNumber.ROUND_FLOOR)
              .gt(0)
          : false
      )
      validatorAddresses = filteredRewards.map((reward) => reward.validator_address)
    }

    const address: string = await this.getAddressFromPublicKey(publicKey)
    const nodeInfo: CosmosNodeInfo = await this.nodeClient.fetchNodeInfo()
    const account: CosmosAccount = await this.nodeClient.fetchAccount(address)
    const messages: CosmosWithdrawDelegationRewardMessage[] = validatorAddresses.map(
      (validatorAddress: string) => new CosmosWithdrawDelegationRewardMessage(address, validatorAddress)
    )
    const metadata = await this.getMetadata()

    return new CosmosTransaction(
      messages,
      new CosmosFee(
        [new CosmosCoin(this.options.baseUnit, newAmount(metadata.fee!.defaults!.low).blockchain(metadata.units).value)],
        newAmount(this.options.defaultGas).blockchain(metadata.units).value
      ),
      memo !== undefined ? memo : '',
      nodeInfo.network,
      account.value.account_number,
      account.value.sequence ?? '0'
    )
  }

  public async withdrawAllDelegationRewards(delegatorAddress: string, fee: Amount<_Units>, memo?: string | undefined): Promise<string> {
    const nodeInfo: CosmosNodeInfo = await this.nodeClient.fetchNodeInfo()
    const account: CosmosAccount = await this.nodeClient.fetchAccount(delegatorAddress)
    const metadata = await this.getMetadata()

    return this.nodeClient.withdrawAllDelegationRewards(
      delegatorAddress,
      nodeInfo.network,
      account.value.account_number,
      account.value.sequence ?? '0',
      new BigNumber(newAmount(this.options.defaultGas).blockchain(metadata.units).value),
      new BigNumber(newAmount(fee).blockchain(metadata.units).value),
      memo !== undefined ? memo : ''
    )
  }

  public async fetchTotalReward(delegatorAddress: string): Promise<Amount<_Units>> {
    return this.nodeClient.fetchTotalReward(delegatorAddress, this.options.baseUnit)
  }

  public async fetchRewardForDelegation(delegatorAddress: string, validatorAddress: string): Promise<Amount<_Units>> {
    return this.nodeClient.fetchRewardForDelegation(delegatorAddress, validatorAddress, this.options.baseUnit)
  }

  public async fetchDelegations(address: string): Promise<CosmosDelegation[]> {
    return this.nodeClient.fetchDelegations(address)
  }

  public async fetchTotalDelegatedAmount(address: string): Promise<Amount<_Units>> {
    return this.nodeClient.fetchTotalDelegatedAmount(address, this.options.baseUnit)
  }

  public async fetchValidator(address: string): Promise<CosmosValidator> {
    return this.nodeClient.fetchValidator(address)
  }

  public async fetchValidators(): Promise<CosmosValidator[]> {
    return this.nodeClient.fetchValidators()
  }

  public async fetchUnbondingDelegations(delegatorAddress: string): Promise<CosmosUnbondingDelegation[]> {
    return this.nodeClient.fetchUnbondingDelegations(delegatorAddress)
  }

  public async fetchTotalUnbondingAmount(address: string): Promise<Amount<_Units>> {
    return this.nodeClient.fetchTotalUnbondingAmount(address, this.options.baseUnit)
  }

  public async fetchSelfDelegation(address: string): Promise<CosmosDelegation> {
    return this.nodeClient.fetchSelfDelegation(address)
  }
}
