import { PolkadotNodeClient } from "../node/PolkadotNodeClient";
import { PolkadotTransaction, PolkadotTransactionType } from './data/PolkadotTransaction'
import { PolkadotTransactionPayload } from './data/PolkadotTransactionPayload'
import { waitReady, sr25519Sign } from '@polkadot/wasm-crypto'
import { blake2bAsBytes } from '../../../utils/blake2b'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALEEnum } from '../node/codec/type/SCALEEnum'
import { SCALECompactInt } from '../node/codec/type/SCALECompactInt'
import { SCALEBytes } from '../node/codec/type/SCALEBytes'
import { SCALEArray } from '../node/codec/type/SCALEArray'
import { SCALEDecoder } from '../node/codec/SCALEDecoder'
import { PolkadotAddress } from '../account/PolkadotAddress'

interface PolkadotTransactionDetails {
    fee: BigNumber
    transaction: PolkadotTransaction
    payload: PolkadotTransactionPayload
}

interface PolkadotTransactionConfig {
    type: PolkadotTransactionType
    tip: string | number | BigNumber
    args: any
}

export class PolkadotTransactionController {
    constructor(
        readonly nodeClient: PolkadotNodeClient
    ) {}

    public async prepareSubmittableTransactions(
        publicKey: string, 
        available: BigNumber | string,
        txConfig: PolkadotTransactionConfig[]
    ): Promise<string> {
        const txs = await Promise.all(
            txConfig.map((tx, index) => this.prepareTransactionDetails(tx.type, publicKey, tx.tip, tx.args, index))
        )

        const totalFee = txs.map(tx => tx.fee).reduce((total, next) => total.plus(next), new BigNumber(0))
        
        if (new BigNumber(available).lt(totalFee)) {
            throw new Error('Not enough balance')
        }

        return this.encodeDetails(txs)
    }

    public async createTransaction(
        type: PolkadotTransactionType, 
        publicKey: string, 
        tip: string | number | BigNumber, 
        args: any = {}, 
        index: number | BigNumber = 0
    ): Promise<PolkadotTransaction> {
        const results = await Promise.all([
            this.nodeClient.getCurrentHeight(),
            this.nodeClient.getNonce(PolkadotAddress.fromPublicKey(publicKey)),
            this.nodeClient.getTransactionMetadata(type)
        ])

        if (results.some(result => result === null)) {
            return Promise.reject('Could not fetch all necessary data.')
        }

        const chainHeight = results[0]!
        const nonce = results[1]!.plus(index)
        const methodId = results[2]!

        return PolkadotTransaction.create(type, {
            from: publicKey,
            tip: BigNumber.isBigNumber(tip) ? tip : new BigNumber(tip),
            methodId,
            args,
            era: { chainHeight },
            nonce
        })
    }

    public async signTransaction(privateKey: Buffer, transaction: PolkadotTransaction, payload: PolkadotTransactionPayload): Promise<PolkadotTransaction> {
        const signature = await this.signPayload(privateKey, transaction.signer.asBytes(), payload.encode())
        return PolkadotTransaction.fromTransaction(transaction, { signature })
    }

    public encodeDetails(txs: PolkadotTransactionDetails[]): string {
        const bytesEncoded = txs.map(tx => {
            const scaleType = SCALEEnum.from(tx.transaction.type)
            const scaleFee = SCALECompactInt.from(tx.fee)
            
            return SCALEBytes.from(scaleType.encode() + scaleFee.encode() + tx.transaction.encode() + tx.payload.encode())
        })
    
        return SCALEArray.from(bytesEncoded).encode()
    }

    public decodeDetails(serialized: string): PolkadotTransactionDetails[] {
        const decoder = new SCALEDecoder(serialized)
    
        const encodedTxs = decoder.decodeNextArray(SCALEBytes.decode).decoded.elements.map(bytesEncoded => bytesEncoded.bytes.toString('hex'))
    
        return encodedTxs.map(encodedTx => {
            const txDecoder = new SCALEDecoder(encodedTx)
    
            const type = txDecoder.decodeNextEnum(hex => PolkadotTransactionType[PolkadotTransactionType[hex]])
            const fee = txDecoder.decodeNextCompactInt()
            const transaction = txDecoder.decodeNextObject(hex => PolkadotTransaction.decode(type.decoded.value, hex))
            const payload = txDecoder.decodeNextObject(hex => PolkadotTransactionPayload.decode(type.decoded.value, hex))
    
            return {
                fee: fee.decoded.value,
                transaction: transaction.decoded,
                payload: payload.decoded
            }
        })
    }

    public async calculateTransactionFee(transaction: PolkadotTransaction): Promise<BigNumber | null> {
        const partialEstimate = await this.nodeClient.getTransferFeeEstimate(transaction.encode())

        return partialEstimate?.plus(transaction.tip.value) || null
    }

    private async prepareTransactionDetails(
        type: PolkadotTransactionType, 
        publicKey: string, 
        tip: string | number | BigNumber, 
        args: any = {}, 
        index: number | BigNumber = 0
    ): Promise<PolkadotTransactionDetails> {
        const results = await Promise.all([
            this.createTransaction(type, publicKey, tip, args, index),
            this.nodeClient.getLastBlockHash(),
            this.nodeClient.getFirstBlockHash(),
            this.nodeClient.getSpecVersion(),
        ])

        if (results.some(result => result === null)) {
            return Promise.reject('Could not fetch all necessary data.')
        }

        const transaction = results[0]!

        const fee = await this.calculateTransactionFee(transaction)
        if (!fee) {
            return Promise.reject('Could not fetch all necessary data.')
        }

        const lastHash = results[1]!
        const genesisHash = results[2]!
        const specVersion = results[3]!

        const payload = PolkadotTransactionPayload.create(transaction, {
            specVersion,
            genesisHash,
            lastHash
        })

        return {
            fee,
            transaction,
            payload
        }
    }

    private async signPayload(privateKey: Buffer, publicKey: Buffer, payload: string): Promise<Uint8Array> {
        await waitReady()
            
        const payloadBuffer = Buffer.from(payload, 'hex')
        const message = payloadBuffer.length > 256 ? blake2bAsBytes(payloadBuffer, 256) : payloadBuffer
    
        return sr25519Sign(publicKey, privateKey, message)
    }
}