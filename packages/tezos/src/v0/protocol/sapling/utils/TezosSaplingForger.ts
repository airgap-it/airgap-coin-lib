import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { blake2bAsBytes } from '@airgap/coinlib-core/utils/blake2b'
import { hexToBytes } from '@airgap/coinlib-core/utils/hex'
import * as sapling from '@airgap/sapling-wasm'
import { SaplingPartialOutputDescription, SaplingSpendDescription, SaplingUnsignedSpendDescription } from '@airgap/sapling-wasm'

import { TezosSaplingCiphertext } from '../../types/sapling/TezosSaplingCiphertext'
import { TezosSaplingInput } from '../../types/sapling/TezosSaplingInput'
import { TezosSaplingOutput } from '../../types/sapling/TezosSaplingOutput'
import { TezosSaplingStateTree } from '../../types/sapling/TezosSaplingStateTree'
import {
  TezosSaplingOutputDescription,
  TezosSaplingSpendDescription,
  TezosSaplingTransaction
} from '../../types/sapling/TezosSaplingTransaction'
import { TezosSaplingAddress } from '../TezosSaplingAddress'
import { TezosSaplingCryptoClient } from '../TezosSaplingCryptoClient'
import { TezosSaplingExternalMethodProvider } from '../TezosSaplingProtocolOptions'

import { TezosSaplingEncoder } from './TezosSaplingEncoder'
import { TezosSaplingState } from './TezosSaplingState'

export class TezosSaplingForger {
  constructor(
    private readonly cryptoClient: TezosSaplingCryptoClient,
    private readonly state: TezosSaplingState,
    private readonly encoder: TezosSaplingEncoder,
    private readonly externalProvider?: TezosSaplingExternalMethodProvider
  ) {}

  public async forgeSaplingTransaction(
    inputs: TezosSaplingInput[],
    outputs: TezosSaplingOutput[],
    merkleTree: TezosSaplingStateTree,
    antiReplay: string,
    boundData: string = '',
    spendingKey?: Buffer
  ): Promise<TezosSaplingTransaction> {
    return this.withProvingContext(async (context: number) => {
      const viewingKey: Buffer | undefined =
        spendingKey !== undefined ? await sapling.getExtendedFullViewingKeyFromSpendingKey(spendingKey) : undefined

      const spendDescriptions: TezosSaplingSpendDescription[] =
        spendingKey !== undefined ? await this.forgeSaplingInputs(context, spendingKey, inputs, merkleTree, antiReplay) : []

      const outputDescriptions: TezosSaplingOutputDescription[] = await this.forgeSaplingOutputs(context, viewingKey, outputs)

      const balance: BigNumber = this.calculateTransactionBalance(inputs, outputs)
      const sighash: Buffer = this.createTransactionSighash(spendDescriptions, outputDescriptions, antiReplay, boundData)
      const bindingSignature: Buffer = await this.createBindingSignature(context, balance.toFixed(), sighash)

      return {
        spendDescriptions,
        outputDescriptions,
        bindingSignature,
        balance,
        root: merkleTree.root,
        boundData
      }
    })
  }

  private async forgeSaplingInputs(
    context: number,
    spendingKey: Buffer,
    inputs: TezosSaplingInput[],
    merkleTree: TezosSaplingStateTree,
    antiReplay: string
  ): Promise<TezosSaplingSpendDescription[]> {
    const ar: Buffer = await sapling.randR()
    const descriptions: TezosSaplingSpendDescription[] = []

    for (const input of inputs) {
      const unsignedSpendDescription: SaplingUnsignedSpendDescription = await this.prepareSpendDescription(
        context,
        spendingKey,
        (
          await TezosSaplingAddress.fromValue(input.address)
        ).raw,
        input.rcm,
        ar,
        input.value,
        merkleTree.root,
        await this.state.getWitness(merkleTree, new BigNumber(input.pos))
      )

      const sighash: Buffer = this.createInputSighash(unsignedSpendDescription, antiReplay)
      const signedSpendDescription: SaplingSpendDescription = await sapling.signSpendDescription(
        unsignedSpendDescription,
        spendingKey,
        ar,
        sighash
      )

      if (signedSpendDescription.spendAuthSig === undefined) {
        throw new Error('Spend signing failed')
      }

      descriptions.push({
        cv: signedSpendDescription.cv,
        nf: signedSpendDescription.nf,
        rk: signedSpendDescription.rk,
        proof: signedSpendDescription.proof,
        signature: signedSpendDescription.spendAuthSig
      })
    }

    return descriptions
  }

