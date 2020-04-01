
import { FeeDefaults, CurrencyUnit } from '../ICoinProtocol'
import { ICoinDelegateProtocol, DelegatorDetails, DelegateeDetails } from '../ICoinDelegateProtocol'
import { NonExtendedProtocol } from '../NonExtendedProtocol'
import { PolkadotNodeClient } from './node/PolkadotNodeClient'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../..'
import { PolkadotTransactionType } from './data/transaction/PolkadotTransaction'
import { UnsignedPolkadotTransaction } from '../../serializer/schemas/definitions/transaction-sign-request-polkadot'
import { SignedPolkadotTransaction } from '../../serializer/schemas/definitions/transaction-sign-response-polkadot'
import { PolkadotPayee } from './data/staking/PolkadotPayee'
import { isString } from 'util'
import { RawPolkadotTransaction } from '../../serializer/types'
import { PolkadotAccountController } from './PolkadotAccountController'
import { PolkadotTransactionController } from './PolkadotTransactionController'
import { PolkadotBlockExplorerClient } from './blockexplorer/PolkadotBlockExplorerClient'
import { PolkadotStakingActionType } from './data/staking/PolkadotStakingActionType'
import { PolkadotAddress } from './data/account/PolkadotAddress'

const BLOCK_EXPLORER_URL = 'https://polkascan.io/pre/kusama'
const BLOCK_EXPLORER_API = 'https://api-01.polkascan.io/kusama/api/v1'

export class PolkadotProtocol extends NonExtendedProtocol implements ICoinDelegateProtocol {    
    public symbol: string = 'DOT'
    public name: string = 'Polkadot'
    public marketSymbol: string = 'DOT'
    public feeSymbol: string = 'DOT'

    public decimals: number = 12;
    public feeDecimals: number = 12;
    public identifier: string = 'polkadot';

    // TODO: set better values
    public feeDefaults: FeeDefaults = {
        low: '0.01', // 10 000 000 000
        medium: '0.01',
        high: '0.01'
    }

    public units: CurrencyUnit[] = [
        {
            unitSymbol: 'DOT',
            factor: '1'
        },
        {
            unitSymbol: 'mDOT',
            factor: '0.001'
        },
        {
            unitSymbol: 'uDOT',
            factor: '0.000001'
        },
        {
            unitSymbol: 'Point',
            factor: '0.000000001'
        },
        {
            unitSymbol: 'Planck',
            factor: '0.000000000001'
        }
    ]

    public supportsHD: boolean = false
    public standardDerivationPath: string = `m/44'/354'/0'/0/0` // TODO: verify

    public addressIsCaseSensitive: boolean = false
    public addressValidationPattern: string = '^[a-km-zA-HJ-NP-Z1-9]+$' // TODO: set length?
    public addressPlaceholder: string = 'ABC...' // TODO: better placeholder?

    public blockExplorer: string = BLOCK_EXPLORER_URL

    constructor(
        readonly nodeClient: PolkadotNodeClient = new PolkadotNodeClient('https://polkadot-kusama-node-1.kubernetes.papers.tech'),
        readonly blockExplorerClient: PolkadotBlockExplorerClient = new PolkadotBlockExplorerClient(BLOCK_EXPLORER_URL, BLOCK_EXPLORER_API),
        readonly accountController: PolkadotAccountController = new PolkadotAccountController(nodeClient),
        readonly transactionController: PolkadotTransactionController = new PolkadotTransactionController(nodeClient)
    ) { super() }

