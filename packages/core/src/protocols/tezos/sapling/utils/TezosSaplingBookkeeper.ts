import * as sapling from '@airgap/sapling-wasm'

import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'
import { flattenArray } from '../../../../utils/array'
import { stripHexPrefix } from '../../../../utils/hex'
import { ProtocolNetwork } from '../../../../utils/ProtocolNetwork'
import { ProtocolSymbols } from '../../../../utils/ProtocolSymbols'
import { TezosSaplingCiphertext } from '../../types/sapling/TezosSaplingCiphertext'
import { TezosSaplingInput } from '../../types/sapling/TezosSaplingInput'
import { TezosSaplingOutput } from '../../types/sapling/TezosSaplingOutput'
import { TezosSaplingOutputDescription, TezosSaplingTransaction } from '../../types/sapling/TezosSaplingTransaction'
import { TezosSaplingWrappedTransaction } from '../../types/sapling/TezosSaplingWrappedTransaction'
import { TezosSaplingAddress } from '../TezosSaplingAddress'
import { TezosSaplingCryptoClient } from '../TezosSaplingCryptoClient'

import { TezosSaplingEncoder } from './TezosSaplingEncoder'

export class TezosSaplingBookkeeper {
  constructor(
    private readonly identifier: ProtocolSymbols,
    private readonly network: ProtocolNetwork,
    private readonly cryptoClient: TezosSaplingCryptoClient,
    private readonly encoder: TezosSaplingEncoder
  ) {}

  public getUnsignedTransactionDetails(
    sender: TezosSaplingAddress,
    inputs: TezosSaplingInput[],
    outputs: TezosSaplingOutput[],
    wrappedTransactions: TezosSaplingWrappedTransaction[]
  ): IAirGapTransaction[] {
    const outputsDetails: IAirGapTransaction[] = outputs.map((out: TezosSaplingOutput) => ({
      from: [sender.getValue()],
      to: [out.address],
      isInbound: false,
      amount: out.value,
      fee: '0',
      protocolIdentifier: this.identifier,
      network: this.network
    }))

    const unshieldDetails: IAirGapTransaction[] = wrappedTransactions
      .map((wrappedTransaction: TezosSaplingWrappedTransaction) => {
        if (wrappedTransaction.unshieldTarget === undefined) {
          return undefined
        }

        const amount: BigNumber = this.sumNotes(inputs).minus(this.sumNotes(outputs))

        return {
          from: [sender.getValue()],
          to: [wrappedTransaction.unshieldTarget.getValue()],
          isInbound: false,
          amount: amount.toFixed(),
          fee: '0',
          protocolIdentifier: this.identifier,
          network: this.network
        }
      })
      .filter((details: IAirGapTransaction | undefined) => details !== undefined) as IAirGapTransaction[]

    return outputsDetails.concat(unshieldDetails)
  }

  public async getWrappedTransactionsPartialDetails(
    wrappedTransactions: TezosSaplingWrappedTransaction[],
    knownViewingKeys: string[] = []
  ): Promise<Partial<IAirGapTransaction>[]> {
    const partials: Partial<IAirGapTransaction>[][] = await Promise.all(
      wrappedTransactions.map(async (wrappedTransaction: TezosSaplingWrappedTransaction) => {
        const transaction: TezosSaplingTransaction = this.encoder.decodeTransaction(Buffer.from(wrappedTransaction.signed, 'hex'))
        const [from, details]: [string | undefined, Partial<IAirGapTransaction>[]] = await this.getTransactionPartialDetails(
          transaction,
          knownViewingKeys
        )

        if (wrappedTransaction.unshieldTarget !== undefined) {
          let unshieldDetails: Partial<IAirGapTransaction> = {
            to: [wrappedTransaction.unshieldTarget.getValue()],
            amount: transaction.balance.toFixed()
          }

          if (from !== undefined) {
            unshieldDetails = Object.assign(unshieldDetails, { from: [(await TezosSaplingAddress.fromViewingKey(from)).getValue()] })
          }

          details.push(unshieldDetails)
        }

        return details
      })
    )

    return flattenArray(partials)
  }

  private async getTransactionPartialDetails(
    transaction: TezosSaplingTransaction,
    knownViewingKeys: string[]
  ): Promise<[string | undefined, Partial<IAirGapTransaction>[]]> {
    const sender: string | undefined =
      transaction.spendDescriptions.length === 0 ? undefined : await this.findSender(transaction, knownViewingKeys)

    const details: Partial<IAirGapTransaction>[] = await Promise.all(
      transaction.outputDescriptions.map(async (description: TezosSaplingOutputDescription) => {
        const recipient: string | undefined = await this.findRecipient(description, knownViewingKeys)

        const from: TezosSaplingAddress | undefined = sender !== undefined ? await TezosSaplingAddress.fromViewingKey(sender) : undefined
        const [to, amount]: [TezosSaplingAddress | undefined, BigNumber | undefined] = await this.decodeDetailsFromOutputDescription(
          sender,
          recipient,
          description
        )

        let outputDetails: Partial<IAirGapTransaction> = {}
        if (from !== undefined) {
          outputDetails = Object.assign(outputDetails, { from: [from.getValue()] })
        }
        if (to !== undefined) {
          outputDetails = Object.assign(outputDetails, { to: [to.getValue()] })
        }
        if (amount !== undefined) {
          outputDetails = Object.assign(outputDetails, { amount: amount.toFixed() })
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
            (
              await TezosSaplingAddress.fromValue(input.address)
            ).raw,
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
            Buffer.isBuffer(viewingKey) ? viewingKey : Buffer.from(viewingKey, 'hex'),
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
        address: (await TezosSaplingAddress.fromRaw(address)).getValue()
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
        address: (await TezosSaplingAddress.fromRaw(address)).getValue()
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
