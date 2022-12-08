import { BalanceError, Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import keccak = require('@airgap/coinlib-core/dependencies/src/keccak-1.0.2/js')
import * as secp256k1 from '@airgap/coinlib-core/dependencies/src/secp256k1-4.0.2/elliptic'
import { blake2bAsBytes } from '@airgap/coinlib-core/utils/blake2b'
import { SecretKey } from '@airgap/module-kit'
import { sr25519Sign, waitReady } from '@polkadot/wasm-crypto'
import { SubstrateAccountId } from '../../data/account/address/SubstrateAddress'
import { substrateAddressFactory, TypedSubstrateAddress } from '../../data/account/address/SubstrateAddressFactory'
import { SCALEDecoder } from '../../data/scale/SCALEDecoder'
import { SCALEArray } from '../../data/scale/type/SCALEArray'
import { SCALEBytes } from '../../data/scale/type/SCALEBytes'
import { SCALECompactInt } from '../../data/scale/type/SCALECompactInt'
import { SCALEInt } from '../../data/scale/type/SCALEInt'
import { SCALEOptional } from '../../data/scale/type/SCALEOptional'
import { SCALEString } from '../../data/scale/type/SCALEString'
import { SubstrateSignature, SubstrateSignatureType } from '../../data/transaction/SubstrateSignature'
import { SubstrateTransactionType, SubstrateTransaction } from '../../data/transaction/SubstrateTransaction'
import { SubstrateTransactionPayload } from '../../data/transaction/SubstrateTransactionPayload'
import { SubstrateNodeClient } from '../../node/SubstrateNodeClient'
import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { convertSecretKey } from '../../utils/keys'
import {
  SubstrateTransactionController,
  SubstrateTransactionDetails,
  SubstrateTransactionParameters
} from './SubstrateTransactionController'

export class SubstrateCommonTransactionController<C extends SubstrateProtocolConfiguration> implements SubstrateTransactionController<C> {
  public constructor(protected readonly configuration: C, protected readonly nodeClient: SubstrateNodeClient<C>) {}

  public async prepareSubmittableTransactions(
    accountId: SubstrateAccountId<TypedSubstrateAddress<C>>,
    available: string | BigNumber,
    params: SubstrateTransactionParameters<C>[]
  ): Promise<string> {
    const accountInfo = await this.nodeClient.getAccountInfo(this.substrateAddressFrom(accountId))

    if (!accountInfo) {
      return Promise.reject('Could not fetch all necessary data')
    }

    const nonce = accountInfo.nonce.value
    const txs = await Promise.all(
      params.map((tx, index) => this.prepareTransactionDetails(tx.type, accountId, tx.tip, nonce.plus(index), tx.args))
    )

    const totalFee = txs.map((tx) => tx.fee).reduce((total, next) => total.plus(next), new BigNumber(0))

    if (new BigNumber(available).lt(totalFee)) {
      throw new BalanceError(Domain.SUBSTRATE, `Not enough balance`)
    }

    return this.encodeDetails(txs)
  }

  private async prepareTransactionDetails(
    type: SubstrateTransactionType<C>,
    accountId: SubstrateAccountId<TypedSubstrateAddress<C>>,
    tip: string | number | BigNumber,
    nonce: number | BigNumber,
    args: any = {}
  ): Promise<SubstrateTransactionDetails<C>> {
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
      payload: payload.encode({ configuration: this.configuration, runtimeVersion: runtimeVersion.specVersion })
    }
  }

  public async createTransaction(
    type: SubstrateTransactionType<C>,
    accountId: SubstrateAccountId<TypedSubstrateAddress<C>>,
    tip: string | number | BigNumber = 0,
    args: any = {},
    chainHeight: number | BigNumber = 1,
    nonce: number | BigNumber = 0
  ): Promise<SubstrateTransaction<C>> {
    const methodId = await this.nodeClient.getTransactionMetadata(type)
    const signatureType = this.getSignatureType('placeholder')

    return SubstrateTransaction.create(this.configuration, type, {
      from: accountId,
      tip: BigNumber.isBigNumber(tip) ? tip : new BigNumber(tip),
      methodId,
      args,
      era: { chainHeight },
      nonce,
      signatureType
    })
  }

  private getSignatureType(purpose: 'sign' | 'placeholder'): SubstrateSignatureType {
    switch (this.configuration.account.type) {
      case 'eth':
        return SubstrateSignatureType.Ecdsa
      case 'ss58':
        return purpose === 'sign' ? SubstrateSignatureType.Sr25519 : SubstrateSignatureType.Ed25519
    }
  }

  public async signTransaction(
    secretKey: SecretKey,
    transaction: SubstrateTransaction<C>,
    payload: string
  ): Promise<SubstrateTransaction<C>> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')
    const signatureType = this.getSignatureType('sign')

    const signature = await this.signPayload(Buffer.from(hexSecretKey.value, 'hex'), transaction.signer.asBytes(), payload, signatureType)

    return SubstrateTransaction.fromTransaction(transaction, { signature })
  }

  private async signPayload(
    privateKey: Buffer,
    publicKey: Buffer,
    payload: string,
    signatureType: SubstrateSignatureType
  ): Promise<SubstrateSignature> {
    switch (signatureType) {
      case SubstrateSignatureType.Ed25519:
        return this.signEd25519Payload(privateKey, publicKey, payload)
      case SubstrateSignatureType.Sr25519:
        return this.signSr25519Payload(privateKey, publicKey, payload)
      case SubstrateSignatureType.Ecdsa:
        return this.signEcdsaPayload(privateKey, payload)
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

  private async signEcdsaPayload(privateKey: Buffer, payload: string): Promise<SubstrateSignature> {
    const message: Buffer = keccak('keccak256').update(Buffer.from(payload, 'hex')).digest()
    const signatureObj: { signature: Uint8Array; recid?: number } = secp256k1.ecdsaSign(message, privateKey)
    const signature: Buffer = Buffer.concat([Buffer.from(signatureObj.signature), Buffer.from([signatureObj.recid ?? 0])])

    return SubstrateSignature.create(SubstrateSignatureType.Ecdsa, signature)
  }

  public encodeDetails(txs: SubstrateTransactionDetails<C>[]): string {
    const bytesEncoded = txs.map((tx) => {
      const scaleRuntimeVersion =
        tx.runtimeVersion !== undefined ? SCALEOptional.from(SCALEInt.from(tx.runtimeVersion, 32)) : SCALEOptional.empty()
      const scaleType = SCALEString.from(tx.transaction.type)
      const scaleFee = SCALECompactInt.from(tx.fee)

      return SCALEBytes.from(
        scaleRuntimeVersion.encode() +
          scaleType.encode({ configuration: this.configuration, runtimeVersion: tx.runtimeVersion }) +
          scaleFee.encode({ configuration: this.configuration, runtimeVersion: tx.runtimeVersion }) +
          tx.transaction.encode({ configuration: this.configuration, runtimeVersion: tx.runtimeVersion }) +
          SCALEString.from(tx.payload).encode({ configuration: this.configuration, runtimeVersion: tx.runtimeVersion })
      )
    })

    return SCALEArray.from(bytesEncoded).encode()
  }

  public decodeDetails(serialized: string): SubstrateTransactionDetails<C>[] {
    const decoder = new SCALEDecoder(this.configuration, undefined, serialized)

    const encodedTxs = decoder
      .decodeNextArray((_configuration, _runtimeVersion, hex) => SCALEBytes.decode(hex))
      .decoded.elements.map((bytesEncoded) => bytesEncoded.bytes.toString('hex'))

    return encodedTxs.map((encodedTx) => {
      const runtimeVersionOptional = SCALEOptional.decode(
        this.configuration,
        undefined,
        encodedTx,
        (_configuration, _runtimeVersion, hex) => SCALEInt.decode(hex, 32)
      )

      const _encodedTx = encodedTx.slice(runtimeVersionOptional.bytesDecoded * 2)
      const runtimeVersion = runtimeVersionOptional.decoded.value?.toNumber()

      const txDecoder = new SCALEDecoder(this.configuration, runtimeVersion, _encodedTx)

      const type = txDecoder.decodeNextString()
      const fee = txDecoder.decodeNextCompactInt()
      const transaction = txDecoder.decodeNextObject((configuration, runtimeVersion, hex) =>
        SubstrateTransaction.decode(configuration, runtimeVersion, type.decoded.value, hex)
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

  public async calculateTransactionFee(transaction: SubstrateTransaction<C>): Promise<BigNumber | undefined> {
    const runtimeVersion = await this.nodeClient.getRuntimeVersion()
    const encoded = transaction.encode({ configuration: this.configuration, runtimeVersion: runtimeVersion?.specVersion })
    const partialEstimate = await this.nodeClient.getTransferFeeEstimate(encoded)

    if (partialEstimate) {
      this.nodeClient.saveLastFee(transaction.type, partialEstimate)
    }

    return partialEstimate?.plus(transaction.tip.value)
  }

  public async estimateTransactionFees(
    accountId: SubstrateAccountId<TypedSubstrateAddress<C>>,
    transationTypes: [SubstrateTransactionType<C>, any][]
  ): Promise<BigNumber | undefined> {
    const fees = await Promise.all(
      transationTypes
        .map(
          ([type, args]) => [type, args, this.nodeClient.getSavedLastFee(type, 'largest')] as [SubstrateTransactionType<C>, any, BigNumber]
        )
        .map(async ([type, args, fee]) =>
          fee ? fee : this.calculateTransactionFee(await this.createTransaction(type, this.substrateAddressFrom(accountId), 0, args))
        )
    )

    if (fees.some((fee) => fee === undefined)) {
      return Promise.reject('Could not estimate transaction fees.')
    }

    const safetyFactor = 1.2

    return fees.reduce((sum: BigNumber, next) => sum.plus(next!), new BigNumber(0)).multipliedBy(safetyFactor)
  }

  protected substrateAddressFrom(accountId: SubstrateAccountId<TypedSubstrateAddress<C>>): TypedSubstrateAddress<C> {
    return substrateAddressFactory(this.configuration).from(accountId)
  }
}
