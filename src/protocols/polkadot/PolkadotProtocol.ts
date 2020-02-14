import { FeeDefaults, ICoinProtocol, CurrencyUnit } from '../ICoinProtocol'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { NonExtendedProtocol } from '../NonExtendedProtocol'
import { PolkadotNodeClient } from './PolkadotNodeClient'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { createSr25519KeyPair } from '../../utils/sr25519'
import { encodeAddress, decodeAddress } from './utils/address'
import { IAirGapTransaction } from '../..'
import { PolkadotTransaction, PolkadotTransactionType } from './transaction/PolkadotTransaction'
import { UnsignedPolkadotTransaction, RawPolkadotTransaction } from '../../serializer/schemas/definitions/transaction-sign-request-polkadot'
import { SignedPolkadotTransaction } from '../../serializer/schemas/definitions/transaction-sign-response-polkadot'
import { sign } from './transaction/sign'

export class PolkadotProtocol extends NonExtendedProtocol implements ICoinProtocol {
    symbol: string = 'DOT'
    name: string = 'Polkadot'
    marketSymbol: string = 'DOT'
    feeSymbol: string = 'DOT'

    decimals: number = 12;
    feeDecimals: number = 12; // TODO: verify
    identifier: string = 'polkadot';

    get subProtocols() {
        return getSubProtocolsByIdentifier(this.identifier) as any[]
    }

    // TODO: verify
    feeDefaults: FeeDefaults = {
        low: '0.01',
        medium: '0.01',
        high: '0.01'
    }

    units: CurrencyUnit[] = [
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

    supportsHD: boolean = false
    standardDerivationPath: string = `m/44'/354'/0'/0/0` // TODO: verify

    addressIsCaseSensitive: boolean = false
    addressValidationPattern: string = '^[a-km-zA-HJ-NP-Z1-9]+$' // TODO: set length?
    addressPlaceholder: string = 'ABC...'

    blockExplorer: string = '' // TODO: set proper value

    constructor(
        private readonly nodeClient: PolkadotNodeClient = new PolkadotNodeClient('http://localhost:9933') // TODO: change to non local address
    ) { super() }

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
    
    public async signWithPrivateKey(privateKey: Buffer, rawTransaction: RawPolkadotTransaction): Promise<string> {
        const unsigned = PolkadotTransaction.fromRaw(rawTransaction)
        const lastHash = await this.nodeClient.getLastBlockHash()
        const genesisHash = await this.nodeClient.getFirstBlockHash()

        if (!lastHash || !genesisHash) {
            return Promise.reject('Could not fetch all necessary data.')
        }

        const currentHeight = await this.nodeClient.getCurrentHeight()
        let nonce = (await this.nodeClient.getNonce(unsigned.signer.accountId)).toNumber()
        const specVersion = await this.nodeClient.getSpecVersion()

        const signed = await sign(unsigned, privateKey, {
            lastHash,
            eraConfig: { chainHeight: currentHeight },
            genesisHash,
            nonce: nonce++,
            specVersion
        })

        return JSON.stringify({
            type: signed.type.toString(),
            encoded: signed.encode({ withPrefix: true })
        })
    }
    
    public async getTransactionDetails(transaction: UnsignedPolkadotTransaction): Promise<IAirGapTransaction[]> {
        return this.getTransactionDetailsFromRaw(transaction.transaction)
    }
    
    public async getTransactionDetailsFromSigned(transaction: SignedPolkadotTransaction): Promise<IAirGapTransaction[]> {
        const rawTransaction = JSON.parse(transaction.transaction) as RawPolkadotTransaction
        return this.getTransactionDetailsFromRaw(rawTransaction)
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

    public prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: string[], fee: string, data?: any): Promise<RawPolkadotTransaction> {
        if  (recipients.length !== 1 && values.length !== 1) {
            return Promise.reject('only single transactions are supported')
        }

        return this.prepareTransaction(PolkadotTransactionType.SPEND, publicKey, fee, { to: recipients[0], value: new BigNumber(values[0]) })
    }

    public prepareDelegationFromPublicKey(publicKey: string, to: string, conviction: string, fee: string): Promise<RawPolkadotTransaction> {
        return this.prepareTransaction(PolkadotTransactionType.DELEGATION, publicKey, fee, { to, conviction })
    }
    
    public async broadcastTransaction(rawTransaction: string): Promise<string> {
        const encoded = (JSON.parse(rawTransaction) as RawPolkadotTransaction).encoded
        const result = await this.nodeClient.submitTransaction(encoded)
        
        return result ? result : Promise.reject('Error while submitting the transaction.')
    }
    
    public signMessage(message: string, privateKey: Buffer): Promise<string> {
        throw new Error('Method not implemented.');
    }
    
    public verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    private async prepareTransaction(type: PolkadotTransactionType, publicKey: string, fee: string, args: any): Promise<RawPolkadotTransaction> {
        // TODO: handle metadata error
        const methodId = await this.nodeClient.getTransactionMetadata(type)
        return {
            type: type.toString(),
            encoded: PolkadotTransaction.create(type, {
                from: publicKey,
                tip: new BigNumber(fee),
                methodId,
                args
            }).encode({ withPrefix: true })
        }
    }

    private getTransactionDetailsFromRaw(rawTransaction: RawPolkadotTransaction): IAirGapTransaction[] {
        const polkadotTransaction = PolkadotTransaction.fromRaw(rawTransaction)
        return [{
            from: [],
            to: [],
            amount: '',
            fee: '',
            protocolIdentifier: this.identifier,
            isInbound: false,
            ...polkadotTransaction.toAirGapTransaction()
        }]
    }
}