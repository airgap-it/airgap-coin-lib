/// <reference types="node" />
import { ICoinProtocol } from './ICoinProtocol';
import { INetwork } from '../networks';
import { BigNumber } from 'bignumber.js';
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction';
export declare class EthereumProtocol implements ICoinProtocol {
    symbol: string;
    name: string;
    feeSymbol: string;
    feeDefaults: {
        low: BigNumber;
        medium: BigNumber;
        high: BigNumber;
    };
    decimals: number;
    feeDecimals: number;
    identifier: string;
    units: {
        unitSymbol: string;
        factor: BigNumber;
    }[];
    supportsHD: boolean;
    standardDerivationPath: string;
    addressValidationPattern: string;
    web3: any;
    network: INetwork;
    chainId: number;
    infoAPI: string;
    constructor(jsonRPCAPI?: string, infoAPI?: string, chainId?: number);
    getPublicKeyFromHexSecret(secret: string, derivationPath: string): string;
    getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer;
    getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string;
    getAddressFromPublicKey(publicKey: string | Buffer): string;
    getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressDerivationIndex: number): string;
    getAddressesFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressCount: number, offset: number): string[];
    signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string>;
    signWithPrivateKey(extendedPrivateKey: Buffer, transaction: any): Promise<string>;
    getTransactionDetails(transaction: any): IAirGapTransaction;
    getBalanceOfPublicKey(publicKey: string): Promise<BigNumber>;
    getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset?: number): Promise<BigNumber>;
    prepareTransactionFromExtendedPublicKey(extendedPublicKey: string, offset: number, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
    prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
    broadcastTransaction(rawTransaction: string): Promise<any>;
    getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>;
    getTransactionsFromPublicKey(publicKey: string, limit?: number, offset?: number): Promise<IAirGapTransaction[]>;
    getBalanceOfAddresses(addresses: string[]): Promise<BigNumber>;
    getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]>;
}
