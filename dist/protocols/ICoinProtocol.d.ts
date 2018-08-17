/// <reference types="node" />
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction';
import BigNumber from 'bignumber.js';
export interface ICoinProtocol {
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
    units: Array<{
        unitSymbol: string;
        factor: BigNumber;
    }>;
    supportsHD: boolean;
    standardDerivationPath: string;
    addressValidationPattern: string;
    getPublicKeyFromHexSecret(secret: string, derivationPath: string): string;
    getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer;
    getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string;
    getAddressFromPublicKey(publicKey: string): string;
    getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressDerivationIndex: number): string;
    getAddressesFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressCount: number, offset: number): string[];
    getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>;
    getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>;
    getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]>;
    signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string>;
    signWithPrivateKey(extendedPrivateKey: Buffer, transaction: any): Promise<string>;
    getTransactionDetails(transaction: any): IAirGapTransaction;
    getTransactionDetailsFromRaw(transaction: any, rawTx: any): IAirGapTransaction;
    getBalanceOfAddresses(addresses: string[]): Promise<BigNumber>;
    getBalanceOfPublicKey(publicKey: string): Promise<BigNumber>;
    getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<BigNumber>;
    prepareTransactionFromExtendedPublicKey(extendedPublicKey: string, offset: number, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
    prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
    broadcastTransaction(rawTransaction: string): Promise<any>;
}
