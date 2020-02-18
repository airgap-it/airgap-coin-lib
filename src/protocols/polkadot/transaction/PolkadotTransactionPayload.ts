import { SCALEClass } from "../codec/type/SCALEClass"
import { PolkadotTransactionMethod } from "./method/PolkadotTransactionMethod"
import { SCALEEra } from "../codec/type/SCALEEra"
import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { SCALECompactInt } from "../codec/type/SCALECompactInt"
import { SCALEInt } from "../codec/type/SCALEInt"
import { SCALEHash } from "../codec/type/SCALEHash"
import { PolkadotTransaction } from "./PolkadotTransaction"

interface PayloadConfig {
    lastHash: string,
    genesisHash: string,
    specVersion: number | BigNumber
}

export class PolkadotTransactionPayload extends SCALEClass {
    
    public static create(transaction: PolkadotTransaction, config: PayloadConfig): PolkadotTransactionPayload {
        return new PolkadotTransactionPayload(
            transaction.method, 
            transaction.era, 
            transaction.nonce, 
            transaction.tip,
            SCALEInt.from(config.specVersion, 32), 
            SCALEHash.from(config.genesisHash), 
            SCALEHash.from(transaction.era.isMortal ? config.lastHash : config.genesisHash)
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