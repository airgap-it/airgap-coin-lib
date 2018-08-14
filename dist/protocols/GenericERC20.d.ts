/// <reference types="node" />
import { EthereumProtocol } from './EthereumProtocol';
import BigNumber from 'bignumber.js';
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction';
export declare class GenericERC20 extends EthereumProtocol {
    tokenContract: any;
    constructor(contractAddress: any, jsonRPCAPI?: string, infoAPI?: string, chainId?: number);
    getBalanceOfPublicKey(publicKey: string): Promise<BigNumber>;
    getBalanceOfAddresses(addresses: string[]): Promise<BigNumber>;
    signWithPrivateKey(extendedPrivateKey: Buffer, transaction: any): Promise<string>;
    prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
    getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]>;
}
