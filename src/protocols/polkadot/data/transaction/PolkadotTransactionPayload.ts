import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod";
import { SCALEClass } from "../../codec/type/SCALEClass";
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { SCALEEra } from "../../codec/type/SCALEEra";
import { SCALECompactInt } from "../../codec/type/SCALECompactInt";
import { SCALEInt } from "../../codec/type/SCALEInt";
import { SCALEHash } from "../../codec/type/SCALEHash";

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
            SCALEHash.from(genesisHash), 
            SCALEHash.from(blockHash)
        )
    }

    protected readonly scaleFields = [this.method, this.era, this.nonce, this.tip, this.specVersion, this.genesisHash, this.blockHash]

    private constructor(
        readonly method: PolkadotTransactionMethod,
        readonly era: SCALEEra,
        readonly nonce: SCALECompactInt,
        readonly tip: SCALECompactInt,
        readonly specVersion: SCALEInt,
        readonly genesisHash: SCALEHash,
        readonly blockHash: SCALEHash
    ) { super() }
}