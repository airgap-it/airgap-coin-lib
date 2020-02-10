import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod";
import { SCALEEra, SCALECompactInt, SCALEInt, SCALEBytes } from "../../type/scaleType";
import { SCALEClass } from "../../type/scaleClass";
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber";

export class PolkadotTransactionPayload extends SCALEClass {
    public static create(
        method: PolkadotTransactionMethod, 
        era: SCALEEra, 
        nonce: number | BigNumber, 
        tip: number | BigNumber, 
        specVersion: number | BigNumber, 
        genesisHash: string, 
        blockHash: string
    ): PolkadotTransactionPayload {
        return new PolkadotTransactionPayload(
            method, 
            era, 
            SCALECompactInt.from(nonce), 
            SCALECompactInt.from(tip), 
            SCALEInt.from(specVersion, 32), 
            SCALEBytes.from(genesisHash), 
            SCALEBytes.from(blockHash)
        )
    }

    protected readonly scaleFields = [this.method, this.era, this.nonce, this.tip, this.specVersion, this.genesisHash, this.blockHash]

    private constructor(
        readonly method: PolkadotTransactionMethod,
        readonly era: SCALEEra,
        readonly nonce: SCALECompactInt,
        readonly tip: SCALECompactInt,
        readonly specVersion: SCALEInt,
        readonly genesisHash: SCALEBytes,
        readonly blockHash: SCALEBytes
    ) { super() }
}