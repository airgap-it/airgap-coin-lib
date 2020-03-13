import { waitReady, sr25519Sign } from "@polkadot/wasm-crypto"
import { blake2bAsBytes } from "../../../utils/blake2b"
import { PolkadotTransaction } from "./PolkadotTransaction"
import { PolkadotTransactionPayload } from "./PolkadotTransactionPayload"

async function signPayload(privateKey: Buffer, publicKey: Buffer, payload: string): Promise<Uint8Array> {
    await waitReady()
        
    const payloadBuffer = Buffer.from(payload, 'hex')
    const message = payloadBuffer.length > 256 ? blake2bAsBytes(payloadBuffer, 256) : payloadBuffer

    return sr25519Sign(publicKey, privateKey, message)
}

export async function signPolkadotTransaction(privateKey: Buffer, transaction: PolkadotTransaction, payload: PolkadotTransactionPayload): Promise<PolkadotTransaction> {
    const signature = await signPayload(privateKey, transaction.signer.value, payload.encode())

    return PolkadotTransaction.fromTransaction(transaction, { signature })
}