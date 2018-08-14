import { ICoinProtocol } from '../protocols/ICoinProtocol';
import BigNumber from 'bignumber.js';
import { IAirGapTransaction } from './IAirGapTransaction';
export declare class AirGapWallet {
    protocolIdentifier: string;
    publicKey: string;
    isExtendedPublicKey: boolean;
    derivationPath: string;
    addresses: string[];
    constructor(protocolIdentifier: string, publicKey: string, isExtendedPublicKey: boolean, derivationPath: string);
    readonly receivingPublicAddress: string;
    deriveAddresses(amount?: number): string[];
    readonly coinProtocol: ICoinProtocol;
    balanceOf(): Promise<BigNumber>;
    fetchTransactions(limit: number, offset: number): Promise<IAirGapTransaction[]>;
    prepareTransaction(recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>;
}
