/// <reference types="node" />
import * as bitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction';
import { INetwork } from '../networks';
import { ICoinProtocol } from './ICoinProtocol';
export declare class BitcoinProtocol implements ICoinProtocol {
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
    network: any;
    baseApiUrl: string;
    bitcoinJSLib: any;
    constructor(network?: INetwork, baseApiUrl?: string, bitcoinJSLib?: typeof bitcoinJS);
    getPublicKeyFromHexSecret(secret: string, derivationPath: string): string;
    getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer;
    getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string;
    getAddressFromPublicKey(publicKey: string): any;
    getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: any, addressDerivationIndex: any): any;
    getAddressesFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: any, addressCount: any, offset: any): string[];
    signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<string>;
    signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string>;
    getTransactionDetails(transaction: any): IAirGapTransaction;
    getTransactionDetailsFromRaw(transaction: any, rawTx: any): IAirGapTransaction;
    getBalanceOfAddresses(addresses: string[]): Promise<BigNumber>;
    getBalanceOfPublicKey(publicKey: string): Promise<BigNumber>;
    getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset?: number): Promise<BigNumber>;
    prepareTransactionFromExtendedPublicKey(extendedPublicKey: string, offset: number, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
    prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
    broadcastTransaction(rawTransaction: string): Promise<any>;
    getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number, addressOffset?: number): Promise<IAirGapTransaction[]>;
    getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>;
    getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]>;
    private containsSome;
}