    public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
        return `${this.blockExplorerClient.accountInfoUrl}/${address}`
    }

    public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
        return `${this.blockExplorerClient.transactionInfoUrl}/${txId}`
    }

    public async getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
        const keyPair = await this.accountController.createKeyPairFromMnemonic(mnemonic, derivationPath, password)
        return keyPair.publicKey.toString('hex')
    }
    
    public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer> {
        const keyPair = await this.accountController.createKeyPairFromMnemonic(mnemonic, derivationPath, password)
        return keyPair.privateKey
    }

    public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
        const keyPair = await this.accountController.createKeyPairFromHexSecret(secret, derivationPath)
        return keyPair.publicKey.toString('hex')
    }

    public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer> {
        const keyPair = await this.accountController.createKeyPairFromHexSecret(secret, derivationPath)
        return keyPair.privateKey
    }

    public async getAddressFromPublicKey(publicKey: string): Promise<string> {
        return this.accountController.createAddressFromPublicKey(publicKey)
    }
    
    public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
        return [await this.getAddressFromPublicKey(publicKey)]
    }
    
    public async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
        const addresses = await this.getAddressesFromPublicKey(publicKey)
        return this.getTransactionsFromAddresses(addresses, limit, offset)
    }
    
    public async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
        const pageNumber = Math.ceil(offset / limit) + 1
        const txs = await Promise.all(addresses.map(address => this.blockExplorerClient.getTransactions(address, limit, pageNumber)))

        return txs
            .reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
            .map(tx => ({
                protocolIdentifier: this.identifier,
                from: [],
                to: [],
                isInbound: false,
                amount: '',
                fee: '',
                ...tx
            }))
    }
    
    public async signWithPrivateKey(privateKey: Buffer, rawTransaction: RawPolkadotTransaction): Promise<string> {
        const txs = this.transactionController.decodeDetails(rawTransaction.encoded)
        const signed = await Promise.all(txs.map(tx => this.transactionController.signTransaction(privateKey, tx.transaction, tx.payload)))

        txs.forEach((tx, index) => tx.transaction = signed[index])

        return this.transactionController.encodeDetails(txs)
    }
    
    public async getTransactionDetails(transaction: UnsignedPolkadotTransaction): Promise<IAirGapTransaction[]> {
        return this.getTransactionDetailsFromEncoded(transaction.transaction.encoded)
    }
    
    public async getTransactionDetailsFromSigned(transaction: SignedPolkadotTransaction): Promise<IAirGapTransaction[]> {
        return this.getTransactionDetailsFromEncoded(transaction.transaction)
    }

    public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
        const balances = await Promise.all(addresses.map(address => this.accountController.getBalance(address)))
        const balance = balances.reduce((current: BigNumber, next: BigNumber) => current.plus(next))

        return balance.toString(10)
    }

    public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
        return this.getBalanceOfAddresses([await this.getAddressFromPublicKey(publicKey)])        
    }

    public async getTransferFeeEstimate(publicKey: string, destination: string, value: string, tip: string = '0'): Promise<string> {
        const transaction = await this.transactionController.createTransaction(
            PolkadotTransactionType.TRANSFER, 
            publicKey, 
            tip,
            { 
                to: destination.length > 0 ? destination : publicKey,
                value: new BigNumber(value) 
            }
        )
        const fee = await this.transactionController.calculateTransactionFee(transaction)

        if (!fee) {
            return Promise.reject('Could not fetch all necessary data.')
        }

        return fee.toString(10)
    }

    public async estimateMaxTransactionValueFromPublicKey(publicKey: string, fee: string): Promise<string> {
        const results = await Promise.all([
            this.accountController.getTransferableBalance(publicKey),
            this.getFutureRequiredTransactions(publicKey, 'check'),
        ])

        const transferableBalance = results[0]
        const futureTransactions = results[1]
        
        const feeEstimate = await this.transactionController.estimateTransactionFees(futureTransactions)

        if (!feeEstimate) {
            return Promise.reject('Could not estimate max value.')
        }

        let maxAmount = transferableBalance
            .minus(feeEstimate)
            .minus(new BigNumber(fee))

        if (maxAmount.lt(0)) {
            maxAmount = new BigNumber(0)
        }

        return maxAmount.toFixed()
      }

    public async prepareTransactionFromPublicKey(
        publicKey: string, 
        recipients: string[], 
        values: string[], 
        fee: string, 
        data?: any
    ): Promise<RawPolkadotTransaction> {
        if (recipients.length !== values.length) {
            return Promise.reject("Recipients length doesn't match values length.")
        }

        const recipientsWithValues: [string, string][] = recipients.map((recipient, index) => [recipient, values[index]])

        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)
        const totalValue = values.map(value => new BigNumber(value)).reduce((total, next) => total.plus(next), new BigNumber(0))
        const available = new BigNumber(transferableBalance).minus(totalValue)

        const encoded = await this.transactionController.prepareSubmittableTransactions(
            publicKey,
            available,
            recipientsWithValues.map(([recipient, value]) => ({
                type: PolkadotTransactionType.TRANSFER,
                tip: 0, // temporary, until we handle Polkadot fee/tip model
                args: {
                    to: recipient,
                    value: new BigNumber(value)
                }
            }))
        )

        return { encoded }
    }

    public async broadcastTransaction(encoded: string): Promise<string> {
        const txs = this.transactionController.decodeDetails(encoded).map(tx => tx.transaction)

        try {
            const txHashes = await Promise.all(
                txs.map((tx, index) => this.nodeClient.submitTransaction(tx.encode()).catch(error => {
                    error.index = index
                    throw error
                }))
            )
            return txHashes[0]
        } catch (error) {
            console.warn(`Transaction #${error.index} submit failure`, error)
            return Promise.reject(`Error while submitting transaction #${error.index}: ${PolkadotTransactionType[txs[error.index].type]}.`)
        }
    }

    public async getDefaultDelegatee(): Promise<string> {
        const validators = await this.nodeClient.getValidators()
        return validators ? validators[0].toString() : ''
    }

    public async getCurrentDelegateesForPublicKey(publicKey: string): Promise<string[]> {
        return this.accountController.getCurrentValidators(publicKey)
    }

    public async getCurrentDelegateesForAddress(address: string): Promise<string[]> {
        return this.accountController.getCurrentValidators(address)
    }

    public async getDelegateesDetails(addresses: string[]): Promise<DelegateeDetails[]> {
        return Promise.all(addresses.map(async address => {
            const validatorDetails = await this.accountController.getValidatorDetails(address)
            return {
                name: validatorDetails.name || '',
                address
            }
        }))
    }

    public async isPublicKeyDelegating(publicKey: string): Promise<boolean> {
        return this.accountController.isNominating(publicKey)
    }

    public async isAddressDelegating(address: string): Promise<boolean> {
        return this.accountController.isNominating(address)
    }

    public async getDelegatorDetailsFromPublicKey(publicKey: string): Promise<DelegatorDetails> {
        return this.getDelegatorDetailsFromAddress(await this.getAddressFromPublicKey(publicKey))
    }

    public async getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails> {
        const nominatorDetails = await this.accountController.getNominatorDetails(address)

        return {
            balance: nominatorDetails.balance,
            isDelegating: nominatorDetails.isDelegating,
            availableActions: nominatorDetails.availableActions
        }
    }

    public async prepareDelegatorActionFromPublicKey(
        publicKey: string, 
        type: PolkadotStakingActionType, 
        data?: any
    ): Promise<RawPolkadotTransaction[]> {
        if (!data) {
            data = {}
        }

        const assertFields = (...fields: string[]) => {
            fields.forEach(field => {
                if (data[field] === undefined || data[field] === null) {
                    throw new Error(`Invalid arguments passed for ${PolkadotStakingActionType[type]} action. Required: ${fields.join()}, but ${field} is missing.`)
                }
            })
        }

        switch (type) {
            case PolkadotStakingActionType.BOND_NOMINATE:
                assertFields('targets', 'value', 'payee')
                return this.prepareDelegation(publicKey, data.tip || 0, data.targets, data.controller || publicKey, data.value, data.payee)
            case PolkadotStakingActionType.NOMINATE:
                assertFields('targets')
                return this.prepareDelegation(publicKey, data.tip || 0, data.targets)
            case PolkadotStakingActionType.CANCEL_NOMINATION:
                return this.prepareCancelDelegation(publicKey, data.tip || 0, data.value)
            case PolkadotStakingActionType.CHANGE_NOMINATION:
                assertFields('targets')
                return this.prepareChangeValidator(publicKey, data.tip || 0, data.targets)
            case PolkadotStakingActionType.UNBOND:
                assertFields('value')
                return this.prepareUnbond(publicKey, data.tip || 0, data.value)
            case PolkadotStakingActionType.REBOND:
                assertFields('value')
                return this.prepareRebond(publicKey, data.tip || 0, data.value)
            case PolkadotStakingActionType.BOND_EXTRA:
                assertFields('value')
                return this.prepareBondExtra(publicKey, data.tip || 0, data.value)
            case PolkadotStakingActionType.WITHDRAW_UNBONDED:
                return this.prepareWithdrawUnbonded(publicKey, data.tip || 0)
            case PolkadotStakingActionType.COLLECT_REWARDS:
                return this.prepareCollectRewards(publicKey, data.tip || 0)
            case PolkadotStakingActionType.CHANGE_REWARD_DESTINATION:
                return Promise.reject('Unsupported delegator action.')
            case PolkadotStakingActionType.CHANGE_CONTROLLER:
                return Promise.reject('Unsupported delegator action.')
            default:
                return Promise.reject('Unsupported delegator action.')
        }
    }

    public async prepareDelegation(
        publicKey: string,
        tip: string | number | BigNumber,
        targets: string[] | string,
        controller?: string,
        value?: string | number | BigNumber,
        payee?: string | PolkadotPayee,
    ): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)
        const available = new BigNumber(transferableBalance).minus(value || 0)

        const bondFirst = (controller !== undefined && value !== undefined && payee !== undefined)

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, available, [
            ...(bondFirst ? [{
                type: PolkadotTransactionType.BOND,
                tip,
                args: {
                    controller,
                    value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!),
                    payee: isString(payee) ? PolkadotPayee[payee] :  payee
                }
            }] : []),
            {
                type: PolkadotTransactionType.NOMINATE,
                tip,
                args: { 
                    targets: isString(targets) ? [targets] : targets
                }
            }
        ])

        return [{ encoded }]
    }

    public async prepareCancelDelegation(
        publicKey: string,
        tip: string | number | BigNumber,
        value?: string | number | BigNumber
    ): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)
        const keepController = value === undefined

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
            {
                type: PolkadotTransactionType.CANCEL_NOMINATION,
                tip,
                args: {}
            },
            ...(keepController ? [] : [{
                type: PolkadotTransactionType.UNBOND,
                tip,
                args: {
                    value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!)
                }
            }])
        ])

        return [{ encoded }]
    }

    public async prepareChangeValidator(
        publicKey: string,
        tip: string | number | BigNumber,
        targets: string[] | string
    ): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
            {
                type: PolkadotTransactionType.NOMINATE,
                tip,
                args: {
                    targets: isString(targets) ? [targets] : targets
                }
            }
        ])

        return [{ encoded }]
    }

    public async prepareUnbond(
        publicKey: string,
        tip: string | number | BigNumber,
        value: string | number | BigNumber
    ): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
            {
                type: PolkadotTransactionType.UNBOND,
                tip,
                args: {
                    value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!)
                }
            }
        ])

        return [{ encoded }]
    }

    public async prepareRebond(
        publicKey: string,
        tip: string | number | BigNumber,
        value: string | number | BigNumber
    ): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
            {
                type: PolkadotTransactionType.REBOND,
                tip,
                args: {
                    value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!)
                }
            }
        ])

        return [{ encoded }]
    }

    public async prepareBondExtra(
        publicKey: string,
        tip: string | number | BigNumber,
        value: string | number | BigNumber
    ): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
            {
                type: PolkadotTransactionType.BOND_EXTRA,
                tip,
                args: {
                    value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
                }
            }
        ])

        return [{ encoded }]
    }

    public async prepareWithdrawUnbonded(publicKey: string, tip: string | number | BigNumber): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
            {
                type: PolkadotTransactionType.WITHDRAW_UNBONDED,
                tip,
                args: {}
            }
        ])

        return [{ encoded }]
    }

    public async prepareCollectRewards(
        publicKey: string, 
        tip: string | number | BigNumber,
    ): Promise<RawPolkadotTransaction[]> {
        const transferableBalance = await this.accountController.getTransferableBalance(publicKey)
        const awaitingRewards = await this.accountController.getUnclaimedRewards(publicKey)

        const payoutCalls = await Promise.all(awaitingRewards.map(
            reward => this.transactionController.createTransactionMethod(
                PolkadotTransactionType.COLLECT_PAYOUT,
                {
                    eraIndex: reward.eraIndex,
                    validators: reward.exposures
                }
            )
        ))

        const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
            {
                type: PolkadotTransactionType.SUBMIT_BATCH,
                tip,
                args: {
                    calls: payoutCalls
                }
            }
        ])

        return [{ encoded }]
    }

    public async estimateMaxDelegationValueFromAddress(address: string): Promise<string> {
        const results = await Promise.all([
            this.accountController.getTransferableBalance(address),
            this.getFutureRequiredTransactions(address, 'delegate')
        ])

        const transferableBalance = results[0]
        const futureTransactions = results[1]

        const feeEstimate = await this.transactionController.estimateTransactionFees(futureTransactions)

        if (!feeEstimate) {
            return Promise.reject('Could not estimate max value.')
        }

        const maxValue = transferableBalance
            .minus(feeEstimate)

        return (maxValue.gte(0) ? maxValue : new BigNumber(0)).toString(10)
    }

    private async getTransactionDetailsFromEncoded(encoded: string): Promise<IAirGapTransaction[]> {
        const txs = this.transactionController.decodeDetails(encoded)

        return txs.map(tx => {
            return tx.transaction.toAirGapTransactions().map(part => ({
                from: [],
                to: [],
                amount: '',
                fee: tx.fee.toString(),
                protocolIdentifier: this.identifier,
                isInbound: false,
                ...part
            }))
        }).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
    }

    private async getFutureRequiredTransactions(
        publicKey: string,
        intention: 'check' | 'transfer' | 'delegate'
    ): Promise<[PolkadotTransactionType, any][]> {
        const results = await Promise.all([
            this.accountController.isBonded(publicKey),
            this.accountController.isNominating(publicKey),
            this.accountController.getTransferableBalance(publicKey)
        ])

        const isBonded = results[0]
        const isNominating = results[1]
        const transferableBalance = results[2]

        let requiredTransactions: [PolkadotTransactionType, any][] = []

        if (intention === 'transfer') {
            requiredTransactions.push([PolkadotTransactionType.TRANSFER, {
                to: PolkadotAddress.createPlaceholder(),
                value: transferableBalance
            }])
        }

        if (!isBonded && intention === 'delegate') {
            requiredTransactions.push(
                [PolkadotTransactionType.BOND, {
                    controller: PolkadotAddress.createPlaceholder(),
                    value: transferableBalance,
                    payee: 0
                }],
                [PolkadotTransactionType.NOMINATE, {
                    targets: [PolkadotAddress.createPlaceholder()]
                }],
                [PolkadotTransactionType.CANCEL_NOMINATION, {}],
                [PolkadotTransactionType.UNBOND, {
                    value: transferableBalance
                }],
                [PolkadotTransactionType.WITHDRAW_UNBONDED, {}]
            )
        } else if (isBonded) {
            requiredTransactions.push(
                [PolkadotTransactionType.UNBOND, {
                    value: transferableBalance
                }],
                [PolkadotTransactionType.WITHDRAW_UNBONDED, {}]
            )
        }

        if (isNominating) {
            requiredTransactions.push([PolkadotTransactionType.CANCEL_NOMINATION, {}])
        }

        return requiredTransactions
    }

    public signMessage(message: string, privateKey: Buffer): Promise<string> {
        throw new Error('Method not implemented.');
    }
    
    public verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}