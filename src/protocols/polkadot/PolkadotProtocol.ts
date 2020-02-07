import { FeeDefaults, ICoinProtocol, CurrencyUnit } from '../ICoinProtocol'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { NonExtendedProtocol } from '../NonExtendedProtocol'
import { PolkadotNodeClient } from './PolkadotNodeClient'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { createSr25519KeyPair } from '../../utils/sr25519'
import { encodeAddress, decodeAddress } from './utils/address'
import { IAirGapTransaction } from '../..'
import { PolkadotTransaction, UnsignedPolkadotTransaction, SignedPolkadotTransaction } from './data/transaction/PolkadotTransaction'
import { PolkadotSpendTransactionBuilder } from './data/transaction/PolkadotTransactionBuilder'
import { PolkadotEra, ImmortalEra } from './data/transaction/PolkadotEra'

const ERA_PERIOD = 50 // 5 min at 6s block times

export class PolkadotProtocol extends NonExtendedProtocol implements ICoinProtocol {
    // TODO: set proper values
    symbol: string = ''
    name: string = ''
    marketSymbol: string = ''
    feeSymbol: string = ''

    decimals: number = 0;
    feeDecimals: number = 0;
    identifier: string = '';

    get subProtocols() {
        return getSubProtocolsByIdentifier(this.identifier) as any[]
    }

    feeDefaults: FeeDefaults = {
        low: '',
        medium: '',
        high: ''
    }

    units: CurrencyUnit[] = []

    supportsHD: boolean = false
    standardDerivationPath: string = ''

    addressIsCaseSensitive: boolean = false
    addressValidationPattern: string = ''
    addressPlaceholder: string = ''

    blockExplorer: string = ''

    constructor(
        private readonly nodeClient: PolkadotNodeClient = new PolkadotNodeClient('http://localhost:9933') // TODO: change to non local address
    ) {
        super()
    }

    public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
        const keyPair = await createSr25519KeyPair(secret, derivationPath)
        return keyPair.publicKey.toString('hex')
    }

    public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer> {
        const keyPair = await createSr25519KeyPair(secret, derivationPath)
        return keyPair.privateKey
    }

    public async getAddressFromPublicKey(publicKey: string): Promise<string> {
        return encodeAddress(publicKey)
    }
    
    public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
        return [await this.getAddressFromPublicKey(publicKey)]
    }
    
    public getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
        throw new Error('Method not implemented.');
    }
    
    public getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
        throw new Error('Method not implemented.');
    }
    
    public async signWithPrivateKey(privateKey: Buffer, transaction: PolkadotTransaction): Promise<string> {
        const lastHash = await this.nodeClient.getLastBlockHash()
        const genesisHash = await this.nodeClient.getFirstBlockHash()
        const currentHeight = await this.nodeClient.getCurrentHeight()
        const era = PolkadotEra.create({ period: ERA_PERIOD, chainHeight: currentHeight })
        let nonce = (await this.nodeClient.getNonce(transaction.signer)).toNumber()
        const specVersion = await this.nodeClient.getSpecVersion()

        await transaction.sign(privateKey, {
            blockHash: (era instanceof ImmortalEra) ? genesisHash : lastHash,
            era,
            genesisHash,
            nonce: nonce++,
            specVersion
        })

        const signed = {
            tx: transaction.toAirGapTransaction(this.identifier),
            encoded: transaction.encode()
        }

        return JSON.stringify(signed)
    }
    
    public async getTransactionDetails(transaction: UnsignedPolkadotTransaction): Promise<IAirGapTransaction[]> {
        return [transaction.transaction.toAirGapTransaction(this.identifier)]
    }
    
    public async getTransactionDetailsFromSigned(transaction: SignedPolkadotTransaction): Promise<IAirGapTransaction[]> {
        const tx = JSON.parse(transaction.transaction).tx as IAirGapTransaction
        return [tx]
    }

    public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
        const promises: Promise<BigNumber>[] = addresses.map(address => {
            const accountId = decodeAddress(address)
            return this.nodeClient.getBalance(accountId)
        })
        const balances = await Promise.all(promises)
        const balance = balances.reduce((current: BigNumber, next: BigNumber) => current.plus(next))

        return balance.toString(10)
    }

    public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
        return this.getBalanceOfAddresses([await this.getAddressFromPublicKey(publicKey)])        
    }

    public async prepareTransactionFromPublicKey(
        publicKey: string, 
        recipients: string[], 
        values: string[], 
        fee: string, 
        data?: any
    ): Promise<PolkadotTransaction> {
        if  (recipients.length !== 1 && values.length !== 1) {
            return Promise.reject('only single transactions are supported')
        }

        const recipient = recipients[0]
        const value = new BigNumber(values[0])
        const { moduleIndex, callIndex } = await this.nodeClient.getSpendTransactionMetadata()
        const tip = new BigNumber(fee)

        return new PolkadotSpendTransactionBuilder()
            .from(publicKey)
            .to(recipient)
            .setValue(value)
            .setTip(tip)
            .withMethod(moduleIndex, callIndex)
            .build()
    }
    
    public broadcastTransaction(rawTransaction: string): Promise<string> {
        const encoded = JSON.parse(rawTransaction).encoded
        return this.nodeClient.submitTransaction(encoded)
    }
    
    public signMessage(message: string, privateKey: Buffer): Promise<string> {
        throw new Error('Method not implemented.');
    }
    
    public verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}