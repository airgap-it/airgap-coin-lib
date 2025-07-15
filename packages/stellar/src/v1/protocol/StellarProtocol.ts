import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import { NetworkError, UnsupportedError } from '@airgap/coinlib-core/errors'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newPublicKey,
  newSecretKey,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  TransactionFullConfiguration,
  TransactionDetails,
  AirGapTransactionsWithCursor,
  Amount,
  TransactionSimpleConfiguration,
  WalletConnectRequest,
  AirGapUIAlert
} from '@airgap/module-kit'
import {
  TransactionBuilder,
  Asset,
  Operation,
  BASE_FEE,
  Networks,
  Transaction,
  Keypair,
  Horizon,
  Memo,
  StrKey,
  LiquidityPoolAsset
} from '@stellar/stellar-sdk'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { StellarCryptoConfiguration } from '../types/crypto'
import {
  StellarAssetType,
  StellarProtocolNetwork,
  StellarProtocolOptions,
  StellarSigner,
  StellarThresholds,
  StellarTransactionType,
  StellarUnits
} from '../types/protocol'
import { StellarSignedTransaction, StellarTransactionCursor, StellarUnsignedTransaction } from '../types/transaction'
import { StellarAddress } from '../data/StellarAddress'

export interface StellarProtocol
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: StellarProtocolNetwork
      CryptoConfiguration: StellarCryptoConfiguration
      SignedTransaction: StellarSignedTransaction
      TransactionCursor: StellarTransactionCursor
      Units: StellarUnits
      FeeEstimation: FeeDefaults<StellarUnits>
      UnsignedTransaction: StellarUnsignedTransaction
    },
    'FetchDataForAddress',
    'WalletConnect',
    'Multisig'
  > {
  server: Horizon.Server
  options: StellarProtocolOptions
  getDetailsFromEncodedGenericTransaction(transaction: string): Promise<Transaction>
  getSigners(publicKey: PublicKey): Promise<StellarSigner[]>
  adjustSigner(
    masterPublicky: PublicKey,
    signerPublicKey: PublicKey,
    weight: number,
    lowThreshold: number,
    medThreshold: number,
    highThreshold: number
  ): Promise<StellarUnsignedTransaction>
  getThresholds(publicKey: PublicKey): Promise<StellarThresholds>
  getThresholdReachedStatus(transaction: string): Promise<{ thresholdRequired: number; currentThreshold: number }>
}

export class StellarProtocolImpl implements StellarProtocol {
  public readonly options: StellarProtocolOptions
  public readonly server: Horizon.Server

  public constructor(options: RecursivePartial<StellarProtocolOptions> = {}) {
    this.options = createStellarProtocolOptions(options.network as Partial<StellarProtocolNetwork>)
    this.server = new Horizon.Server(this.options.network.rpcUrl)
  }

  public async getMultisigStatus(publicKey: PublicKey): Promise<boolean> {
    const address = await this.getAddressFromPublicKey(publicKey)

    try {
      const account = await this.server.loadAccount(address)

      return account.signers.length > 1
    } catch (error) {
      return false
    }
  }

  public async getSigners(publicKey: PublicKey): Promise<StellarSigner[]> {
    const address = await this.getAddressFromPublicKey(publicKey)

    try {
      const account = await this.server.loadAccount(address)

      return account.signers
    } catch (error) {
      throw new NetworkError(Domain.STELLAR, error)
    }
  }

  public async getThresholds(publicKey: PublicKey): Promise<StellarThresholds> {
    const address = await this.getAddressFromPublicKey(publicKey)

    try {
      const account = await this.server.loadAccount(address)

      return account.thresholds
    } catch (error) {
      throw new NetworkError(Domain.STELLAR, error)
    }
  }

