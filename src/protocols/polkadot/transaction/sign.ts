import { SCALEEra, EraConfig } from "../codec/type/SCALEEra"
import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { waitReady, sr25519Sign } from "@polkadot/wasm-crypto"
import { blake2bAsBytes } from "../../../utils/blake2b"
import { PolkadotTransaction } from "./PolkadotTransaction"
import { stripHexPrefix } from "../../../utils/hex"
import { SCALEClass } from "../codec/type/SCALEClass"
import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod"
import { SCALECompactInt } from "../codec/type/SCALECompactInt"
import { SCALEInt } from "../codec/type/SCALEInt"
import { SCALEHash } from "../codec/type/SCALEHash"

class SignaturePayload extends SCALEClass {
    public static create(
        method: PolkadotTransactionMethod,
        era: SCALEEra,
        nonce: number | BigNumber,
        tip: number | BigNumber,
        specVersion: number | BigNumber,
        genesisHash: string,
        lastHash: string
    ): SignaturePayload {
        return new SignaturePayload(
            method, 
            era, 
            SCALECompactInt.from(nonce), 
            SCALECompactInt.from(tip), 
            SCALEInt.from(specVersion, 32), 
            SCALEHash.from(genesisHash), 
            SCALEHash.from(lastHash)
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

async function signPayload(privateKey: Buffer, publicKey: Buffer, payload: SignaturePayload): Promise<Uint8Array> {
    await waitReady()
        
    const payloadBuffer = Buffer.from(payload.encode(), 'hex')
    const message = payloadBuffer.length > 256 ? blake2bAsBytes(payloadBuffer, 256) : payloadBuffer

    return sr25519Sign(publicKey, privateKey, message)
}

export interface PolkadotSignParams {
    lastHash: string,
    eraConfig: EraConfig | null,
    genesisHash: string,
    nonce: number | BigNumber,
    specVersion: number | BigNumber,
    tip: number | BigNumber
}

export async function sign(transaction: PolkadotTransaction, privateKey: Buffer, partialSignParams: Partial<PolkadotSignParams>): Promise<PolkadotTransaction> {
    const signParams = {
        tip: transaction.tip.value,
        ...partialSignParams
    } as PolkadotSignParams

    const era = signParams.eraConfig ? SCALEEra.Mortal(signParams.eraConfig) : SCALEEra.Immortal()

    const payload = SignaturePayload.create(
        transaction.method, 
        era,
        signParams.nonce,
        signParams.tip,
        signParams.specVersion,
        signParams.genesisHash,
        era.isMortal ? signParams.lastHash : signParams.genesisHash
    )

    const publicKey = Buffer.from(stripHexPrefix(transaction.signer.accountId), 'hex')
    const signature = await signPayload(privateKey, publicKey, payload)

    return PolkadotTransaction.fromTransaction(transaction, { signature, era, nonce: signParams.nonce })
}