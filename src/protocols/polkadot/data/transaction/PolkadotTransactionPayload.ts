import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod";
import { SCALEEra, SCALECompactInt, SCALEInt, SCALEBytes } from "../../type/scaleType";
import { SCALEClass } from "../../type/scaleClass";

export class PolkadotTransactionPayload extends SCALEClass {
    protected readonly scaleFields = [this.method, this.era, this.nonce, this.tip, this.specVersion, this.genesisHash, this.blockHash]

    constructor(
        readonly method: PolkadotTransactionMethod,
        readonly era: SCALEEra,
        readonly nonce: SCALECompactInt,
        readonly tip: SCALECompactInt,
        readonly specVersion: SCALEInt,
        readonly genesisHash: SCALEBytes,
        readonly blockHash: SCALEBytes
    ) { super() }
}