  public async getThresholdReachedStatus(transaction: string): Promise<{ thresholdRequired: number; currentThreshold: number }> {
    try {
      const tx = TransactionBuilder.fromXDR(transaction, Networks.PUBLIC) as Transaction

      const sourceAccountId = tx.source

      const account = await this.server.loadAccount(sourceAccountId)

      const signers = account.signers

      const thresholds = account.thresholds

      const requiredThreshold = tx.operations.some((op) => ['setOptions', 'accountMerge'].includes(op.type))
        ? thresholds.high_threshold
        : tx.operations.some((op) =>
              [
                'createAccount',
                'payment',
                'pathPaymentStrictReceive',
                'pathPaymentStrictSend',
                'manageSellOffer',
                'manageBuyOffer',
                'createPassiveSellOffer',
                'changeTrust',
                'manageData',
                'createClaimableBalance',
                'beginSponsoringFutureReserves',
                'endSponsoringFutureReserves',
                'revokeSponsorship',
                'clawback',
                'clawbackClaimableBalance',
                'liquidityPoolDeposit',
                'liquidityPoolWithdraw',
                'invokeHostFunction',
                'extendFootprintTtl',
                'restoreFootprint'
              ].includes(op.type)
            )
          ? thresholds.med_threshold
          : thresholds.low_threshold

      let totalWeight = 0

      for (const sig of tx.signatures) {
        for (const signer of signers) {
          const keypair = Keypair.fromPublicKey(signer.key)
          const hint = keypair.signatureHint()
          if (hint.equals(sig.hint())) {
            totalWeight += signer.weight
          }
        }
      }

      const threshold = {
        thresholdRequired: requiredThreshold,
        currentThreshold: totalWeight
      }

      return threshold
    } catch (error) {
      return {
        thresholdRequired: 0,
        currentThreshold: 0
      }
    }
  }

