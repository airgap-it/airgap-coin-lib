import { PolkadotTransactionType, PolkadotTransaction } from "./PolkadotTransaction";
import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { PolkadotTransactionPayload } from "./PolkadotTransactionPayload";
import { SCALEEnum } from "../codec/type/SCALEEnum";
import { SCALECompactInt } from "../codec/type/SCALECompactInt";
import { SCALEArray } from "../codec/type/SCALEArray";
import { SCALEDecoder } from "../codec/SCALEDecoder";
import { SCALEBytes } from "../codec/type/SCALEBytes";

export interface PolkadotSerializableTransaction {
    type: PolkadotTransactionType
    fee: BigNumber
    transaction: PolkadotTransaction
    payload: PolkadotTransactionPayload
}

export function serializePolkadotTransactions(txs: PolkadotSerializableTransaction[]): string {
    const bytesEncoded = txs.map(tx => {
        const scaleType = SCALEEnum.from(tx.type)
        const scaleFee = SCALECompactInt.from(tx.fee)
        
        return SCALEBytes.from(scaleType.encode() + scaleFee.encode() + tx.transaction.encode() + tx.payload.encode())
    })

    return SCALEArray.from(bytesEncoded).encode()
}

export function deserializePolkadotTransactions(serialized: string): PolkadotSerializableTransaction[] {
    const decoder = new SCALEDecoder(serialized)

    const encodedTxs = decoder.decodeNextArray(SCALEBytes.decode).decoded.elements.map(bytesEncoded => bytesEncoded.bytes.toString('hex'))

    return encodedTxs.map(encodedTx => {
        const txDecoder = new SCALEDecoder(encodedTx)

        const type = txDecoder.decodeNextEnum(hex => PolkadotTransactionType[PolkadotTransactionType[hex]])
        const fee = txDecoder.decodeNextCompactInt()
        const transaction = txDecoder.decodeNextObject(hex => PolkadotTransaction.decode(type.decoded.value, hex))
        const payload = txDecoder.decodeNextObject(hex => PolkadotTransactionPayload.decode(type.decoded.value, hex))

        return {
            type: type.decoded.value,
            fee: fee.decoded.value,
            transaction: transaction.decoded,
            payload: payload.decoded
        }
    })
}