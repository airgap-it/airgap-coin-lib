import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { flattenArray } from '@airgap/coinlib-core/utils/array'
import { stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'
import * as sapling from '@airgap/sapling-wasm'

import { TezosSaplingCryptoClient } from '../../../crypto/TezosSaplingCryptoClient'
import { TezosSaplingAddress } from '../../../data/TezosSaplingAddress'
import { MichelsonType } from '../../../types/michelson/MichelsonType'
import { MichelsonBytes } from '../../../types/michelson/primitives/MichelsonBytes'
import { MichelsonString } from '../../../types/michelson/primitives/MichelsonString'
import { TezosSaplingProtocolNetwork, TezosUnits } from '../../../types/protocol'
import { TezosSaplingCiphertext } from '../../../types/sapling/TezosSaplingCiphertext'
import { TezosSaplingInput } from '../../../types/sapling/TezosSaplingInput'
import { TezosSaplingOutput } from '../../../types/sapling/TezosSaplingOutput'
import { TezosSaplingOutputDescription, TezosSaplingTransaction } from '../../../types/sapling/TezosSaplingTransaction'
import { parseTzAddress, unpackMichelsonType } from '../../../utils/pack'

import { TezosSaplingEncoder } from './TezosSaplingEncoder'

export class TezosSaplingBookkeeper<_Units extends string> {
  constructor(
    private readonly network: TezosSaplingProtocolNetwork,
    private readonly cryptoClient: TezosSaplingCryptoClient,
    private readonly encoder: TezosSaplingEncoder
  ) {}

  public getUnsignedTransactionDetails(
    sender: TezosSaplingAddress,
    inputs: TezosSaplingInput[],
    outputs: TezosSaplingOutput[],
    unshieldTarget?: string
  ): AirGapTransaction<_Units, TezosUnits>[] {
    if (unshieldTarget === undefined) {
      return outputs.map((out: TezosSaplingOutput) => ({
        from: [sender.asString()],
        to: [out.address],
        isInbound: false,

        amount: newAmount(out.value, 'blockchain'),
        fee: newAmount(0, 'blockchain'),

        network: this.network
      }))
    } else {
      const amount: BigNumber = this.sumNotes(inputs).minus(this.sumNotes(outputs))

      return [
        {
          from: [sender.asString()],
          to: [unshieldTarget],
          isInbound: false,
          amount: newAmount(amount, 'blockchain'),
          fee: newAmount(0, 'blockchain'),
          network: this.network
        }
      ]
    }
  }

  public async getTransactionsPartialDetails(
    txs: string[],
    knownViewingKeys: string[] = []
  ): Promise<Partial<AirGapTransaction<_Units, TezosUnits>>[]> {
    const partials: Partial<AirGapTransaction<_Units, TezosUnits>>[][] = await Promise.all(
      txs.map(async (tx: string) => {
        const signedBuffer: Buffer = Buffer.isBuffer(tx) ? tx : Buffer.from(tx, 'hex')
        const transaction: TezosSaplingTransaction = this.encoder.decodeTransaction(signedBuffer)
        const [from, details]: [
          string | undefined,
          Partial<AirGapTransaction<_Units, TezosUnits>>[]
        ] = await this.getTransactionPartialDetails(transaction, knownViewingKeys)

        if (transaction.boundData.length > 0) {
          const boundDataMichelson: MichelsonType = unpackMichelsonType(transaction.boundData)

          let unshieldTarget: string | undefined
          if (boundDataMichelson instanceof MichelsonBytes) {
            unshieldTarget = parseTzAddress(boundDataMichelson.value)
          } else if (boundDataMichelson instanceof MichelsonString) {
            unshieldTarget = boundDataMichelson.value
          }

          if (unshieldTarget !== undefined) {
            let unshieldDetails: Partial<AirGapTransaction<_Units, TezosUnits>> = {
              to: [unshieldTarget],
              amount: newAmount(transaction.balance, 'blockchain')
            }

            if (from !== undefined) {
              unshieldDetails = Object.assign(unshieldDetails, { from: [(await TezosSaplingAddress.fromViewingKey(from)).asString()] })
            }

            details.push(unshieldDetails)
          }
        }

        return details
      })
    )

    return flattenArray(partials)
  }

  private async getTransactionPartialDetails(
    transaction: TezosSaplingTransaction,
    knownViewingKeys: string[]
  ): Promise<[string | undefined, Partial<AirGapTransaction<_Units, TezosUnits>>[]]> {
    const sender: string | undefined =
      transaction.spendDescriptions.length === 0 ? undefined : await this.findSender(transaction, knownViewingKeys)

    const details: Partial<AirGapTransaction<_Units, TezosUnits>>[] = await Promise.all(
      transaction.outputDescriptions.map(async (description: TezosSaplingOutputDescription) => {
        const recipient: string | undefined = await this.findRecipient(description, knownViewingKeys)

        const from: TezosSaplingAddress | undefined = sender !== undefined ? await TezosSaplingAddress.fromViewingKey(sender) : undefined
        const [to, amount]: [TezosSaplingAddress | undefined, BigNumber | undefined] = await this.decodeDetailsFromOutputDescription(
          sender,
          recipient,
          description
        )

        let outputDetails: Partial<AirGapTransaction<_Units, TezosUnits>> = {}
        if (from !== undefined) {
          outputDetails = Object.assign(outputDetails, { from: [from.asString()] })
        }
        if (to !== undefined) {
          outputDetails = Object.assign(outputDetails, { to: [to.asString()] })
        }
        if (amount !== undefined) {
          outputDetails = Object.assign(outputDetails, { amount: newAmount(amount, 'blockchain') })
        }

        return outputDetails
      })
    )

    return [sender, details]
  }

  private async findSender(transaction: TezosSaplingTransaction, viewingKeys: string[]): Promise<string | undefined> {
    return (
      await Promise.all(
        viewingKeys.map(async (viewingKey: string) => {
          try {
            // a viewing key is the sender if it can decrypt any ciphertext payload out from the transaction
            const outputDescription: TezosSaplingOutputDescription = transaction.outputDescriptions[0]
            await this.cryptoClient.decryptCiphertextOut(viewingKey, outputDescription.ciphertext, outputDescription.cm)

            return viewingKey
          } catch (error) {
            return undefined
          }
        })
      )
    ).find((viewingKey: string | undefined) => viewingKey !== undefined)
  }

  private async findRecipient(outputDescription: TezosSaplingOutputDescription, viewingKeys: string[]): Promise<string | undefined> {
    return (
      await Promise.all(
        viewingKeys.map(async (viewingKey: string) => {
          try {
            // a viewing key is the recipient if it can decrypt the ciphertext payload enc from output description
            await this.cryptoClient.decryptCiphertextEnc(viewingKey, outputDescription.ciphertext)

            return viewingKey
          } catch (error) {
            return undefined
          }
        })
      )
    ).find((viewingKey: string | undefined) => viewingKey !== undefined)
  }

  private async decodeDetailsFromOutputDescription(
    sender: string | undefined,
    recipient: string | undefined,
    output: TezosSaplingOutputDescription
  ): Promise<[TezosSaplingAddress | undefined, BigNumber | undefined]> {
    const viewingKey: string | undefined = sender ?? recipient
    if (viewingKey !== undefined) {
      const { address, amount } = await this.cryptoClient.decryptCiphertextEnc(
        viewingKey,
        output.ciphertext,
        viewingKey === sender ? 'sender' : 'receiver',
        output.cm
      )

      return [await TezosSaplingAddress.fromRaw(address), amount]
    }

    return [undefined, undefined]
  }

  public sumNotes(notes: (TezosSaplingInput | TezosSaplingOutput)[]): BigNumber {
    return notes.reduce((sum: BigNumber, next: TezosSaplingInput | TezosSaplingOutput) => sum.plus(next.value), new BigNumber(0))
  }

  public async getIncomingInputs(
    viewingKey: Buffer | string,
    commitmentsWithCiphertext: [string, TezosSaplingCiphertext, BigNumber][]
  ): Promise<TezosSaplingInput[]> {
    const inputs: TezosSaplingInput[] = (
      await Promise.all(
        commitmentsWithCiphertext.map(async ([commitment, ciphertext, position]: [string, TezosSaplingCiphertext, BigNumber]) => {
          const decrypted = await this.getIncomingInputFromCiphertext(viewingKey, ciphertext, commitment, position)

          if (decrypted === undefined || !(await this.verifyCommitment(decrypted[1], commitment))) {
            return undefined
          }

          return decrypted[1]
        })
      )
    ).filter((input: TezosSaplingInput | undefined) => input !== undefined) as TezosSaplingInput[]

    return inputs
  }

  public async getOutgoingInputs(
    viewingKey: Buffer | string,
    commitmentsWithCiphertext: [string, TezosSaplingCiphertext, BigNumber][]
  ): Promise<TezosSaplingInput[]> {
    const inputs: TezosSaplingInput[] = (
      await Promise.all(
        commitmentsWithCiphertext.map(async ([commitment, ciphertext, position]: [string, TezosSaplingCiphertext, BigNumber]) => {
          const decrypted = await this.getOutgoingInputFromCiphertext(viewingKey, ciphertext, commitment, position)

          if (decrypted === undefined || (decrypted[1].address !== '' && !(await this.verifyCommitment(decrypted[1], commitment)))) {
            return undefined
          }

          return decrypted[1]
        })
      )
    ).filter((input: TezosSaplingInput | undefined) => input !== undefined) as TezosSaplingInput[]

    return inputs
  }

  public async getUnspends(
    viewingKey: Buffer | string,
    commitmentsWithCiphertext: [string, TezosSaplingCiphertext][],
    nullifiers: string[]
  ): Promise<TezosSaplingInput[]> {
    const nullifiersSet: Set<string> = new Set(nullifiers.map((nullifier: string) => stripHexPrefix(nullifier)))

    const inputs: TezosSaplingInput[] = await this.getInputs(viewingKey, commitmentsWithCiphertext)
    const unspends: TezosSaplingInput[] = (
      await Promise.all(
        inputs.map(async (input: TezosSaplingInput) => {
          const nullifier: Buffer = await sapling.computeNullifier(
            viewingKey,
            (await TezosSaplingAddress.fromValue(input.address)).raw,
            input.value,
            input.rcm,
            input.pos
          )

          return !nullifiersSet.has(nullifier.toString('hex')) ? input : undefined
        })
      )
    ).filter((input: TezosSaplingInput | undefined) => input !== undefined) as TezosSaplingInput[]

    return unspends
  }

  private async getInputs(
    viewingKey: Buffer | string,
    commitmentsWithCiphertext: [string, TezosSaplingCiphertext][]
  ): Promise<TezosSaplingInput[]> {
    const inputs: TezosSaplingInput[] = (
      await Promise.all(
        commitmentsWithCiphertext.map(async ([commitment, ciphertext]: [string, TezosSaplingCiphertext], index: number) => {
          const decrypted: [Buffer, TezosSaplingInput] | undefined = await this.getReceiverInputFromCiphertext(
            viewingKey,
            ciphertext,
            new BigNumber(index)
          )
          if (decrypted === undefined || !(await this.verifyCommitment(decrypted[1], commitment))) {
            return undefined
          }

          return decrypted[1]
        })
      )
    ).filter((input: TezosSaplingInput | undefined) => input !== undefined) as TezosSaplingInput[]

    return inputs
  }

  private async getReceiverInputFromCiphertext(
    viewingKey: Buffer | string,
    ciphertext: TezosSaplingCiphertext,
    position: BigNumber
  ): Promise<[Buffer, TezosSaplingInput] | undefined> {
    try {
      const { diversifier, amount, rcm, memo } = await this.cryptoClient.decryptCiphertextEnc(viewingKey, ciphertext, 'receiver')

      const ivk: Buffer = await sapling.getIncomingViewingKey(viewingKey)
      const address: Buffer = await sapling.getRawPaymentAddressFromIncomingViewingKey(ivk, diversifier)

      const input: TezosSaplingInput = {
        rcm: rcm.toString('hex'),
        pos: position.toString(),
        value: amount.toString(),
        address: (await TezosSaplingAddress.fromRaw(address)).asString()
      }

      return [Buffer.from(memo), input]
    } catch {
      return undefined
    }
  }

  private async getSenderInputFromCiphertext(
    viewingKey: Buffer | string,
    ciphertext: TezosSaplingCiphertext,
    commitment: string,
    position: BigNumber
  ): Promise<[Buffer, TezosSaplingInput] | undefined> {
    try {
      const { amount, address, rcm, memo } = await this.cryptoClient.decryptCiphertextEnc(viewingKey, ciphertext, 'sender', commitment)

      const input: TezosSaplingInput = {
        rcm: rcm.toString('hex'),
        pos: position.toString(),
        value: amount.toString(),
        address: (await TezosSaplingAddress.fromRaw(address)).asString()
      }

      return [Buffer.from(memo), input]
    } catch {
      return undefined
    }
  }

  private async getIncomingInputFromCiphertext(
    viewingKey: Buffer | string,
    ciphertext: TezosSaplingCiphertext,
    commitment: string,
    position: BigNumber
  ): Promise<[Buffer, TezosSaplingInput] | undefined> {
    const inputWithMemo: [Buffer, TezosSaplingInput] | undefined = await this.getReceiverInputFromCiphertext(
      viewingKey,
      ciphertext,
      position
    )
    if (inputWithMemo === undefined) {
      return undefined
    }

    try {
      await this.cryptoClient.decryptCiphertextEnc(viewingKey, ciphertext, 'sender', commitment)

      // ciphertext can be decrypted, the receiver is also the sender
      return undefined
    } catch (error) {
      // ciphertext could not be decrypted, the reciever is not the sender
      return inputWithMemo
    }
  }

  private async getOutgoingInputFromCiphertext(
    viewingKey: Buffer | string,
    ciphertext: TezosSaplingCiphertext,
    commitment: string,
    position: BigNumber
  ): Promise<[Buffer, TezosSaplingInput] | undefined> {
    const inputWithMemo: [Buffer, TezosSaplingInput] | undefined = await this.getSenderInputFromCiphertext(
      viewingKey,
      ciphertext,
      commitment,
      position
    )

    if (inputWithMemo === undefined) {
      return undefined
    }

    try {
      await this.cryptoClient.decryptCiphertextEnc(viewingKey, ciphertext, 'receiver')

      // ciphertext can be decrypted, the sender is also the receiver
      return undefined
    } catch {
      // ciphertext could not be decrypted, the sender is not the receiver
      return inputWithMemo
    }
  }

  private async verifyCommitment(input: TezosSaplingInput, expectedCommitment: string): Promise<boolean> {
    return sapling.verifyCommitment(expectedCommitment, (await TezosSaplingAddress.fromValue(input.address)).raw, input.value, input.rcm)
  }
}
