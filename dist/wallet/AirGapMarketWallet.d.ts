import BigNumber from 'bignumber.js';
import { AirGapWallet } from './AirGapWallet';
export declare enum TimeUnit {
    Hours = "hours",
    Days = "days",
    Minutes = "minutes"
}
export interface MarketDataSample {
    time: number;
    close: number;
    high: number;
    low: number;
    open: number;
    volumefrom: string;
    volumeto: number;
}
export declare class AirGapMarketWallet extends AirGapWallet {
    protocolIdentifier: string;
    publicKey: string;
    isExtendedPublicKey: boolean;
    derivationPath: string;
    currentBalance: BigNumber;
    currentMarketPrice: BigNumber;
    marketSample: MarketDataSample[];
    minuteMarketSample: MarketDataSample[];
    dailyMarketSample: MarketDataSample[];
    hourlyMarketSample: MarketDataSample[];
    constructor(protocolIdentifier: string, publicKey: string, isExtendedPublicKey: boolean, derivationPath: string);
    synchronize(): Promise<void>;
    fetchCurrentMarketPrice(baseSymbol?: string): Promise<BigNumber>;
    fetchDailyMarketPrices(numberOfDays: number, date: Date, baseSymbol?: string): Promise<MarketDataSample[]>;
    fetchHourlyMarketPrices(numberOfHours: number, date: Date, baseSymbol?: string): Promise<MarketDataSample[]>;
    fetchMinutesMarketPrices(numberOfMinutes: number, date: Date, baseSymbol?: string): Promise<MarketDataSample[]>;
    fetchWalletValue(): Promise<BigNumber>;
    private algoSelector;
}
