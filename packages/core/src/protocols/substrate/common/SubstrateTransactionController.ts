import { sr25519Sign, waitReady } from '@polkadot/wasm-crypto'

import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as keccak from '../../../dependencies/src/keccak-1.0.2/js'
import * as secp256k1 from '../../../dependencies/src/secp256k1-4.0.2/elliptic'
import { BalanceError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'
import { blake2bAsBytes } from '../../../utils/blake2b'
import { SubstrateAccountId, substrateAddressFactory, SubstrateCompatAddressType } from '../compat/SubstrateCompatAddress'
import { SubstrateCompatSignatureType } from '../compat/SubstrateCompatSignature'
import { MoonbeamSignature } from '../moonbeam/data/transaction/MoonbeamSignature'
import { SubstrateNetwork } from '../SubstrateNetwork'

import { SCALEDecoder } from './data/scale/SCALEDecoder'
import { SCALEArray } from './data/scale/type/SCALEArray'
import { SCALEBytes } from './data/scale/type/SCALEBytes'
import { SCALECompactInt } from './data/scale/type/SCALECompactInt'
import { SCALEEnum } from './data/scale/type/SCALEEnum'
import { SCALEInt } from './data/scale/type/SCALEInt'
import { SCALEOptional } from './data/scale/type/SCALEOptional'
import { SCALEString } from './data/scale/type/SCALEString'
import { SubstrateTransactionMethod } from './data/transaction/method/SubstrateTransactionMethod'
import { SubstrateSignature, SubstrateSignatureType } from './data/transaction/SubstrateSignature'
import { SubstrateTransaction, SubstrateTransactionType } from './data/transaction/SubstrateTransaction'
import { SubstrateTransactionPayload } from './data/transaction/SubstrateTransactionPayload'
import { SubstrateNodeClient } from './node/SubstrateNodeClient'

export interface SubstrateTransactionDetails<Network extends SubstrateNetwork> {
  runtimeVersion: number | undefined
  fee: BigNumber
  transaction: SubstrateTransaction<Network>
  payload: string
}

export interface SubstrateTransactionConfig {
  type: SubstrateTransactionType
  tip: string | number | BigNumber
  args: any
}

export class SubstrateTransactionController<Network extends SubstrateNetwork> {
  constructor(readonly network: Network, readonly nodeClient: SubstrateNodeClient<Network>) {}

  public async prepareSubmittableTransactions(
    accountId: SubstrateAccountId<SubstrateCompatAddressType[Network]>,
    available: BigNumber | string,
    txConfig: SubstrateTransactionConfig[]
  ): Promise<string> {
    const accountInfo = await this.nodeClient.getAccountInfo(this.substrateAddressFrom(accountId))

    if (!accountInfo) {
      return Promise.reject('Could not fetch all necessary data')
    }

    const nonce = accountInfo.nonce.value
    const txs = await Promise.all(
      txConfig.map((tx, index) => this.prepareTransactionDetails(tx.type, accountId, tx.tip, nonce.plus(index), tx.args))
    )

    const totalFee = txs.map((tx) => tx.fee).reduce((total, next) => total.plus(next), new BigNumber(0))

    if (new BigNumber(available).lt(totalFee)) {
      throw new BalanceError(Domain.SUBSTRATE, `Not enough balance`)
    }

    return this.encodeDetails(txs)
  }

  public async createTransaction(
    type: SubstrateTransactionType,
    accountId: SubstrateAccountId<SubstrateCompatAddressType[Network]>,
    tip: string | number | BigNumber = 0,
    args: any = {},
    chainHeight: number | BigNumber = 1,
    nonce: number | BigNumber = 0
  ): Promise<SubstrateTransaction<Network>> {
    const methodId = await this.nodeClient.getTransactionMetadata(type)
    const signatureType = this.getDefaultSignatureType()

    return SubstrateTransaction.create(this.network, type, {
      from: accountId,
      tip: BigNumber.isBigNumber(tip) ? tip : new BigNumber(tip),
      methodId,
      args,
      era: { chainHeight },
      nonce,
      signatureType
    })
  }

  protected getDefaultSignatureType(): SubstrateSignatureType {
    return SubstrateSignatureType.Ed25519
  }

  public async createTransactionMethod(type: SubstrateTransactionType, args: any = {}): Promise<SubstrateTransactionMethod> {
    const methodId = await this.nodeClient.getTransactionMetadata(type)

    return SubstrateTransactionMethod.create(this.network, type, methodId.palletIndex, methodId.callIndex, args)
  }

  public async signTransaction(
    privateKey: Buffer,
    transaction: SubstrateTransaction<Network>,
    payload: string
  ): Promise<SubstrateTransaction<Network>> {
    return this.signWithPrivateKey(privateKey, transaction, payload, SubstrateSignatureType.Sr25519)
  }

  public encodeDetails(txs: SubstrateTransactionDetails<Network>[]): string {
    const bytesEncoded = txs.map((tx) => {
      const scaleRuntimeVersion =
        tx.runtimeVersion !== undefined ? SCALEOptional.from(SCALEInt.from(tx.runtimeVersion, 32)) : SCALEOptional.empty()
      const scaleType = SCALEEnum.from(tx.transaction.type)
      const scaleFee = SCALECompactInt.from(tx.fee)

      return SCALEBytes.from(
        scaleRuntimeVersion.encode() +
          scaleType.encode({ network: this.network, runtimeVersion: tx.runtimeVersion }) +
          scaleFee.encode({ network: this.network, runtimeVersion: tx.runtimeVersion }) +
          tx.transaction.encode({ network: this.network, runtimeVersion: tx.runtimeVersion }) +
          SCALEString.from(tx.payload).encode({ network: this.network, runtimeVersion: tx.runtimeVersion })
      )
    })

    return SCALEArray.from(bytesEncoded).encode()
  }

  public decodeDetails(serialized: string): SubstrateTransactionDetails<Network>[] {
    const decoder = new SCALEDecoder(this.network, undefined, serialized)

    const encodedTxs = decoder
      .decodeNextArray((_network, _runtimeVersion, hex) => SCALEBytes.decode(hex))
      .decoded.elements.map((bytesEncoded) => bytesEncoded.bytes.toString('hex'))

    return encodedTxs.map((encodedTx) => {
      const runtimeVersionOptional = SCALEOptional.decode(this.network, undefined, encodedTx, (_network, _runtimeVersion, hex) =>
        SCALEInt.decode(hex, 32)
      )

      const _encodedTx = encodedTx.slice(runtimeVersionOptional.bytesDecoded * 2)
      const runtimeVersion = runtimeVersionOptional.decoded.value?.toNumber()

      const txDecoder = new SCALEDecoder(this.network, runtimeVersion, _encodedTx)

      const type = txDecoder.decodeNextEnum((hex) => SubstrateTransactionType[SubstrateTransactionType[hex]])
      const fee = txDecoder.decodeNextCompactInt()
      const transaction = txDecoder.decodeNextObject((network, runtimeVersion, hex) =>
        SubstrateTransaction.decode(network, runtimeVersion, type.decoded.value, hex)
      )
      const payload = txDecoder.decodeNextString()

      return {
        runtimeVersion,
        fee: fee.decoded.value,
        transaction: transaction.decoded,
        payload: payload.decoded.value
      }
    })
  }

  public async calculateTransactionFee(transaction: SubstrateTransaction<Network>): Promise<BigNumber | null> {
    const runtimeVersion = await this.nodeClient.getRuntimeVersion()
    const encoded = transaction.encode({ network: this.network, runtimeVersion: runtimeVersion?.specVersion })
    const partialEstimate = await this.nodeClient.getTransferFeeEstimate(encoded)

    if (partialEstimate) {
      this.nodeClient.saveLastFee(transaction.type, partialEstimate)
    }

    return partialEstimate?.plus(transaction.tip.value) || null
  }

  public async estimateTransactionFees(
    accountId: SubstrateAccountId<SubstrateCompatAddressType[Network]>,
    transationTypes: [SubstrateTransactionType, any][]
  ): Promise<BigNumber | null> {
    const fees = await Promise.all(
      transationTypes
        .map(([type, args]) => [type, args, this.nodeClient.getSavedLastFee(type, 'largest')] as [SubstrateTransactionType, any, BigNumber])
        .map(async ([type, args, fee]) =>
          fee ? fee : this.calculateTransactionFee(await this.createTransaction(type, this.substrateAddressFrom(accountId), 0, args))
        )
    )

    if (fees.some((fee) => fee === null)) {
      return Promise.reject('Could not estimate transaction fees.')
    }

    const safetyFactor = 1.2

    return fees.reduce((sum: BigNumber, next) => sum.plus(next!), new BigNumber(0)).multipliedBy(safetyFactor)
  }

  private async prepareTransactionDetails(
    type: SubstrateTransactionType,
    accountId: SubstrateAccountId<SubstrateCompatAddressType[Network]>,
    tip: string | number | BigNumber,
    nonce: number | BigNumber,
    args: any = {}
  ): Promise<SubstrateTransactionDetails<Network>> {
    const chainHeight = await this.nodeClient.getCurrentHeight()

    const results = await Promise.all([
      this.createTransaction(type, accountId, tip, args, chainHeight, nonce),
      this.nodeClient.getLastBlockHash(),
      this.nodeClient.getFirstBlockHash(),
      this.nodeClient.getRuntimeVersion()
    ])

    if (results.some((result) => result === null)) {
      return Promise.reject('Could not fetch all necessary data.')
    }

    const transaction = results[0]

    const fee = await this.calculateTransactionFee(transaction)
    if (!fee) {
      return Promise.reject('Could not fetch all necessary data.')
    }

    const lastHash = results[1]!
    const genesisHash = results[2]!
    const runtimeVersion = results[3]!

    const payload = SubstrateTransactionPayload.create(transaction, {
      specVersion: runtimeVersion.specVersion,
      transactionVersion: runtimeVersion.transactionVersion,
      genesisHash,
      lastHash
    })

    return {
      runtimeVersion: runtimeVersion.specVersion,
      fee,
      transaction,
      payload: payload.encode({ network: this.network, runtimeVersion: runtimeVersion.specVersion })
    }
  }

  protected async signWithPrivateKey(
    privateKey: Buffer,
    transaction: SubstrateTransaction<Network>,
    payload: string,
    signatureType: SubstrateSignatureType
  ): Promise<SubstrateTransaction<Network>> {
    const signature = await this.signPayload(privateKey, transaction.signer.asBytes(), payload, signatureType)

    return SubstrateTransaction.fromTransaction(transaction, { signature })
  }

  private async signPayload(
    privateKey: Buffer,
    publicKey: Buffer,
    payload: string,
    signatureType: SubstrateSignatureType
  ): Promise<SubstrateCompatSignatureType[Network]> {
    switch (signatureType) {
      case SubstrateSignatureType.Ed25519:
        return this.signEd25519Payload(privateKey, publicKey, payload) as unknown as SubstrateCompatSignatureType[Network]
      case SubstrateSignatureType.Sr25519:
        return this.signSr25519Payload(privateKey, publicKey, payload) as unknown as SubstrateCompatSignatureType[Network]
      case SubstrateSignatureType.Ecdsa:
        return this.signEcdsaPayload(privateKey, payload) as unknown as SubstrateCompatSignatureType[Network]
      default:
        return Promise.reject('Signature type not supported.')
    }
  }

  private async signEd25519Payload(privateKey: Buffer, publicKey: Buffer, payload: string): Promise<SubstrateSignature> {
    throw new Error('signEd25519Payload not implemented')
  }

  private async signSr25519Payload(privateKey: Buffer, publicKey: Buffer, payload: string): Promise<SubstrateSignature> {
    await waitReady()

    const payloadBuffer: Buffer = Buffer.from(payload, 'hex')
    const message: Buffer = payloadBuffer.length > 256 ? Buffer.from(blake2bAsBytes(payloadBuffer, 256)) : payloadBuffer

    const signature: Uint8Array = sr25519Sign(publicKey, privateKey, message)

    return SubstrateSignature.create(SubstrateSignatureType.Sr25519, signature)
  }

  private async signEcdsaPayload(privateKey: Buffer, payload: string): Promise<MoonbeamSignature> {
    const message: Buffer = keccak('keccak256').update(Buffer.from(payload, 'hex')).digest()
    const signatureObj: { signature: Uint8Array; recid?: number } = secp256k1.ecdsaSign(message, privateKey)
    const signature: Buffer = Buffer.concat([Buffer.from(signatureObj.signature), Buffer.from([signatureObj.recid ?? 0])])

    return MoonbeamSignature.create(SubstrateSignatureType.Ecdsa, signature)
  }

  private substrateAddressFrom(accountId: SubstrateAccountId<SubstrateCompatAddressType[Network]>): SubstrateCompatAddressType[Network] {
    return substrateAddressFactory(this.network).from(accountId)
  }
}
