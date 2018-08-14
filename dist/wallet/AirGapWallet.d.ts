import { ICoinProtocol } from '../protocols/ICoinProtocol';
import BigNumber from 'bignumber.js';
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction';
import { IAirGapWallet } from '../interfaces/IAirGapWallet';
export declare class AirGapWallet implements IAirGapWallet {
    protocolIdentifier: string;
    publicKey: string;
    isExtendedPublicKey: boolean;
    derivationPath: string;
    addresses: string[];
    coinProtocol: ICoinProtocol;
    constructor(protocolIdentifier: string, publicKey: string, isExtendedPublicKey: boolean, derivationPath: string);
    readonly receivingPublicAddress: string;
    deriveAddresses(amount?: number): string[];
    balanceOf(): Promise<BigNumber>;
    fetchTransactions(limit: number, offset: number): Promise<IAirGapTransaction[]>;
    prepareTransaction(recipients: string[], values: BigNumber[], fee: BigNumber): Promise<IAirGapTransaction>;
}
