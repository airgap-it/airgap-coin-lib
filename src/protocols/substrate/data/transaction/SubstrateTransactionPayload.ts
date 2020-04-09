import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEEra } from '../scale/type/SCALEEra'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SubstrateTransaction, SubstrateTransactionType } from './SubstrateTransaction'
import { SCALEDecodeResult, SCALEDecoder } from '../scale/SCALEDecoder'
import { SubstrateTransactionMethod } from './method/SubstrateTransactionMethod'
import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'

interface PayloadConfig {
    lastHash: string,
    genesisHash: string,
    specVersion: number | BigNumber
}

export class SubstrateTransactionPayload extends SCALEClass {
    
    public static create(transaction: SubstrateTransaction, config: PayloadConfig): SubstrateTransactionPayload {
        return new SubstrateTransactionPayload(
            transaction.method, 
            transaction.era, 
            transaction.nonce, 
            transaction.tip,
            SCALEInt.from(config.specVersion, 32), 
            SCALEHash.from(config.genesisHash), 
            SCALEHash.from(transaction.era.isMortal ? config.lastHash : config.genesisHash)
        )
    }

    public static decode(type: SubstrateTransactionType, hex: string): SCALEDecodeResult<SubstrateTransactionPayload> {
        const decoder = new SCALEDecoder(hex)

        const method = decoder.decodeNextObject(hex => SubstrateTransactionMethod.decode(type, hex))
        const era = decoder.decodeNextEra()
        const nonce = decoder.decodeNextCompactInt()
        const tip = decoder.decodeNextCompactInt()
        const specVersion = decoder.decodeNextInt(32)
        const genesisHash = decoder.decodeNextHash(256)
        const blockHash = decoder.decodeNextHash(256)

        return {
            bytesDecoded: method.bytesDecoded + era.bytesDecoded + nonce.bytesDecoded + tip.bytesDecoded + specVersion.bytesDecoded + genesisHash.bytesDecoded + blockHash.bytesDecoded,
            decoded: new SubstrateTransactionPayload(
                method.decoded,
                era.decoded,
                nonce.decoded,
                tip.decoded,
                specVersion.decoded,
                genesisHash.decoded,
                blockHash.decoded
            )
        }
    }

    protected readonly scaleFields = [this.method, this.era, this.nonce, this.tip, this.specVersion, this.genesisHash, this.blockHash]

    private constructor(
        readonly method: SubstrateTransactionMethod,
        readonly era: SCALEEra,
        readonly nonce: SCALECompactInt,
        readonly tip: SCALECompactInt,
        readonly specVersion: SCALEInt,
        readonly genesisHash: SCALEHash,
        readonly blockHash: SCALEHash
    ) { super() }
}