  public async adjustSigner(
    masterPublicky: PublicKey,
    signerPublicKey: PublicKey,
    weight: number,
    lowThreshold: number,
    medThreshold: number,
    highThreshold: number
  ): Promise<StellarUnsignedTransaction> {
    const masterAddress = await this.getAddressFromPublicKey(masterPublicky)
    const signerAddress = await this.getAddressFromPublicKey(signerPublicKey)

    const account = await this.server.loadAccount(masterAddress)
    const signers = account.signers

    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.PUBLIC
    })

    if (signers.length === 1) {
      const masterWeight = weight
      txBuilder
        .addOperation(
          Operation.setOptions({
            masterWeight,
            lowThreshold,
            medThreshold,
            highThreshold,
            signer: {
              ed25519PublicKey: signerAddress,
              weight
            }
          })
        )
        .setTimeout(600)
    } else {
      txBuilder
        .addOperation(
          Operation.setOptions({
            lowThreshold,
            medThreshold,
            highThreshold,
            signer: {
              ed25519PublicKey: signerAddress,
              weight
            }
          })
        )
        .setTimeout(600)
    }

    return newUnsignedTransaction<StellarUnsignedTransaction>({
      transaction: txBuilder.build().toXDR()
    })
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: StellarTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<StellarTransactionCursor, StellarUnits>> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: Address,
    limit: number,
    cursor?: StellarTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<StellarTransactionCursor, StellarUnits>> {
    try {
      const endpoint = cursor?.next ?? `/accounts/${address}/payments?limit=${limit}&order=desc&join=transactions`
      const url = `${this.options.network.rpcUrl}${endpoint}`

      const response = await axios.get(url)
      const data = response.data
      const paymentTransactions = data._embedded?.records ?? []

      const transactions: AirGapTransaction<StellarUnits>[] = paymentTransactions
        .filter(
          (tx: any) =>
            (tx.type === StellarTransactionType.PAYMENT && tx.asset_type === StellarAssetType.NATIVE) || tx.type === 'create_account'
        )
        .map((tx: any) => {
          const txData = tx.transaction
          const isPayment = tx.type === StellarTransactionType.PAYMENT
          const txAmount = isPayment ? tx.amount : tx.starting_balance
          const amount = new BigNumber(txAmount).multipliedBy(1e7).toString()
          const from = isPayment ? tx.from : tx.funder
          const to = isPayment ? tx.to : tx.account
          const isInbound = to.toLowerCase() === address.toLowerCase()

          return {
            from: [from],
            to: [to],
            isInbound,
            amount: newAmount(amount, 'blockchain'),
            fee: newAmount(txData.fee_charged, 'blockchain'),
            network: this.options.network,
            timestamp: Math.floor(new Date(tx.created_at).getTime() / 1000),
            status: {
              type: tx.transaction_successful ? 'applied' : 'failed',
              hash: tx.transaction_hash,
              block: txData.ledger.toString()
            },
            arbitraryData: txData.memo
          }
        })

      return {
        transactions,
        cursor: {
          hasNext: data._links?.next?.href !== undefined,
          next: data._links?.next?.href?.replace(this.options.network.rpcUrl, '') ?? undefined
        }
      }
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return {
          transactions: [],
          cursor: {
            hasNext: false,
            next: ''
          }
        }
      }
      throw new NetworkError(Domain.STELLAR, error)
    }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: Address[],
    configuration?: TransactionFullConfiguration<StellarUnits>
  ): Promise<Amount<StellarUnits>> {
    try {
      const balance = await this.getBalanceOfPublicKey(publicKey)
      const balanceBn = new BigNumber(balance.total.value || '0')

      let fee: BigNumber
      if (configuration?.fee !== undefined) {
        fee = new BigNumber(newAmount(configuration.fee).blockchain(this.units).value)
      } else {
        fee = new BigNumber(BASE_FEE).multipliedBy(to.length).dividedBy(1e7)
      }

      if (fee.gte(balanceBn)) {
        return newAmount(0, 'blockchain')
      }

      let amountWithoutFees = balanceBn.minus(fee)

      return newAmount(amountWithoutFees, 'blockchain')
    } catch (error) {
      throw new NetworkError(Domain.STELLAR, error)
    }
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<StellarUnits>[],
    configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<StellarUnits>> {
    return this.feeDefaults
  }

  private readonly units: ProtocolUnitsMetadata<StellarUnits> = {
    XLM: {
      symbol: { value: 'XLM', market: 'xlm' },
      decimals: 7
    }
  }

  private readonly feeDefaults: FeeDefaults<StellarUnits> = {
    low: newAmount(BASE_FEE, 'blockchain'),
    medium: newAmount(BASE_FEE, 'blockchain'),
    high: newAmount(BASE_FEE, 'blockchain')
  }

  private readonly metadata: ProtocolMetadata<StellarUnits> = {
    identifier: MainProtocolSymbols.STELLAR,
    name: 'Stellar',
    units: this.units,
    mainUnit: 'XLM',
    fee: {
      defaults: this.feeDefaults,
      mainUnit: 'XLM',
      units: {
        XLM: {
          symbol: {
            value: 'XLM',
            market: 'xlm'
          },
          decimals: 7
        }
      }
    },
    account: {
      standardDerivationPath: `m/44h/148h/0h`,
      address: {
        isCaseSensitive: false,
        placeholder: 'GABC...',
        regex: '^G[0-9A-Z]{55}$'
      }
    },
    transaction: {
      arbitraryData: {
        inner: { name: 'memo' }
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<StellarUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return StellarAddress.from(publicKey).asString()
  }

  public async getDetailsFromTransaction(
    transaction: StellarSignedTransaction | StellarUnsignedTransaction,
    _publicKey: PublicKey
  ): Promise<AirGapTransaction<StellarUnits>[]> {
    switch (transaction.type) {
      case 'signed':
      case 'unsigned':
        return this.getDetailsFromEncodedTransaction(transaction.transaction, _publicKey)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.STELLAR, 'Unsupported transaction type.')
    }
  }

  public async getDetailsFromEncodedGenericTransaction(transaction: string): Promise<Transaction> {
    return TransactionBuilder.fromXDR(transaction, Networks.PUBLIC) as Transaction
  }

  private async getDetailsFromEncodedTransaction(transaction: string, publicKey: any): Promise<AirGapTransaction<StellarUnits>[]> {
    const transactions: AirGapTransaction<StellarUnits>[] = []

    const tx = TransactionBuilder.fromXDR(transaction, Networks.PUBLIC) as Transaction

    for (const txDetails of tx.operations) {
      let amount: string
      let op:
        | Operation.Payment
        | Operation.CreateAccount
        | Operation.ChangeTrust
        | Operation.InvokeHostFunction
        | Operation.PathPaymentStrictReceive
        | Operation.PathPaymentStrictSend
        | Operation.LiquidityPoolDeposit
        | Operation.LiquidityPoolWithdraw
        | Operation.SetOptions

      let to: string[]
      let fee: string
      let isInbound
      let type: string | undefined
      let uiAlerts: AirGapUIAlert[] = []
      let displayFromTo: boolean = true

      if (txDetails.type === StellarTransactionType.PAYMENT) {
        op = txDetails as Operation.Payment

        if (op.asset.code === StellarAssetType.XLM) {
          amount = new BigNumber(op.amount).multipliedBy(1e7).toString()
        } else {
          uiAlerts.push({
            type: 'warning',
            title: { value: StellarTransactionType.PAYMENT, type: 'plain' },
            description: {
              value: `${op.amount} ${op.asset.code} will be deducted from the source wallet`,
              type: 'plain'
            }
          })

          amount = new BigNumber(0).multipliedBy(1e7).toString()
        }

        fee = tx.fee
        to = [op.destination]
        type = StellarTransactionType.PAYMENT
        isInbound = to[0].toLowerCase() === publicKey.value.toLowerCase()
      } else if (txDetails.type === StellarTransactionType.CREATE_ACCOUNT) {
        op = txDetails as Operation.CreateAccount
        amount = new BigNumber(op.startingBalance).multipliedBy(1e7).toString()
        to = [op.destination]
        fee = tx.fee
        isInbound = to[0].toLowerCase() === publicKey.value.toLowerCase()
        type = StellarTransactionType.CREATE_ACCOUNT
      } else if (txDetails.type === StellarTransactionType.CHANGE_TRUST) {
        op = txDetails as Operation.ChangeTrust

        amount = new BigNumber(0).toString()

        if (op.line instanceof Asset) {
          const asetType = op.line as Asset

          to = [asetType.getIssuer()]
        } else if (op.line instanceof LiquidityPoolAsset) {
          const asetType = op.line as LiquidityPoolAsset

          to = [asetType.assetA.getIssuer() ?? StellarAssetType.NATIVE, asetType.assetB.getIssuer() ?? StellarAssetType.NATIVE]
        } else {
          to = [tx.source]
        }

        fee = new BigNumber(tx.fee).dividedBy(tx.operations.length).toString()
        isInbound = false
        type = StellarTransactionType.CHANGE_TRUST
      } else if (txDetails.type === StellarTransactionType.INOKE_HOST_FUNCTION) {
        isInbound = false
        op = txDetails as Operation.InvokeHostFunction
        fee = tx.fee
        const cont = op.func.value() as any

        amount = new BigNumber(0).toString()

        try {
          Buffer.from(cont.contractAddress().value(), 'hex')
          const contractAddress = StrKey.encodeContract(Buffer.from(cont.contractAddress().value(), 'hex'))
          to = [contractAddress]
        } catch (error) {
          to = [tx.source]
        }

        type = StellarTransactionType.INOKE_HOST_FUNCTION

        displayFromTo = false

        uiAlerts.push({
          type: 'warning',
          title: { value: StellarTransactionType.INOKE_HOST_FUNCTION, type: 'plain' },
          description: {
            value: `Transaction ${txDetails.type} type was not decoded. Please understand what you are signing before proceeding.`,
            type: 'plain'
          }
        })
      } else if (txDetails.type === StellarTransactionType.PATH_PAYMENT_RECIEVE) {
        op = txDetails as Operation.PathPaymentStrictReceive
        fee = tx.fee
        const sendAssetIsNative = op.sendAsset.isNative()

        amount = new BigNumber(sendAssetIsNative ? op.sendMax : 0).multipliedBy(1e7).toString()

        to = [txDetails.destination]

        isInbound = false

        type = StellarTransactionType.PATH_PAYMENT_RECIEVE

        if (!sendAssetIsNative) {
          uiAlerts.push({
            type: 'warning',
            title: { value: StellarTransactionType.PATH_PAYMENT_SEND, type: 'plain' },
            description: {
              value: `Maximum of ${op.sendMax} ${op.sendAsset} will be deducted from the source wallet`,
              type: 'plain'
            }
          })
        } else {
          uiAlerts.push({
            type: 'info',
            title: { value: StellarTransactionType.PATH_PAYMENT_SEND, type: 'plain' },
            description: {
              value: `${op.destAmount} ${op.destAsset} will added to your wallet`,
              type: 'plain'
            }
          })
        }
      } else if (txDetails.type === StellarTransactionType.PATH_PAYMENT_SEND) {
        op = txDetails as Operation.PathPaymentStrictSend
        fee = tx.fee
        const sendAssetIsNative = op.sendAsset.isNative()
        amount = new BigNumber(sendAssetIsNative ? op.sendAmount : 0).multipliedBy(1e7).toString()
        to = [txDetails.destination]
        isInbound = false
        type = StellarTransactionType.PATH_PAYMENT_SEND

        if (!sendAssetIsNative) {
          uiAlerts.push({
            type: 'warning',
            title: { value: StellarTransactionType.PATH_PAYMENT_SEND, type: 'plain' },
            description: {
              value: `${op.sendAmount} ${op.sendAsset} will be deducted from the source wallet`,
              type: 'plain'
            }
          })
        } else {
          uiAlerts.push({
            type: 'info',
            title: { value: StellarTransactionType.PATH_PAYMENT_SEND, type: 'plain' },
            description: {
              value: `Minimum of ${op.destMin} ${op.destAsset} will added to your wallet`,
              type: 'plain'
            }
          })
        }
      } else if (txDetails.type === StellarTransactionType.LIQUIDITY_POOL_DEPOSIT) {
        amount = new BigNumber(0).toString()

        op = txDetails as Operation.LiquidityPoolDeposit

        fee = tx.fee

        to = [op.liquidityPoolId]

        uiAlerts.push({
          type: 'warning',
          title: { value: StellarTransactionType.LIQUIDITY_POOL_DEPOSIT, type: 'plain' },
          description: {
            value: `Transaction is not fully decoded`,
            type: 'plain'
          }
        })

        uiAlerts.push({
          type: 'warning',
          title: { value: StellarTransactionType.LIQUIDITY_POOL_DEPOSIT, type: 'plain' },
          description: {
            value: `${op.maxAmountA} & ${op.maxAmountB} of two different assets will be deducted from the source wallet`,
            type: 'plain'
          }
        })

        type = StellarTransactionType.LIQUIDITY_POOL_DEPOSIT
      } else if (txDetails.type === StellarTransactionType.LIQUIDITY_POOL_WITHDRAW) {
        amount = new BigNumber(0).toString()

        op = txDetails as Operation.LiquidityPoolWithdraw

        fee = tx.fee

        to = [op.liquidityPoolId]

        uiAlerts.push({
          type: 'info',
          title: { value: StellarTransactionType.LIQUIDITY_POOL_WITHDRAW, type: 'plain' },
          description: {
            value: `${op.minAmountA} & ${op.minAmountB} of two different assets will be added to your wallet`,
            type: 'plain'
          }
        })

        type = StellarTransactionType.LIQUIDITY_POOL_WITHDRAW
      } else if (txDetails.type === StellarTransactionType.SET_OPTIONS) {
        op = txDetails as Operation.SetOptions

        fee = tx.fee

        const signer = op.signer

        if ('ed25519PublicKey' in signer && signer.ed25519PublicKey) {
          to = [signer.ed25519PublicKey]
        } else if ('ed25519SignedPayload' in signer && signer.ed25519SignedPayload) {
          to = [signer.ed25519SignedPayload]
        } else if ('preAuthTx' in signer && signer.preAuthTx) {
          to = [signer.preAuthTx.toString('hex')]
        } else if ('sha256Hash' in signer && signer.sha256Hash) {
          to = [signer.sha256Hash.toString('hex')]
        } else {
          to = [tx.source]
        }

        const descriptionParts = [
          to[0] && `Signer: ${to[0]}`,
          op.masterWeight !== undefined && `MasterWeight: ${op.masterWeight}`,
          op.lowThreshold !== undefined && `LowThreshold: ${op.lowThreshold}`,
          op.medThreshold !== undefined && `MedThreshold: ${op.medThreshold}`,
          op.highThreshold !== undefined && `HighThreshold: ${op.highThreshold}`
        ]
          .filter(Boolean)
          .join('\n')

        uiAlerts.push({
          type: 'info',
          title: { value: StellarTransactionType.SET_OPTIONS, type: 'plain' },
          description: {
            value: `You are setting the following parameters:\n${descriptionParts}`,
            type: 'plain'
          }
        })

        amount = new BigNumber(0).toString()

        type = StellarTransactionType.SET_OPTIONS
      } else {
        to = [tx.source]
        fee = tx.fee
        amount = new BigNumber(0).toString()
        isInbound = false
        type = txDetails.type

        uiAlerts.push({
          type: 'warning',
          title: { value: txDetails.type, type: 'plain' },
          description: {
            value: `Transaction ${txDetails.type} type was not decoded. Please understand what you are signing before proceeding.`,
            type: 'plain'
          }
        })

        displayFromTo = false
      }

      const memo =
        tx.memo.type === 'text' || tx.memo.type === 'id'
          ? tx.memo.value?.toString()
          : tx.memo.type === 'hash' || tx.memo.type === 'return'
            ? tx.memo.value?.toString('hex')
            : undefined

      transactions.push({
        from: [tx.source],
        to,
        isInbound,
        amount: newAmount(amount, 'blockchain'),
        fee: newAmount(fee, 'blockchain'),
        network: this.options.network,
        arbitraryData: memo,
        type,
        uiAlerts,
        json: JSON.stringify(tx),
        displayFromTo
      })
    }

    return transactions
  }

  private readonly cryptoConfiguration: StellarCryptoConfiguration = {
    algorithm: 'ed25519'
  }

  public async getCryptoConfiguration(): Promise<StellarCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return {
      secretKey: newSecretKey(derivative.secretKey, 'hex'),
      publicKey: newPublicKey(derivative.publicKey, 'hex')
    }
  }

  public async signTransactionWithSecretKey(
    transaction: StellarUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<StellarSignedTransaction> {
    const tx = TransactionBuilder.fromXDR(transaction.transaction, Networks.PUBLIC) as Transaction

    tx.sign(Keypair.fromSecret(StrKey.encodeEd25519SecretSeed(Buffer.from(secretKey.value, 'hex'))))
    return newSignedTransaction<StellarSignedTransaction>({
      transaction: tx.toXDR()
    })
  }

  public async getNetwork(): Promise<StellarProtocolNetwork> {
    return this.options.network
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<StellarUnits>> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<StellarUnits>> {
    try {
      const { data } = await axios.get(`${this.options.network.rpcUrl}/accounts/${address}`)
      const balance = data.balances.find((b: any) => b.asset_type === StellarAssetType.NATIVE)
      const btnBalance = new BigNumber(balance.balance).multipliedBy(1e7).toString()

      return {
        total: newAmount(btnBalance, 'blockchain')
      }
    } catch (error) {
      return { total: newAmount('0', 'blockchain') }
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<StellarUnits>[],
    configuration?: TransactionFullConfiguration<StellarUnits>
  ): Promise<StellarUnsignedTransaction> {
    const address = await this.getAddressFromPublicKey(publicKey)

    const account = await this.server.loadAccount(address)

    const fee = configuration?.fee !== undefined ? configuration?.fee?.value : BASE_FEE

    const txBuilder = new TransactionBuilder(account, {
      fee,
      networkPassphrase: Networks.PUBLIC
    })

    for (const detail of details) {
      let destinationExists = true
      try {
        await this.server.loadAccount(detail.to)
      } catch (e) {
        if (e.response?.status === 404) {
          destinationExists = false
        } else {
          throw e
        }
      }

      const amount = new BigNumber(detail.amount.value).dividedBy(1e7).toString()

      if (destinationExists) {
        txBuilder.addOperation(
          Operation.payment({
            destination: detail.to,
            asset: Asset.native(),
            amount
          })
        )
      } else {
        txBuilder.addOperation(
          Operation.createAccount({
            destination: detail.to,
            startingBalance: amount
          })
        )
      }
    }
    if (configuration?.arbitraryData) {
      const memo = configuration?.arbitraryData

      txBuilder.addMemo(Memo.id(memo))
    }

    const tx = txBuilder.setTimeout(600).build()

    return newUnsignedTransaction<StellarUnsignedTransaction>({
      transaction: tx.toXDR()
    })
  }

  public async broadcastTransaction(transaction: StellarSignedTransaction): Promise<string> {
    const params = new URLSearchParams()
    params.append('tx', transaction.transaction)

    const { data } = await axios.post(`${this.options.network.rpcUrl}/transactions`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data.hash
  }

  public async getWalletConnectChain(): Promise<string> {
    const chain = this.options.network.type === 'mainnet' ? 'pubnet' : 'testnet'
    return `stellar:${chain}`
  }

  public async prepareWalletConnectTransactionWithPublicKey(
    publicKey: PublicKey,
    request: WalletConnectRequest
  ): Promise<StellarUnsignedTransaction> {
    const sourceAddress = await this.getAddressFromPublicKey(publicKey)
    const sourceAccount = await this.server.loadAccount(sourceAddress)

    const destination = request.to ?? ''
    const value = request.value ?? '0'
    const amount = new BigNumber(value).dividedBy(1e7).toString() // convert from stroops to XLM
    const fee = BASE_FEE

    const txBuilder = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase: Networks.PUBLIC
    })

    txBuilder.addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount
      })
    )

    if (request.data) {
      txBuilder.addMemo(Memo.id(request.data.toString()))
    }

    const tx = txBuilder.setTimeout(600).build()

    return newUnsignedTransaction<StellarUnsignedTransaction>({
      transaction: tx.toXDR()
    })
  }
}

export function createStellarProtocol(options: RecursivePartial<StellarProtocolOptions> = {}): StellarProtocol {
  return new StellarProtocolImpl(options)
}

export const STELLAR_MAINNET_PROTOCOL_NETWORK: StellarProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://horizon.stellar.org',
  blockExplorerUrl: 'https://stellar.expert/explorer/public'
}

const DEFAULT_STELLAR_PROTOCOL_NETWORK: StellarProtocolNetwork = STELLAR_MAINNET_PROTOCOL_NETWORK

export function createStellarProtocolOptions(network: Partial<StellarProtocolNetwork> = {}): StellarProtocolOptions {
  return {
    network: { ...DEFAULT_STELLAR_PROTOCOL_NETWORK, ...network }
  }
}
