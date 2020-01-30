import { FeeDefaults, ICoinProtocol, CurrencyUnit } from '../ICoinProtocol'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { NonExtendedProtocol } from '../NonExtendedProtocol'
import { PolkadotNodeClient } from './PolkadotNodeClient'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'

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

    public getBlockExplorerLinkForAddress(address: string): string {
        throw new Error('Method not implemented.');
    }

    public getBlockExplorerLinkForTxId(txId: string): string {
        throw new Error('Method not implemented.');
    }

    public getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
        throw new Error('Method not implemented.');
    }

    public getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
        throw new Error('Method not implemented.');
    }

    public getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
        throw new Error('Method not implemented.');
    }

    public getAddressFromPublicKey(publicKey: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
        throw new Error('Method not implemented.');
    }

    public getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressDerivationIndex: number): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public getAddressesFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressCount: number, offset: number): Promise<string[]> {
        throw new Error('Method not implemented.');
    }

    public getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<import('../..').IAirGapTransaction[]> {
        throw new Error('Method not implemented.');
    }

    public getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<import('../..').IAirGapTransaction[]> {
        throw new Error('Method not implemented.');
    }

    public getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<import('../..').IAirGapTransaction[]> {
        throw new Error('Method not implemented.');
    }

    public signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public getTransactionDetails(transaction: import('../..').UnsignedTransaction): Promise<import('../..').IAirGapTransaction[]> {
        throw new Error('Method not implemented.');
    }

    public getTransactionDetailsFromSigned(transaction: import('../..').SignedTransaction): Promise<import('../..').IAirGapTransaction[]> {
        throw new Error('Method not implemented.');
    }

    public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
        const promises: Promise<BigNumber>[] = addresses.map(address => this.nodeClient.getBalance(address))
        const balances = await Promise.all(promises)
        const balance = balances.reduce((current: BigNumber, next: BigNumber) => current.plus(next))

        return balance.toString(10)
    }

    public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
        return this.getBalanceOfAddresses([await this.getAddressFromPublicKey(publicKey)])        
    }

    public getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public prepareTransactionFromExtendedPublicKey(extendedPublicKey: string, offset: number, recipients: string[], values: string[], fee: string, data?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: string[], fee: string, data?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public broadcastTransaction(rawTransaction: any): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public signMessage(message: string, privateKey: Buffer): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}