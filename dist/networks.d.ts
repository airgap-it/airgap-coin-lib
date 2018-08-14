import * as bitcoinJS from 'bitcoinjs-lib';
export interface INetwork {
    messagePrefix?: string;
    bip32: {
        public: number;
        private: number;
    };
    pubKeyHash: number;
    scriptHash?: number;
    wif: number;
    dustSoftThreshold?: number;
    dustThreshold?: number;
    feePerKb?: number;
    ethereum?: boolean;
}
declare const networks: {
    [key: string]: INetwork | bitcoinJS.Network;
};
export { networks };