  private async forgeSaplingOutputs(
    context: number,
    viewingKey: Buffer | undefined,
    outputs: TezosSaplingOutput[]
  ): Promise<TezosSaplingOutputDescription[]> {
    const rcm: Buffer = await sapling.randR()
    const descriptions: TezosSaplingOutputDescription[] = []

    for (const output of outputs) {
      const esk: Buffer = await sapling.randR()
      const outputDescription: SaplingPartialOutputDescription = await this.preparePartialOutputDescription(
        context,
        (
          await TezosSaplingAddress.fromValue(output.address)
        ).raw,
        rcm,
        esk,
        output.value
      )

      const ciphertext: TezosSaplingCiphertext = await this.cryptoClient.encryptCiphertext(
        output,
        outputDescription,
        rcm,
        esk,
        output.browsable ? viewingKey : undefined
      )

      descriptions.push({
        cm: outputDescription.cm,
        proof: outputDescription.proof,
        ciphertext
      })
    }

    return descriptions
  }

  private createTransactionSighash(
    spends: TezosSaplingSpendDescription[],
    outputs: TezosSaplingOutputDescription[],
    antiReplay: string,
    boundData: string
  ): Buffer {
    const spendBytes: Buffer = this.encoder.encodeSpendDescriptions(spends)
    const outputBytes: Buffer = this.encoder.encodeOutputDescriptions(outputs)

    const boundDataBytes: Buffer = hexToBytes(boundData)

    return Buffer.from(
      blake2bAsBytes(Buffer.concat([spendBytes, outputBytes, boundDataBytes]), 256, {
        key: Buffer.from(antiReplay)
      })
    )
  }

  private createInputSighash(spend: SaplingUnsignedSpendDescription, antiReplay: string): Buffer {
    const toSign: Buffer = Buffer.concat([spend.cv, spend.nf, spend.rk, spend.proof])

    return Buffer.from(blake2bAsBytes(toSign, 256, { key: Buffer.from(antiReplay) }))
  }

  private calculateTransactionBalance(inputs: TezosSaplingInput[], outputs: TezosSaplingOutput[]): BigNumber {
    const spendBalance: BigNumber = inputs.reduce((sum: BigNumber, next: TezosSaplingInput) => sum.plus(next.value), new BigNumber(0))
    const outBalance: BigNumber = outputs.reduce((sum: BigNumber, next: TezosSaplingOutput) => sum.plus(next.value), new BigNumber(0))

    return spendBalance.minus(outBalance)
  }

  private async withProvingContext(action: (context: number) => Promise<TezosSaplingTransaction>): Promise<TezosSaplingTransaction> {
    const method = this.externalProvider?.withProvingContext ?? sapling.withProvingContext

    return method(action)
  }

  private async prepareSpendDescription(
    context: number,
    spendingKey: Buffer,
    address: Buffer,
    rcm: string,
    ar: Buffer,
    value: string,
    root: string,
    merklePath: string
  ): Promise<SaplingUnsignedSpendDescription> {
    const method = this.externalProvider?.prepareSpendDescription ?? sapling.prepareSpendDescription

    return method(context, spendingKey, address, rcm, ar, value, root, merklePath)
  }

  private async preparePartialOutputDescription(
    context: number,
    address: Buffer,
    rcm: Buffer,
    esk: Buffer,
    value: string
  ): Promise<SaplingPartialOutputDescription> {
    const method = this.externalProvider?.preparePartialOutputDescription ?? sapling.preparePartialOutputDescription

    return method(context, address, rcm, esk, value)
  }

  private async createBindingSignature(context: number, balance: string, sighash: Buffer): Promise<Buffer> {
    const method = this.externalProvider?.createBindingSignature ?? sapling.createBindingSignature

    return method(context, balance, sighash)
  }
}
