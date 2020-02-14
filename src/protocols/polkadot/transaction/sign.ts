import { waitReady, sr25519Sign } from "@polkadot/wasm-crypto"
import { blake2bAsBytes } from "../../../utils/blake2b"
import { PolkadotTransaction } from "./PolkadotTransaction"
import { stripHexPrefix } from "../../../utils/hex"

async function signPayload(privateKey: Buffer, publicKey: Buffer, payload: string): Promise<Uint8Array> {
    await waitReady()
        
    const payloadBuffer = Buffer.from(payload, 'hex')
    const message = payloadBuffer.length > 256 ? blake2bAsBytes(payloadBuffer, 256) : payloadBuffer

    return sr25519Sign(publicKey, privateKey, message)
}

export async function sign(privateKey: Buffer, transaction: PolkadotTransaction, payload: string): Promise<PolkadotTransaction> {
    const publicKey = Buffer.from(stripHexPrefix(transaction.signer.accountId), 'hex')
    const signature = await signPayload(privateKey, publicKey, stripHexPrefix(payload))

    return PolkadotTransaction.fromTransaction(transaction, { signature })
}